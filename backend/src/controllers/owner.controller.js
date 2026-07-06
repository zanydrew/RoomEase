const ownerService = require("../services/owner.service");
const roomService = require("../services/room.service");
const viewingService = require("../services/viewing.service");
const userService = require("../services/user.service");
const { success, error } = require("../utils/response");

// ── GET /api/owner/dashboard ───────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const dashboard = await ownerService.getDashboard(req.user.uuid);
    return success(res, dashboard, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── Owner Listings (delegates to roomService — no duplicated logic) ──

// GET /api/owner/rooms
const getMyRooms = async (req, res) => {
  try {
    const result = await roomService.getOwnerRooms(req.user.uuid, req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// POST /api/owner/rooms
const createRoom = async (req, res) => {
  try {
    const room = await roomService.createRoom(req.user.uuid, req.body);
    return success(
      res,
      { room },
      "Room submitted successfully. It will be visible after admin approval.",
      201,
    );
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// GET /api/owner/rooms/:roomId
const getMyRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.roomId);
    if (room.owner_id !== req.user.uuid) {
      return error(res, "You can only view your own listings.", 403);
    }
    return success(res, { room }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PATCH /api/owner/rooms/:roomId
const updateRoom = async (req, res) => {
  try {
    const room = await roomService.updateRoom(
      req.params.roomId,
      req.user.uuid,
      req.body,
    );
    return success(
      res,
      { room },
      "Room updated. It will be re-reviewed by admin.",
    );
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// DELETE /api/owner/rooms/:roomId
const deleteRoom = async (req, res) => {
  try {
    await roomService.deleteRoom(req.params.roomId, req.user.uuid);
    return success(res, null, "Room deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PATCH /api/owner/rooms/:roomId/status
const updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return error(res, "status is required.", 400);
    }
    const room = await roomService.updateRoomStatus(
      req.params.roomId,
      req.user.uuid,
      status.toUpperCase(),
    );
    return success(res, { room }, "Room status updated.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── Viewing Requests (delegates to viewingService) ────────────

// GET /api/owner/viewing-requests
const getViewingRequests = async (req, res) => {
  try {
    const viewings = await viewingService.getIncomingRequests(
      req.user.uuid,
      req.query.status,
    );
    return success(res, { viewings }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── Statistics ──────────────────────────────────────────────────

// GET /api/owner/statistics
const getStatistics = async (req, res) => {
  try {
    const statistics = await ownerService.getStatistics(req.user.uuid);
    return success(res, { statistics }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── Profile (delegates to userService) ─────────────────────────

// GET /api/owner/profile
const getProfile = async (req, res) => {
  try {
    const user = userService.getMyProfile(req.user);
    return success(res, { user }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PATCH /api/owner/profile
const updateProfile = async (req, res) => {
  try {
    const { full_name, phone_number, location, email } = req.body;
    const updated = await userService.updateMe(req.user.uuid, {
      full_name,
      phone_number,
      location,
      email,
    });
    return success(res, { user: updated }, "Profile updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getDashboard,
  getMyRooms,
  createRoom,
  getMyRoomById,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getViewingRequests,
  getStatistics,
  getProfile,
  updateProfile,
};
