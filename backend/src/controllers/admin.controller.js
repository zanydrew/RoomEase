const adminService = require("../services/admin.service");
const { success, error } = require("../utils/response");

// ── ROOM MODERATION ───────────────────────────────────────────

// GET /api/admin/rooms/pending
// Returns all rooms waiting for review.
const getPendingRooms = async (req, res) => {
  try {
    const result = await adminService.getPendingRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// GET /api/admin/rooms
// Returns all rooms (any status) — full admin view.
const getAllRooms = async (req, res) => {
  try {
    const result = await adminService.getAllRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PUT /api/admin/rooms/:id/approve
const approveRoom = async (req, res) => {
  try {
    const room = await adminService.approveRoom(req.params.id);
    return success(res, { room }, "Room approved and is now publicly visible.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PUT /api/admin/rooms/:id/reject
// Body: { rejection_reason: "..." }
const rejectRoom = async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    if (!rejection_reason) {
      return error(res, "A rejection reason is required.", 400);
    }
    const room = await adminService.rejectRoom(req.params.id, rejection_reason);
    return success(res, { room }, "Room rejected. Owner has been notified.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── USER MANAGEMENT ───────────────────────────────────────────

// GET /api/admin/users
// Optional: ?role=RENTER|OWNER|ADMIN  ?banned=true|false
const getAllUsers = async (req, res) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PUT /api/admin/users/:id/ban
const banUser = async (req, res) => {
  try {
    const user = await adminService.banUser(req.params.id);
    return success(res, { user }, "User banned successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PUT /api/admin/users/:id/unban
const unbanUser = async (req, res) => {
  try {
    const user = await adminService.unbanUser(req.params.id);
    return success(res, { user }, "User unbanned successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PUT /api/admin/users/:id/verify
const verifyOwner = async (req, res) => {
  try {
    const user = await adminService.verifyOwner(req.params.id);
    return success(res, { user }, "Owner verified successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── ANALYTICS ─────────────────────────────────────────────────

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const analytics = await adminService.getAnalytics();
    return success(res, { analytics }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getPendingRooms,
  getAllRooms,
  approveRoom,
  rejectRoom,
  getAllUsers,
  banUser,
  unbanUser,
  verifyOwner,
  getAnalytics,
};
