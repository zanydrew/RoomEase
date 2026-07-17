const { Room, User, sequelize } = require("../models");
const { parsePagination } = require("../utils/pagination");

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
  const { limit, offset, page } = parsePagination(query, 10);
  const where = {};

  const role = fixedRole || query.role;
  if (role) {
    where.role = role.toUpperCase();
  }

  if (query.banned !== undefined) {
    where.is_banned = query.banned === "true";
  }

  if (query.search) {
    const { Op } = require("sequelize");
    const like = `%${query.search}%`;
    where[Op.or] = [
      { full_name: { [Op.like]: like } },
      { email: { [Op.like]: like } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { users: rows.map(shapeUser), total: count, page, limit };
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
const banUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (user.role === "ADMIN") {
    throw { status: 403, message: "Admin accounts cannot be banned." };
  }
  await user.update({ is_banned: true });
  return shapeUser(user);
};

/**
 * Unban a user — restores their access.
 */

const unbanUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: "User not found." };
  await user.update({ is_banned: false });
  return shapeUser(user);
};

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
  const userCounts = await User.findAll({
    attributes: [
      "role",
      [sequelize.fn("COUNT", sequelize.col("role")), "total"],
    ],
    group: ["role"],
    raw: true,
  });

  const users = { RENTER: 0, OWNER: 0, ADMIN: 0, total: 0 };
  for (const row of userCounts) {
    users[row.role] = Number(row.total);
    users.total += Number(row.total);
  }

  return { users };
};

module.exports = {
  getAnalytics,
  getAllUsers,
  deleteUser,
  banUser,
  unbanUser,
  verifyOwner,
};
