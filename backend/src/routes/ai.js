const express = require("express");
const router = express.Router();

const { getVendorAiAnalysis } = require("../controllers/aiController");
const { protect, vendor } = require("../middleware/authMiddleware");

router.get("/vendor/analysis", protect, vendor, getVendorAiAnalysis);

module.exports = router;