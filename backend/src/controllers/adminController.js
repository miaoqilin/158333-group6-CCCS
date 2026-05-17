const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const Feedback = require("../models/Feedback");

const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalVendors = await User.countDocuments({ role: "vendor" });
    const pendingVendors = await User.countDocuments({
      role: "vendor",
      vendorStatus: "pending",
    });

    const totalMenuItems = await MenuItem.countDocuments();
    const pendingMenuItems = await MenuItem.countDocuments({
      approvalStatus: "pending",
    });

    const totalOrders = await Order.countDocuments();
    const totalFeedback = await Feedback.countDocuments();

    const salesResult = await Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalSales = salesResult[0]?.totalSales || 0;

    return res.json({
      totalUsers,
      totalStudents,
      totalVendors,
      pendingVendors,
      totalMenuItems,
      pendingMenuItems,
      totalOrders,
      totalFeedback,
      totalSales,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "vendor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;

    if (role === "vendor" && user.vendorStatus === "none") {
      user.vendorStatus = "pending";
    }

    if (role !== "vendor") {
      user.vendorStatus = "none";
      user.vendorRejectionReason = "";
    }

    const updatedUser = await user.save();

    return res.json({
      message: "User role updated",
      user: {
        ...updatedUser.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot disable your own admin account",
      });
    }

    user.isActive = isActive;

    const updatedUser = await user.save();

    return res.json({
      message: isActive ? "User activated" : "User disabled",
      user: {
        ...updatedUser.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    await user.deleteOne();

    return res.json({ message: "User deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json(vendors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const approveVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.vendorStatus = "approved";
    vendor.vendorRejectionReason = "";

    const updatedVendor = await vendor.save();

    return res.json({
      message: "Vendor approved",
      vendor: {
        ...updatedVendor.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;

    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.vendorStatus = "rejected";
    vendor.vendorRejectionReason = reason || "Rejected by admin";

    const updatedVendor = await vendor.save();

    return res.json({
      message: "Vendor rejected",
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
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllVendors,
  approveVendor,
  rejectVendor,
};