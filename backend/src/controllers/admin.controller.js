const adminService = require("../services/admin.service");
const { success, error } = require("../utils/response");

// ── DASHBOARD ─────────────────────────────────────────────────

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const dashboard = await adminService.getDashboard();
    return success(res, dashboard, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// GET /api/admin/analytics (extra endpoint, kept from the previous API)
const getAnalytics = async (req, res) => {
  try {
    const analytics = await adminService.getAnalytics();
    return success(res, { analytics }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── ROOM MODERATION (kept from the previous API) ──────────────

const getPendingRooms = async (req, res) => {
  try {
    const result = await adminService.getPendingRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getAllRooms = async (req, res) => {
  try {
    const result = await adminService.getAllRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const approveRoom = async (req, res) => {
  try {
    const room = await adminService.approveRoom(req.params.id);
    return success(res, { room }, "Room approved and is now publicly visible.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

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

// ── USERS (generic) ────────────────────────────────────────────

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    return success(res, { user }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// PATCH /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    return success(res, { user }, "User updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id);
    return success(res, null, "User deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── RENTERS (users scoped to role=RENTER) ──────────────────────

const getAllRenters = async (req, res) => {
  try {
    const result = await adminService.getAllUsers(req.query, "RENTER");
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getRenterById = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id, "RENTER");
    return success(res, { user }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateRenter = async (req, res) => {
  try {
    const user = await adminService.updateUser(
      req.params.id,
      req.body,
      "RENTER",
    );
    return success(res, { user }, "Renter updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteRenter = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id, "RENTER");
    return success(res, null, "Renter deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── OWNERS (users scoped to role=OWNER) ─────────────────────────

const getAllOwners = async (req, res) => {
  try {
    const result = await adminService.getAllUsers(req.query, "OWNER");
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const getOwnerById = async (req, res) => {
  try {
    const user = await adminService.getUserById(req.params.id, "OWNER");
    return success(res, { user }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const updateOwner = async (req, res) => {
  try {
    const user = await adminService.updateUser(
      req.params.id,
      req.body,
      "OWNER",
    );
    return success(res, { user }, "Owner updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const deleteOwner = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id, "OWNER");
    return success(res, null, "Owner deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getDashboard,
  getAnalytics,
  getPendingRooms,
  getAllRooms,
  approveRoom,
  rejectRoom,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllRenters,
  getRenterById,
  updateRenter,
  deleteRenter,
  getAllOwners,
  getOwnerById,
  updateOwner,
  deleteOwner,
};
