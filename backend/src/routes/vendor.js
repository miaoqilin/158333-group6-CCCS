const express = require("express");
const router = express.Router();

const {
  getVendorDashboard,
  getVendorProfile,
  updateVendorProfile,
} = require("../controllers/vendorController");

const { protect, vendor } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, vendor, getVendorDashboard);
router.get("/profile", protect, vendor, getVendorProfile);
router.put("/profile", protect, vendor, updateVendorProfile);

module.exports = router;