const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Feedback = require("../models/Feedback");

const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user._id;

    const totalItems = await MenuItem.countDocuments({ vendor: vendorId });
    const approvedItems = await MenuItem.countDocuments({
      vendor: vendorId,
      approvalStatus: "approved",
    });
    const pendingItems = await MenuItem.countDocuments({
      vendor: vendorId,
      approvalStatus: "pending",
    });
    const rejectedItems = await MenuItem.countDocuments({
      vendor: vendorId,
      approvalStatus: "rejected",
    });
    const availableItems = await MenuItem.countDocuments({
      vendor: vendorId,
      approvalStatus: "approved",
      isAvailable: true,
    });

    const orders = await Order.find({
      "orderItems.vendor": vendorId,
      status: { $ne: "cancelled" },
    });

    let totalRevenue = 0;
    let totalQuantitySold = 0;

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (item.vendor.toString() === vendorId.toString()) {
          totalRevenue += item.price * item.qty;
          totalQuantitySold += item.qty;
        }
      });
    });

    const feedbackCount = await Feedback.countDocuments({ vendor: vendorId });
    const positiveFeedback = await Feedback.countDocuments({
      vendor: vendorId,
      sentiment: "positive",
    });
    const negativeFeedback = await Feedback.countDocuments({
      vendor: vendorId,
      sentiment: "negative",
    });

    return res.json({
      vendor: req.user,
      totalItems,
      approvedItems,
      pendingItems,
      rejectedItems,
      availableItems,
      totalOrders: orders.length,
      totalRevenue,
      totalQuantitySold,
      feedbackCount,
      positiveFeedback,
      negativeFeedback,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVendorProfile = async (req, res) => {
  return res.json(req.user);
};

const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.name = req.body.name ?? vendor.name;
    vendor.phone = req.body.phone ?? vendor.phone;
    vendor.businessName = req.body.businessName ?? vendor.businessName;
    vendor.businessDescription =
      req.body.businessDescription ?? vendor.businessDescription;
    vendor.businessAddress = req.body.businessAddress ?? vendor.businessAddress;
    vendor.businessPhone = req.body.businessPhone ?? vendor.businessPhone;

    const updatedVendor = await vendor.save();

    return res.json({
      message: "Vendor profile updated",
      vendor: {
        ...updatedVendor.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVendorDashboard,
  getVendorProfile,
  updateVendorProfile,
};