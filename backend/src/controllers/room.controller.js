const roomService = require("../services/room.service");
const { success, error } = require("../utils/response");

// ── GET /api/rooms ────────────────────────────────────────────
// Public — browse all approved rooms with optional filters.
// Query params: district, room_type, min_price, max_price, search, page, limit
const getAllRooms = async (req, res) => {
  try {
    const result = await roomService.getAllRooms(req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/owner ──────────────────────────────────────
// Owner only — get all their own listings (all statuses).
const getOwnerRooms = async (req, res) => {
  try {
    const result = await roomService.getOwnerRooms(req.user.uuid, req.query);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/:id ────────────────────────────────────────
// Public — get a single room with all images.
const getRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    return success(res, { room }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/rooms/:id/similar ────────────────────────────────
// Public — get rooms similar to the one being viewed.
const getSimilarRooms = async (req, res) => {
  try {
    const rooms = await roomService.getSimilarRooms(req.params.id);
    return success(res, { rooms }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── POST /api/rooms ───────────────────────────────────────────
// Owner only — create a new room listing (starts as pending).
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

// ── PUT /api/rooms/:id ────────────────────────────────────────
// Owner only — edit their own room.
const updateRoom = async (req, res) => {
  try {
    const room = await roomService.updateRoom(
      req.params.id,
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

// ── DELETE /api/rooms/:id ─────────────────────────────────────
// Owner only — delete their own room + all its images.
const deleteRoom = async (req, res) => {
  try {
    await roomService.deleteRoom(req.params.id, req.user.uuid);
    return success(res, null, "Room deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/rooms/:id/mark-rented ───────────────────────────
// Owner only — mark their room as rented.
const markAsRented = async (req, res) => {
  try {
    const room = await roomService.markAsRented(req.params.id, req.user.uuid);
    return success(res, { room }, "Room marked as rented.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── POST /api/rooms/:id/images ────────────────────────────────
// Owner only — upload one or more images for their room.
// req.files is attached by multer (handleUpload + uploadMultiple).
const uploadImages = async (req, res) => {
  try {
    const images = await roomService.uploadImages(
      req.params.id,
      req.user.uuid,
      req.files,
    );
    return success(res, { images }, "Images uploaded successfully.", 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── DELETE /api/rooms/:id/images/:imageId ─────────────────────
// Owner only — delete a single image from their room.
const deleteImage = async (req, res) => {
  try {
    await roomService.deleteImage(
      req.params.id,
      req.params.imageId,
      req.user.uuid,
    );
    return success(res, null, "Image deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/rooms/:id/images/:imageId/primary ────────────────
// Owner only — set a specific image as the primary thumbnail.
const setPrimaryImage = async (req, res) => {
  try {
    const images = await roomService.setPrimaryImage(
      req.params.id,
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
  getOwnerRooms,
  getRoomById,
  getSimilarRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  markAsRented,
  uploadImages,
  deleteImage,
  setPrimaryImage,
};
