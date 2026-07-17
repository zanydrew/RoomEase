const adminService = require("../services/admin.service");
const { success, error } = require("../utils/response");


// GET /api/admin/analytics (extra endpoint, kept from the previous API)
const getAnalytics = async (req, res) => {
  try {
    const analytics = await adminService.getAnalytics();
    return success(res, { analytics }, "OK");
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


const deleteOwner = async (req, res) => {
  try {
    await adminService.deleteUser(req.params.id, "OWNER");
    return success(res, null, "Owner deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const banUser = async (req, res) => {
  try {
    const user = await adminService.banUser(req.params.id);
    return success(res, { user }, "User banned successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const unbanUser = async (req, res) => {
  try {
    const user = await adminService.unbanUser(req.params.id);
    return success(res, { user }, "User unbanned successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

const verifyOwner = async (req, res) => {
  try {
    const user = await adminService.verifyOwner(req.params.id);
    return success(res, { user }, "Owner verified successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getAnalytics,
  getAllUsers,
  deleteUser,
  getAllRenters,
  deleteRenter,
  getAllOwners,
  deleteOwner,
  banUser,
  unbanUser,
  verifyOwner,
};
