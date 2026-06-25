const Room = require("../models/Room");
const RoomImage = require("../models/RoomImage");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");
const { parsePagination } = require("../utils/pagination");

// ── GET ALL ROOMS ─────────────────────────────────────────────

/**
 * Get all approved rooms with optional filters.
 * Used on the main browse/search page.
 */
const getAllRooms = async (query) => {
  const { limit, offset, page } = parsePagination(query);

  const filters = {
    status: "approved",
    district: query.district || null,
    room_type: query.room_type || null,
    min_price: query.min_price ? parseFloat(query.min_price) : undefined,
    max_price: query.max_price ? parseFloat(query.max_price) : undefined,
    search: query.search || null,
    limit,
    offset,
  };

  const rooms = await Room.findAll(filters);
  return { rooms, page, limit };
};

// ── GET OWNER'S OWN ROOMS ─────────────────────────────────────

/**
 * Get all rooms posted by a specific owner (all statuses).
 * Used in the owner dashboard.
 */
const getOwnerRooms = async (ownerId, query) => {
  const { limit, offset, page } = parsePagination(query);

  const rooms = await Room.findAll({
    owner_id: ownerId,
    status: query.status || null, // owner can filter by status
    limit,
    offset,
  });

  return { rooms, page, limit };
};

// ── GET SINGLE ROOM ───────────────────────────────────────────

/**
 * Get a single room with all its images.
 * Increments the view counter each time someone opens the detail page.
 */
const getRoomById = async (id) => {
  const room = await Room.findById(id);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  // Only count views on publicly visible rooms
  if (room.status === "approved") {
    await Room.incrementViews(id);
  }

  // Attach all images (not just the primary one)
  const images = await RoomImage.findByRoomId(id);
  return { ...room, images };
};

// ── GET SIMILAR ROOMS ─────────────────────────────────────────

const getSimilarRooms = async (roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  const similar = await Room.findSimilar(roomId, {
    district: room.district,
    price: room.price,
    room_type: room.room_type,
  });

  return similar;
};

// ── CREATE ROOM ───────────────────────────────────────────────

/**
 * Owner submits a new room listing.
 * Status starts as "pending" — admin must approve before it goes public.
 */
const createRoom = async (ownerId, body) => {
  const {
    title,
    description,
    price,
    price_unit,
    address,
    district,
    city,
    latitude,
    longitude,
    room_type,
    size_sqm,
    amenities,
    nearby_places,
  } = body;

  // Required field validation
  if (!title || !price || !address || !room_type) {
    throw {
      status: 400,
      message: "Title, price, address, and room type are required.",
    };
  }

  if (isNaN(price) || parseFloat(price) <= 0) {
    throw { status: 400, message: "Price must be a positive number." };
  }

  const validTypes = ["single", "shared", "studio", "apartment"];
  if (!validTypes.includes(room_type)) {
    throw {
      status: 400,
      message: `Room type must be one of: ${validTypes.join(", ")}.`,
    };
  }

  const room = await Room.create({
    owner_id: ownerId,
    title,
    description,
    price: parseFloat(price),
    price_unit,
    address,
    district,
    city,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    room_type,
    size_sqm: size_sqm ? parseFloat(size_sqm) : null,
    amenities: Array.isArray(amenities) ? amenities : [],
    nearby_places: Array.isArray(nearby_places) ? nearby_places : [],
  });

  return room;
};

// ── UPDATE ROOM ───────────────────────────────────────────────

/**
 * Owner edits their own room.
 * Verifies ownership before allowing the update.
 */
const updateRoom = async (roomId, ownerId, body) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  // Ownership check — owners can only edit their own rooms
  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only edit your own listings." };
  }

  // Cannot edit a room that's been rented or banned
  if (room.status === "rented" || room.status === "inactive") {
    throw { status: 400, message: "This listing can no longer be edited." };
  }

  // Editing an approved room sends it back to pending for re-review
  if (room.status === "approved") {
    await Room.setStatus(roomId, "pending");
  }

  const updated = await Room.update(roomId, body);
  return updated;
};

// ── DELETE ROOM ───────────────────────────────────────────────

/**
 * Owner deletes their own room.
 * Also cleans up all images from Cloudinary.
 */
const deleteRoom = async (roomId, ownerId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only delete your own listings." };
  }

  // Remove all images from Cloudinary first
  const images = await RoomImage.removeAllByRoom(roomId);
  for (const img of images) {
    await deleteFromCloudinary(img.cloudinary_public_id).catch(() => {
      console.warn(
        `Could not delete image from Cloudinary: ${img.cloudinary_public_id}`,
      );
    });
  }

  await Room.remove(roomId);
};

// ── MARK AS RENTED ────────────────────────────────────────────

const markAsRented = async (roomId, ownerId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only update your own listings." };
  }

  await Room.setStatus(roomId, "rented");
  return Room.findById(roomId);
};

// ── UPLOAD IMAGES ─────────────────────────────────────────────

/**
 * Upload one or more images for a room.
 * The first image uploaded becomes the primary (thumbnail) if none exists yet.
 *
 * @param {number} roomId
 * @param {number} ownerId
 * @param {Array}  files   - array of file objects from multer (req.files)
 */
const uploadImages = async (roomId, ownerId, files) => {
  if (!files || files.length === 0) {
    throw { status: 400, message: "No image files provided." };
  }

  const room = await Room.findById(roomId);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only upload images to your own listings.",
    };
  }

  // Check how many images already exist — max 10 per room
  const existingImages = await RoomImage.findByRoomId(roomId);
  if (existingImages.length + files.length > 10) {
    throw {
      status: 400,
      message: `A room can have at most 10 images. You already have ${existingImages.length}.`,
    };
  }

  const hasPrimary = existingImages.some((img) => img.is_primary);

  // Upload all files to Cloudinary concurrently
  const uploaded = await Promise.all(
    files.map((file, index) =>
      uploadToCloudinary(file.buffer, "roomease/rooms").then(
        ({ url, public_id }) => ({
          room_id: roomId,
          image_url: url,
          cloudinary_public_id: public_id,
          // First image becomes primary if no primary exists yet
          is_primary: !hasPrimary && index === 0,
          display_order: existingImages.length + index,
        }),
      ),
    ),
  );

  await RoomImage.createMany(uploaded);
  return RoomImage.findByRoomId(roomId);
};

// ── DELETE IMAGE ──────────────────────────────────────────────

const deleteImage = async (roomId, imageId, ownerId) => {
  const room = await Room.findById(roomId);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only delete images from your own listings.",
    };
  }

  const deleted = await RoomImage.remove(imageId);
  if (!deleted) throw { status: 404, message: "Image not found." };

  // Remove from Cloudinary
  await deleteFromCloudinary(deleted.cloudinary_public_id).catch(() => {
    console.warn(
      `Could not delete image from Cloudinary: ${deleted.cloudinary_public_id}`,
    );
  });

  // If the deleted image was the primary, promote the next one
  if (deleted.is_primary) {
    const remaining = await RoomImage.findByRoomId(roomId);
    if (remaining.length > 0) {
      await RoomImage.setPrimary(remaining[0].id, roomId);
    }
  }
};

// ── SET PRIMARY IMAGE ─────────────────────────────────────────

const setPrimaryImage = async (roomId, imageId, ownerId) => {
  const room = await Room.findById(roomId);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only update your own listings." };
  }

  await RoomImage.setPrimary(imageId, roomId);
  return RoomImage.findByRoomId(roomId);
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
