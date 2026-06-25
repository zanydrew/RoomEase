const Room = require("../models/Room");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { parsePagination } = require("../utils/pagination");

// ── ROOM MODERATION ───────────────────────────────────────────

/**
 * Get all rooms waiting for admin review.
 */
const getPendingRooms = async (query) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const rooms = await Room.findAll({ status: "pending", limit, offset });
  return { rooms, page, limit };
};

/**
 * Get all rooms regardless of status — for the full admin view.
 */
const getAllRooms = async (query) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const rooms = await Room.findAll({
    status: query.status || null, // admin can filter by any status
    limit,
    offset,
  });
  return { rooms, page, limit };
};

/**
 * Approve a room — makes it publicly visible.
 * Notifies the owner.
 */
const approveRoom = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.status !== "pending") {
    throw { status: 400, message: "Only pending rooms can be approved." };
  }

  await Room.setStatus(roomId, "approved");

  await Notification.create({
    user_id: room.owner_id,
    type: "room_approved",
    title: "Your listing is live!",
    body: `"${room.title}" has been approved and is now publicly visible.`,
    reference_id: roomId,
    reference_type: "room",
  });

  return Room.findById(roomId);
};

/**
 * Reject a room — sends it back to the owner with a reason.
 * Notifies the owner.
 */
const rejectRoom = async (roomId, rejection_reason) => {
  if (!rejection_reason || !rejection_reason.trim()) {
    throw { status: 400, message: "A rejection reason is required." };
  }

  const room = await Room.findById(roomId);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.status !== "pending") {
    throw { status: 400, message: "Only pending rooms can be rejected." };
  }

  await Room.setStatus(roomId, "rejected", rejection_reason.trim());

  await Notification.create({
    user_id: room.owner_id,
    type: "room_rejected",
    title: "Listing Not Approved",
    body: `"${room.title}" was not approved. Reason: ${rejection_reason.trim()}`,
    reference_id: roomId,
    reference_type: "room",
  });

  return Room.findById(roomId);
};

// ── USER MANAGEMENT ───────────────────────────────────────────

/**
 * Get all users with optional role filter.
 * Supports ?role=RENTER|OWNER|ADMIN and pagination.
 */
const getAllUsers = async (query) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const users = await User.findAll({
    role: query.role || null,
    is_banned: query.banned !== undefined ? query.banned === "true" : undefined,
    limit,
    offset,
  });
  return { users, page, limit };
};

/**
 * Ban a user — blocks them from all protected actions.
 * Cannot ban another admin.
 */
const banUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (user.role === "ADMIN") {
    throw { status: 403, message: "Admin accounts cannot be banned." };
  }
  if (user.is_banned) {
    throw { status: 400, message: "User is already banned." };
  }

  await User.setBanned(userId, true);
  return User.findById(userId);
};

/**
 * Unban a user — restores their access.
 */
const unbanUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (!user.is_banned) {
    throw { status: 400, message: "User is not banned." };
  }

  await User.setBanned(userId, false);
  return User.findById(userId);
};

/**
 * Verify an owner — marks them as a trusted landlord.
 * Verified owners get a badge on their listings.
 */
const verifyOwner = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw { status: 404, message: "User not found." };
  if (user.role !== "OWNER") {
    throw { status: 400, message: "Only owner accounts can be verified." };
  }
  if (user.is_verified) {
    throw { status: 400, message: "Owner is already verified." };
  }

  await User.setVerified(userId, true);
  return User.findById(userId);
};

// ── ANALYTICS ─────────────────────────────────────────────────

/**
 * Platform-wide analytics for the admin dashboard.
 */
const getAnalytics = async () => {
  // Run all queries concurrently for speed
  const [userCounts, roomStatusCounts, popularDistricts] = await Promise.all([
    User.countByRole(),
    Room.countByStatus(),
    Room.popularDistricts(5),
  ]);

  // Shape user counts into a clean object
  const users = { RENTER: 0, OWNER: 0, ADMIN: 0, total: 0 };
  for (const row of userCounts) {
    users[row.role] = row.total;
    users.total += row.total;
  }

  // Shape room counts into a clean object
  const rooms = {
    pending: 0,
    approved: 0,
    rejected: 0,
    rented: 0,
    inactive: 0,
    total: 0,
  };
  for (const row of roomStatusCounts) {
    rooms[row.status] = row.total;
    rooms.total += row.total;
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
