const favoriteService = require("../services/favorite.service");
const { success, error } = require("../utils/response");

// ── GET /api/favorites ────────────────────────────────────────
// Returns all rooms the logged-in user has saved.
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await favoriteService.getMyFavorites(req.user.id);
    return success(res, { favorites }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── POST /api/favorites/:roomId ───────────────────────────────
// Save a room. Safe to call even if already saved.
const saveRoom = async (req, res) => {
  try {
    const result = await favoriteService.saveRoom(
      req.user.id,
      req.params.roomId,
    );
    const message = result.alreadySaved
      ? "Room already saved."
      : "Room saved successfully.";
    return success(res, null, message, result.alreadySaved ? 200 : 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── DELETE /api/favorites/:roomId ─────────────────────────────
// Unsave a room.
const unsaveRoom = async (req, res) => {
  try {
    await favoriteService.unsaveRoom(req.user.id, req.params.roomId);
    return success(res, null, "Room removed from saved list.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/favorites/:roomId/check ─────────────────────────
// Check if a specific room is saved by the current user.
// Used by the room detail page to show filled/empty heart icon.
const checkIfSaved = async (req, res) => {
  try {
    const saved = await favoriteService.isSaved(req.user.id, req.params.roomId);
    return success(res, { saved }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getMyFavorites, saveRoom, unsaveRoom, checkIfSaved };
