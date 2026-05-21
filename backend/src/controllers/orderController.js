const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");
const { sendOrderConfirmationEmail } = require("../utils/emailService");

const categoryTagMap = {
  meat: "Meat Lover",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  gluten_free: "Gluten-Free",
};

const sendOrderNotifications = async ({ user, order }) => {
  let emailSent = false;
  let emailMessage = "";
  let smsSent = false;
  let smsMessage = "";

  try {
    await sendOrderConfirmationEmail({ user, order });
    emailSent = true;
    emailMessage = `Order confirmation email sent to ${user.email}`;
  } catch (error) {
    emailSent = false;
    emailMessage = `Failed to send confirmation email: ${error.message}`;
    console.error("[EMAIL ERROR]", error.message);
  }

  if (user.phone) {
    smsSent = false;
    smsMessage =
      "SMS sending is not connected yet. Phone number was detected, but no SMS provider is configured.";
  } else {
    smsSent = false;
    smsMessage = "No phone number provided";
  }

  return {
    emailSent,
    smsSent,
    emailMessage,
    smsMessage,
  };
};

const applyCustomerRewardsAfterPaidOrder = async ({ userId, order }) => {
  const user = await User.findById(userId);

  if (!user) {
    return;
  }

  user.totalSpent += order.totalPrice;
  user.loyaltyPoints += Math.floor(order.totalPrice);

  order.orderItems.forEach((item) => {
    const key = item.dietaryCategory;

    if (user.categoryOrderCounts[key] !== undefined) {
      user.categoryOrderCounts[key] += item.qty;
    }

    if (
      user.categoryOrderCounts[key] >= 5 &&
      !user.customerTags.includes(categoryTagMap[key])
    ) {
      user.customerTags.push(categoryTagMap[key]);
    }
  });

  const newMilestoneCount = Math.floor(user.totalSpent / 100);

  if (newMilestoneCount > user.couponMilestoneCount) {
    const couponsToAdd = newMilestoneCount - user.couponMilestoneCount;

    for (let i = 0; i < couponsToAdd; i += 1) {
      user.coupons.push({
        amount: 5,
        isUsed: false,
      });
    }

    user.couponMilestoneCount = newMilestoneCount;
  }

  await user.save();
};

const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      paymentMethod,
      deliveryTime,
      deliveryAddress,
      note,
      useCoupon = true,
      saveNoteAsPreference = false,
      saveAddressAsPreference = false,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    const allowedPaymentMethods = [
      "credit_card",
      "debit_card",
      "campus_account",
      "mobile_wallet",
    ];

    if (!paymentMethod || !allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    if (!deliveryTime) {
      return res.status(400).json({ message: "Delivery time is required" });
    }

    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const finalOrderItems = [];
    let subtotalPrice = 0;

    for (const item of orderItems) {
      const menuItem = await MenuItem.findById(item.menuItem);

      if (!menuItem) {
        return res.status(404).json({
          message: `Menu item not found: ${item.menuItem}`,
        });
      }

      if (menuItem.approvalStatus !== "approved" || !menuItem.isAvailable) {
        return res.status(400).json({
          message: `${menuItem.name} is not available`,
        });
      }

      if (!menuItem.vendor) {
        return res.status(400).json({
          message: `${menuItem.name} does not have a vendor assigned`,
        });
      }

      const qty = Number(item.qty);

      if (!qty || qty < 1) {
        return res.status(400).json({
          message: "Quantity must be at least 1",
        });
      }

      finalOrderItems.push({
        menuItem: menuItem._id,
        vendor: menuItem.vendor,
        name: menuItem.name,
        itemType: menuItem.itemType,
        dietaryCategory: menuItem.dietaryCategory,
        packageItems: menuItem.itemType === "package" ? menuItem.packageItems : [],
        qty,
        price: menuItem.price,
        specialInstructions: item.specialInstructions || note || user.defaultOrderNote || "",
      });

      subtotalPrice += menuItem.price * qty;
    }

    let discountAmount = 0;
    let usedCoupon = {
      couponId: null,
      amount: 0,
    };

    const availableCoupon = user.coupons.find((coupon) => !coupon.isUsed);

    if (useCoupon && availableCoupon && subtotalPrice > 0) {
      discountAmount = Math.min(availableCoupon.amount, subtotalPrice);
      usedCoupon = {
        couponId: availableCoupon._id,
        amount: discountAmount,
      };
    }

    const totalPrice = Math.max(subtotalPrice - discountAmount, 0);

    const order = await Order.create({
      user: req.user._id,
      orderItems: finalOrderItems,
      subtotalPrice,
      discountAmount,
      totalPrice,
      usedCoupon,
      paymentMethod,
      paymentStatus: "paid",
      status: "paid",
      deliveryTime,
      deliveryAddress,
      note: note || user.defaultOrderNote || "",
    });

    if (order.paymentStatus === "paid" && usedCoupon.couponId) {
      const coupon = user.coupons.id(usedCoupon.couponId);

      if (coupon) {
        coupon.isUsed = true;
        coupon.usedOrder = order._id;
      }
    }

    if (saveNoteAsPreference && note) {
      user.defaultOrderNote = note;
    }

    if (saveAddressAsPreference && deliveryAddress) {
      user.deliveryPreferences.defaultAddress = deliveryAddress;
      user.deliveryPreferences.defaultDeliveryTime = deliveryTime;
    }

    await user.save();

    for (const item of finalOrderItems) {
      await MenuItem.findByIdAndUpdate(item.menuItem, {
        $inc: {
          totalSold: item.qty,
          totalRevenue: item.qty * item.price,
        },
      });
    }

    await applyCustomerRewardsAfterPaidOrder({
      userId: req.user._id,
      order,
    });

  const notification = await sendOrderNotifications({ user, order });
order.notification = notification;
await order.save();

    return res.status(201).json({
      message: "Order placed and payment completed successfully",
      order,
      notification,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.menuItem", "name image category dietaryCategory itemType")
      .populate("orderItems.vendor", "name businessName")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("orderItems.menuItem", "name image category dietaryCategory itemType")
      .populate("orderItems.vendor", "name email businessName businessPhone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    const isVendorInOrder = order.orderItems.some(
      (item) => item.vendor._id.toString() === req.user._id.toString()
    );

    if (!isOwner && !isAdmin && !isVendorInOrder) {
      return res.status(403).json({
        message: "Not allowed to view this order",
      });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "paid",
      "preparing",
      "out_for_delivery",
      "delivered",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email role phone")
      .populate("orderItems.menuItem", "name image category dietaryCategory itemType")
      .populate("orderItems.vendor", "name email businessName")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVendorOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "orderItems.vendor": req.user._id,
    })
      .populate("user", "name email phone")
      .populate("orderItems.menuItem", "name image category dietaryCategory itemType")
      .populate("orderItems.vendor", "name businessName")
      .sort({ createdAt: -1 });

    const filteredOrders = orders.map((order) => {
      const obj = order.toObject();

      obj.orderItems = obj.orderItems.filter(
        (item) => item.vendor._id.toString() === req.user._id.toString()
      );

      obj.vendorSubtotal = obj.orderItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );

      return obj;
    });

    return res.json(filteredOrders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVendorAnalytics = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const orders = await Order.find({
      "orderItems.vendor": vendorId,
      status: { $ne: "cancelled" },
    }).populate("orderItems.menuItem", "name category dietaryCategory image itemType");

    let totalRevenue = 0;
    let totalQuantitySold = 0;
    let totalOrders = orders.length;

    const itemMap = {};
    const categoryMap = {};
    const statusMap = {};

    orders.forEach((order) => {
      statusMap[order.status] = (statusMap[order.status] || 0) + 1;

      order.orderItems.forEach((item) => {
        if (item.vendor.toString() !== vendorId.toString()) {
          return;
        }

        const itemId = item.menuItem?._id?.toString() || item.menuItem.toString();

        if (!itemMap[itemId]) {
          itemMap[itemId] = {
            menuItem: itemId,
            name: item.name,
            category: item.menuItem?.category || "",
            dietaryCategory: item.dietaryCategory,
            itemType: item.itemType,
            totalQty: 0,
            totalRevenue: 0,
          };
        }

        itemMap[itemId].totalQty += item.qty;
        itemMap[itemId].totalRevenue += item.qty * item.price;

        categoryMap[item.dietaryCategory] = categoryMap[item.dietaryCategory] || {
          totalQty: 0,
          totalRevenue: 0,
        };

        categoryMap[item.dietaryCategory].totalQty += item.qty;
        categoryMap[item.dietaryCategory].totalRevenue += item.qty * item.price;

        totalQuantitySold += item.qty;
        totalRevenue += item.qty * item.price;
      });
    });

    const itemSales = Object.values(itemMap).sort(
      (a, b) => b.totalQty - a.totalQty
    );

    return res.json({
      totalOrders,
      totalQuantitySold,
      totalRevenue,
      itemSales,
      categorySales: categoryMap,
      statusSummary: statusMap,
      bestSeller: itemSales[0] || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getVendorOrders,
  getVendorAnalytics,
};