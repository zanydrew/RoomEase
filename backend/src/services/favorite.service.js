const Favorite = require("../models/Favorite");
const Room = require("../models/Room");

// ── GET MY SAVED ROOMS ────────────────────────────────────────

const getMyFavorites = async (userId) => {
  const favorites = await Favorite.findByUser(userId);
  return favorites;
};

// ── SAVE A ROOM ───────────────────────────────────────────────

const saveRoom = async (userId, roomId) => {
  // Make sure the room exists and is approved before saving
  const room = await Room.findById(roomId);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }
  if (room.status !== "approved") {
    throw { status: 400, message: "This room is not available." };
  }

  // Already saved? Just return without error — idempotent action
  const already = await Favorite.exists(userId, roomId);
  if (already) {
    return { alreadySaved: true };
  }

  await Favorite.create(userId, roomId);
  return { alreadySaved: false };
};

// ── UNSAVE A ROOM ─────────────────────────────────────────────

const unsaveRoom = async (userId, roomId) => {
  await Favorite.remove(userId, roomId);
};

// ── CHECK IF A ROOM IS SAVED ──────────────────────────────────
// Used by the room detail page to show the correct heart icon state.

const isSaved = async (userId, roomId) => {
  return Favorite.exists(userId, roomId);
};

module.exports = { getMyFavorites, saveRoom, unsaveRoom, isSaved };
