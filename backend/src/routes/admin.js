const express = require("express");
const router = express.Router();

const {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAllVendors,
  approveVendor,
  rejectVendor,
} = require("../controllers/adminController");

const { protect, admin } = require("../middleware/authMiddleware");

router.get("/dashboard", protect, admin, getAdminDashboard);

router.get("/users", protect, admin, getAllUsers);
router.put("/users/:id/role", protect, admin, updateUserRole);
router.put("/users/:id/status", protect, admin, updateUserStatus);
router.delete("/users/:id", protect, admin, deleteUser);

router.get("/vendors", protect, admin, getAllVendors);
router.put("/vendors/:id/approve", protect, admin, approveVendor);
router.put("/vendors/:id/reject", protect, admin, rejectVendor);

module.exports = router;