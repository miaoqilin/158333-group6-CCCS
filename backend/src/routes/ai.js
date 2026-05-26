const express = require("express");
const router = express.Router();

const {
  getVendorAiAnalysis,
  getLive2dPackageSuggestion,
} = require("../controllers/aiController");

const { protect, vendor } = require("../middleware/authMiddleware");

router.get("/vendor/analysis", protect, vendor, getVendorAiAnalysis);

// Public endpoint: Live2D assistant package suggestion
router.get("/package-suggestion", getLive2dPackageSuggestion);
router.post("/package-suggestion", getLive2dPackageSuggestion);

module.exports = router;