const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// Every admin route requires login AND the ADMIN role
router.use(verifyToken, requireRole("ADMIN"));

// ── Room moderation ───────────────────────────────────────────
router.get("/rooms/pending", adminController.getPendingRooms);
router.get("/rooms", adminController.getAllRooms);
router.put("/rooms/:id/approve", adminController.approveRoom);
router.put("/rooms/:id/reject", adminController.rejectRoom);

// ── User management ───────────────────────────────────────────
router.get("/users", adminController.getAllUsers);
router.put("/users/:id/ban", adminController.banUser);
router.put("/users/:id/unban", adminController.unbanUser);
router.put("/users/:id/verify", adminController.verifyOwner);

// ── Analytics ─────────────────────────────────────────────────
router.get("/analytics", adminController.getAnalytics);

module.exports = router;
