const Feedback = require("../models/Feedback");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

const getSentiment = (rating) => {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
};

const recalculateMenuItemRating = async (menuItemId) => {
  const result = await Feedback.aggregate([
    {
      $match: {
        menuItem: menuItemId,
      },
    },
    {
      $group: {
        _id: "$menuItem",
        averageRating: { $avg: "$rating" },
        feedbackCount: { $sum: 1 },
      },
    },
  ]);

  const stat = result[0];

  if (!stat) {
    await MenuItem.findByIdAndUpdate(menuItemId, {
      averageRating: 0,
      feedbackCount: 0,
    });
    return;
  }

  await MenuItem.findByIdAndUpdate(menuItemId, {
    averageRating: Number(stat.averageRating.toFixed(1)),
    feedbackCount: stat.feedbackCount,
  });
};

const createFeedback = async (req, res) => {
  try {
    const { orderId, menuItemId, rating, comment } = req.body;

    if (!orderId || !menuItemId || rating === undefined) {
      return res.status(400).json({
        message: "Order ID, menu item ID and rating are required",
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only review your own orders",
      });
    }

    const orderItem = order.orderItems.find(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (!orderItem) {
      return res.status(400).json({
        message: "This menu item is not in the selected order",
      });
    }

    const existingFeedback = await Feedback.findOne({
      user: req.user._id,
      order: orderId,
      menuItem: menuItemId,
    });

    if (existingFeedback) {
      return res.status(400).json({
        message: "You have already reviewed this item in this order",
      });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      order: orderId,
      menuItem: menuItemId,
      vendor: orderItem.vendor,
      rating: Number(rating),
      comment: comment || "",
      sentiment: getSentiment(Number(rating)),
    });

    await recalculateMenuItemRating(feedback.menuItem);

    return res.status(201).json({
      message: "Feedback submitted",
      feedback,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this item in this order",
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate("menuItem", "name image category dietaryCategory")
      .populate("vendor", "name businessName")
      .populate("order", "createdAt totalPrice")
      .sort({ createdAt: -1 });

    return res.json(feedback);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getVendorFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ vendor: req.user._id })
      .populate("user", "name email")
      .populate("menuItem", "name image category dietaryCategory")
      .populate("order", "createdAt deliveryTime deliveryAddress")
      .sort({ createdAt: -1 });

    const total = feedback.length;
    const positive = feedback.filter((f) => f.sentiment === "positive").length;
    const neutral = feedback.filter((f) => f.sentiment === "neutral").length;
    const negative = feedback.filter((f) => f.sentiment === "negative").length;
    const averageRating =
      total === 0
        ? 0
        : Number(
            (
              feedback.reduce((sum, f) => sum + f.rating, 0) / total
            ).toFixed(1)
          );

    return res.json({
      summary: {
        total,
        positive,
        neutral,
        negative,
        averageRating,
      },
      feedback,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate("user", "name email")
      .populate("vendor", "name email businessName")
      .populate("menuItem", "name image category dietaryCategory")
      .populate("order", "createdAt deliveryTime deliveryAddress")
      .sort({ createdAt: -1 });

    return res.json(feedback);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const replyFeedback = async (req, res) => {
  try {
    const { vendorReply } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (feedback.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only reply to feedback for your own items",
      });
    }

    feedback.vendorReply = vendorReply || "";
    feedback.isHandled = true;

    const updatedFeedback = await feedback.save();

    return res.json(updatedFeedback);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markFeedbackHandled = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (
      req.user.role !== "admin" &&
      feedback.vendor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not allowed to update this feedback",
      });
    }

    feedback.isHandled = true;

    const updatedFeedback = await feedback.save();

    return res.json(updatedFeedback);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const menuItemId = feedback.menuItem;

    await feedback.deleteOne();
    await recalculateMenuItemRating(menuItemId);

    return res.json({
      message: "Feedback deleted",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFeedback,
  getMyFeedback,
  getVendorFeedback,
  getAllFeedback,
  replyFeedback,
  markFeedbackHandled,
  deleteFeedback,
};