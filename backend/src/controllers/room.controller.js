const roomService = require("../services/room.service");
const { success, error } = require("../utils/response");

// ── GET /api/rooms ────────────────────────────────────────────
// Public — browse/search approved + available listings.
// Query params: page, limit, keyword, city, province, minPrice,
// maxPrice, roomType, bedrooms, bathrooms, available, sort
const getAllRooms = async (req, res) => {
  try {
    const result = await roomService.getAllRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/featured ───────────────────────────────────
// Public — small curated set for the homepage.
const getFeaturedRooms = async (req, res) => {
  try {
    const result = await roomService.getFeaturedRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/latest ─────────────────────────────────────
// Public — paginated newest-first listing.
const getLatestRooms = async (req, res) => {
  try {
    const result = await roomService.getLatestRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/map ─────────────────────────────────────────
// Public — lightweight list of rooms for map pin rendering.
const getRoomsForMap = async (req, res) => {
  try {
    const result = await roomService.getRoomsForMap(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/nearby ─────────────────────────────────────
// Public — rooms within a radius of ?lat=&lng=&radius=
const getNearbyRooms = async (req, res) => {
  try {
    const result = await roomService.getNearbyRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/:roomId ────────────────────────────────────
// Public — get a single room with all images.
const getRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.roomId);
    return success(res, { room }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/:roomId/similar ────────────────────────────
// Public — extra endpoint (not in the new spec, kept for the
// room detail page's "similar listings" section).
const getSimilarRooms = async (req, res) => {
  try {
    const rooms = await roomService.getSimilarRooms(req.params.roomId);
    return success(res, { rooms }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── Room Images ────────────────────────────────────────────────
// These stay under /api/rooms/:roomId/images per the API design,
// even though only the owning OWNER can call them (enforced in
// the route middleware).

// ── POST /api/rooms/:roomId/images ────────────────────────────
const uploadImages = async (req, res) => {
  try {
    const images = await roomService.uploadImages(
      req.params.roomId,
      req.user.uuid,
      req.files,
    );
    return success(res, { images }, "Images uploaded successfully.", 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── DELETE /api/rooms/:roomId/images/:imageId ─────────────────
const deleteImage = async (req, res) => {
  try {
    await roomService.deleteImage(
      req.params.roomId,
      req.params.imageId,
      req.user.uuid,
    );
    return success(res, null, "Image deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PATCH /api/rooms/:roomId/images/:imageId ──────────────────
// Currently supports { is_primary: true } to set the cover photo.
const updateImage = async (req, res) => {
  try {
    if (req.body.is_primary !== true && req.body.is_primary !== "true") {
      return error(
        res,
        "is_primary=true is currently the only supported update.",
        400,
      );
    }
    const images = await roomService.setPrimaryImage(
      req.params.roomId,
      req.params.imageId,
      req.user.uuid,
    );
    return success(res, { images }, "Primary image updated.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getAllRooms,
  getFeaturedRooms,
  getLatestRooms,
  getRoomsForMap,
  getNearbyRooms,
  getRoomById,
  getSimilarRooms,
  uploadImages,
  deleteImage,
  updateImage,
};
