const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getMyFeedback,
  getVendorFeedback,
  getAllFeedback,
  replyFeedback,
  markFeedbackHandled,
  deleteFeedback,
} = require("../controllers/feedbackController");

const { protect, admin, vendor } = require("../middleware/authMiddleware");

router.post("/", protect, createFeedback);

router.get("/my", protect, getMyFeedback);

router.get("/vendor", protect, vendor, getVendorFeedback);
router.put("/vendor/:id/reply", protect, vendor, replyFeedback);
router.put("/:id/handled", protect, markFeedbackHandled);

router.get("/admin/all", protect, admin, getAllFeedback);
router.delete("/admin/:id", protect, admin, deleteFeedback);

module.exports = router;