const { Room, User, sequelize } = require("../models");
const { parsePagination } = require("../utils/pagination");

// ── DASHBOARD ─────────────────────────────────────────────────

/**
 * Total users / owners / renters for the admin dashboard.
 */
const getDashboard = async () => {
  const counts = await User.findAll({
    attributes: [
      "role",
      [sequelize.fn("COUNT", sequelize.col("role")), "total"],
    ],
    group: ["role"],
    raw: true,
  });

  const dashboard = {
    totalUsers: 0,
    totalOwners: 0,
    totalRenters: 0,
    totalAdmins: 0,
  };
  for (const row of counts) {
    const count = Number(row.total);
    dashboard.totalUsers += count;
    if (row.role === "OWNER") dashboard.totalOwners = count;
    if (row.role === "RENTER") dashboard.totalRenters = count;
    if (row.role === "ADMIN") dashboard.totalAdmins = count;
  }

  return dashboard;
};

// ── ROOM MODERATION ───────────────────────────────────────────
// Kept from the previous API — the new design doesn't list a
// replacement for room approval/rejection, and nothing else in the
// app performs this moderation step, so removing it would break the
// listing-approval workflow.

/**
 * Get all rooms waiting for admin review.
 */
const getPendingRooms = async (query) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const rooms = await Room.findAll({
    where: { approval_status: "PENDING" },
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { rooms: rooms.map((room) => room.toJSON()), page, limit };
};

/**
 * Get all rooms regardless of status — for the full admin view.
 */
const getAllRooms = async (query) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const where = {};

  if (query.status) {
    const statusValue = query.status.toUpperCase();
    if (["AVAILABLE", "RENTED"].includes(statusValue)) {
      where.status = statusValue;
    } else {
      where.approval_status = statusValue;
    }
  }

  const rooms = await Room.findAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { rooms: rooms.map((room) => room.toJSON()), page, limit };
};

/**
 * Approve a room — makes it publicly visible.
 */
const approveRoom = async (roomId) => {
  const room = await Room.findByPk(roomId);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.approval_status !== "PENDING") {
    throw { status: 400, message: "Only pending rooms can be approved." };
  }

  await room.update({ approval_status: "APPROVED", status: "AVAILABLE" });

  return (await Room.findByPk(roomId)).toJSON();
};

/**
 * Reject a room — sends it back to the owner with a reason.
 */
const rejectRoom = async (roomId, rejection_reason) => {
  if (!rejection_reason || !rejection_reason.trim()) {
    throw { status: 400, message: "A rejection reason is required." };
  }

  const room = await Room.findByPk(roomId);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.approval_status !== "PENDING") {
    throw { status: 400, message: "Only pending rooms can be rejected." };
  }

  await room.update({ approval_status: "REJECTED" });

  return (await Room.findByPk(roomId)).toJSON();
};

// ── USER MANAGEMENT ───────────────────────────────────────────

const shapeUser = (user) => ({
  ...user.toJSON(),
  name: user.full_name,
  phone: user.phone_number,
});

/**
 * Get all users, optionally scoped to a single role.
 * Supports ?role=RENTER|OWNER|ADMIN, ?banned=true|false, and pagination.
 * Used directly for GET /users, and with a fixed role for
 * GET /renters and GET /owners.
 */
const getAllUsers = async (query, fixedRole) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const where = {};

  const role = fixedRole || query.role;
  if (role) {
    where.role = role.toUpperCase();
  }

  if (query.banned !== undefined) {
    where.is_banned = query.banned === "true";
  }

  const users = await User.findAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { users: users.map(shapeUser), page, limit };
};

/**
 * Get a single user by id, optionally asserting a specific role
 * (used by GET /renters/:id and GET /owners/:id to 404 on mismatch).
 */
const getUserById = async (userId, expectedRole) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (expectedRole && user.role !== expectedRole) {
    throw {
      status: 404,
      message: `User not found among ${expectedRole.toLowerCase()}s.`,
    };
  }
  return shapeUser(user);
};

/**
 * Ban a user — blocks them from all protected actions.
 * Cannot ban another admin.
 */
const banUser = async (user) => {
  if (user.role === "ADMIN") {
    throw { status: 403, message: "Admin accounts cannot be banned." };
  }
  return user.update({ is_banned: true });
};

/**
 * Unban a user — restores their access.
 */
const unbanUser = async (user) => user.update({ is_banned: false });

/**
 * Verify an owner — marks them as a trusted landlord.
 */
const verifyOwner = async (user) => {
  if (user.role !== "OWNER") {
    throw { status: 400, message: "Only owner accounts can be verified." };
  }
  return user.update({ is_verified: true });
};

/**
 * Generic partial update for PATCH /users/:id, /renters/:id, /owners/:id.
 * Reuses the same ban/unban/verify business rules above instead of
 * duplicating them, while also allowing plain profile field edits.
 */
const updateUser = async (userId, updates = {}, expectedRole) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (expectedRole && user.role !== expectedRole) {
    throw {
      status: 404,
      message: `User not found among ${expectedRole.toLowerCase()}s.`,
    };
  }

  if (updates.is_banned === true) await banUser(user);
  if (updates.is_banned === false) await unbanUser(user);
  if (updates.is_verified === true) await verifyOwner(user);

  const plainFields = {};
  if (updates.full_name !== undefined)
    plainFields.full_name = updates.full_name;
  if (updates.phone_number !== undefined)
    plainFields.phone_number = updates.phone_number;
  if (updates.location !== undefined) plainFields.location = updates.location;
  if (Object.keys(plainFields).length > 0) {
    await user.update(plainFields);
  }

  await user.reload();
  return shapeUser(user);
};

/**
 * Delete a user account. Cannot delete another admin.
 */
const deleteUser = async (userId, expectedRole) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (expectedRole && user.role !== expectedRole) {
    throw {
      status: 404,
      message: `User not found among ${expectedRole.toLowerCase()}s.`,
    };
  }
  if (user.role === "ADMIN") {
    throw { status: 403, message: "Admin accounts cannot be deleted." };
  }

  await user.destroy();
};

// ── ANALYTICS ─────────────────────────────────────────────────
// Extra endpoint (not in the new spec) kept because it carries
// richer data (room status breakdown, popular districts) than the
// new minimal dashboard, and nothing else in the app replaces it.

const getAnalytics = async () => {
  const [userCounts, roomStatusCounts, popularDistricts] = await Promise.all([
    User.findAll({
      attributes: [
        "role",
        [sequelize.fn("COUNT", sequelize.col("role")), "total"],
      ],
      group: ["role"],
      raw: true,
    }),
    Room.findAll({
      attributes: [
        "approval_status",
        "status",
        [sequelize.fn("COUNT", sequelize.col("uuid")), "total"],
      ],
      group: ["approval_status", "status"],
      raw: true,
    }),
    Room.findAll({
      where: { approval_status: "APPROVED" },
      attributes: [
        "district",
        [sequelize.fn("COUNT", sequelize.col("district")), "total"],
      ],
      group: ["district"],
      raw: true,
      limit: 5,
      order: [[sequelize.fn("COUNT", sequelize.col("district")), "DESC"]],
    }),
  ]);

  const users = { RENTER: 0, OWNER: 0, ADMIN: 0, total: 0 };
  for (const row of userCounts) {
    users[row.role] = Number(row.total);
    users.total += Number(row.total);
  }

  const rooms = { pending: 0, approved: 0, rejected: 0, rented: 0, total: 0 };
  for (const row of roomStatusCounts) {
    const approval = String(row.approval_status).toUpperCase();
    const status = String(row.status).toUpperCase();
    const count = Number(row.total);

    rooms.total += count;
    if (approval === "PENDING") rooms.pending += count;
    else if (approval === "APPROVED") rooms.approved += count;
    else if (approval === "REJECTED") rooms.rejected += count;
    if (status === "RENTED") rooms.rented += count;
  }

  return { users, rooms, popularDistricts };
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
};
