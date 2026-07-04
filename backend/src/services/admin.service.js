const { Room, User, sequelize } = require("../models");
const { parsePagination } = require("../utils/pagination");

// ── ROOM MODERATION ───────────────────────────────────────────

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
 * Notifies the owner.
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
 * Notifies the owner.
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

/**
 * Get all users with optional role filter.
 * Supports ?role=RENTER|OWNER|ADMIN and pagination.
 */
const getAllUsers = async (query) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const where = {};

  if (query.role) {
    where.role = query.role.toUpperCase();
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

  return {
    users: users.map((user) => ({
      ...user.toJSON(),
      name: user.full_name,
      phone: user.phone_number,
    })),
    page,
    limit,
  };
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
  if (user.is_banned) {
    throw { status: 400, message: "User is already banned." };
  }

  await user.update({ is_banned: true });
  return {
    ...user.toJSON(),
    name: user.full_name,
    phone: user.phone_number,
  };
};

/**
 * Unban a user — restores their access.
 */
const unbanUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (!user.is_banned) {
    throw { status: 400, message: "User is not banned." };
  }

  await user.update({ is_banned: false });
  return {
    ...user.toJSON(),
    name: user.full_name,
    phone: user.phone_number,
  };
};

/**
 * Verify an owner — marks them as a trusted landlord.
 * Verified owners get a badge on their listings.
 */
const verifyOwner = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (user.role !== "OWNER") {
    throw { status: 400, message: "Only owner accounts can be verified." };
  }
  if (user.is_verified) {
    throw { status: 400, message: "Owner is already verified." };
  }

  await user.update({ is_verified: true });
  return {
    ...user.toJSON(),
    name: user.full_name,
    phone: user.phone_number,
  };
};

// ── ANALYTICS ─────────────────────────────────────────────────

/**
 * Platform-wide analytics for the admin dashboard.
 */
const getAnalytics = async () => {
  const [userCounts, roomStatusCounts, popularDistricts] = await Promise.all([
    User.findAll({
      attributes: ["role", [sequelize.fn("COUNT", sequelize.col("role")), "total"]],
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
      attributes: ["district", [sequelize.fn("COUNT", sequelize.col("district")), "total"]],
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

  const rooms = {
    pending: 0,
    approved: 0,
    rejected: 0,
    rented: 0,
    inactive: 0,
    total: 0,
  };
  for (const row of roomStatusCounts) {
    const approval = String(row.approval_status).toUpperCase();
    const status = String(row.status).toUpperCase();
    const count = Number(row.total);

    rooms.total += count;

    if (approval === "PENDING") {
      rooms.pending += count;
    } else if (approval === "APPROVED") {
      rooms.approved += count;
    } else if (approval === "REJECTED") {
      rooms.rejected += count;
    }

    if (status === "RENTED") {
      rooms.rented += count;
    } else if (status === "INACTIVE") {
      rooms.inactive += count;
    }
  }

  return { users, rooms, popularDistricts };
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
