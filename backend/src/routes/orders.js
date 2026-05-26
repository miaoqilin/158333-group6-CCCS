const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  getVendorOrders,
  getVendorAnalytics,
} = require("../controllers/orderController");

const { protect, admin, vendor } = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);

router.get("/my", protect, getMyOrders);

router.get("/admin/all", protect, admin, getAllOrders);

router.get("/vendor/my", protect, vendor, getVendorOrders);
router.get("/vendor/analytics", protect, vendor, getVendorAnalytics);

router.get("/:id", protect, getOrderById);

router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;