const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const { protect, vendor } = require("../middleware/authMiddleware");

router.get("/test", (req, res) => {
  res.json({
    message: "AI route is working",
    availableFunctions: Object.keys(aiController),
  });
});

router.get("/package-suggestion", (req, res, next) => {
  if (typeof aiController.getLive2dPackageSuggestion !== "function") {
    return res.status(500).json({
      message: "getLive2dPackageSuggestion is not exported from aiController.js",
      availableFunctions: Object.keys(aiController),
    });
  }

  return aiController.getLive2dPackageSuggestion(req, res, next);
});

router.get("/vendor/analysis", protect, vendor, (req, res, next) => {
  if (typeof aiController.getVendorAiAnalysis !== "function") {
    return res.status(500).json({
      message: "getVendorAiAnalysis is not exported from aiController.js",
      availableFunctions: Object.keys(aiController),
    });
  }

  return aiController.getVendorAiAnalysis(req, res, next);
});

module.exports = router;