const express = require("express");
const router = express.Router();

const {
  getMenu,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,

  createVendorMenuItem,
  getMyVendorMenuItems,
  updateVendorMenuItem,
  vendorToggleAvailability,

  getAllMenuItems,
  getPendingMenuItems,
  approveMenuItem,
  rejectMenuItem,
  adminToggleAvailability,
} = require("../controllers/menuController");

const { protect, admin, vendor } = require("../middleware/authMiddleware");

router.get("/", getMenu);

router.post("/vendor", protect, vendor, createVendorMenuItem);
router.get("/vendor/my", protect, vendor, getMyVendorMenuItems);
router.put("/vendor/:id", protect, vendor, updateVendorMenuItem);
router.put("/vendor/:id/toggle", protect, vendor, vendorToggleAvailability);

router.get("/admin/all", protect, admin, getAllMenuItems);
router.get("/admin/pending", protect, admin, getPendingMenuItems);
router.put("/admin/:id/approve", protect, admin, approveMenuItem);
router.put("/admin/:id/reject", protect, admin, rejectMenuItem);
router.put("/admin/:id/toggle", protect, admin, adminToggleAvailability);

router.post("/", protect, admin, createMenuItem);
router.put("/:id", protect, admin, updateMenuItem);
router.delete("/:id", protect, admin, deleteMenuItem);

router.get("/:id", getMenuItemById);

module.exports = router;