const { Op } = require("sequelize");
const { Room, RoomImage, University, sequelize } = require("../models");
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

  const where = { approval_status: "APPROVED", status: "AVAILABLE" };

  // `available=false` lets a caller explicitly ask for rented rooms too
  if (query.available !== undefined) {
    where.status = query.available === "false" ? "RENTED" : "AVAILABLE";
  }

  if (query.city) {
    where.city = query.city;
  }

  // NOTE: `province` has no matching column on the Room model yet
  // (only city/district exist). Accepted but ignored until the schema
  // is extended — kept here so the query string shape matches the spec
  // without throwing on unknown filters.
  // if (query.province) { where.province = query.province; }

  if (query.district) {
    where.district = query.district;
  }

  if (query.roomType) {
    where.room_type = query.roomType;
  }

  if (query.minPrice !== undefined) {
    where.price_per_month = { [Op.gte]: parseFloat(query.minPrice) };
  }

  if (query.maxPrice !== undefined) {
    where.price_per_month = {
      ...(where.price_per_month || {}),
      [Op.lte]: parseFloat(query.maxPrice),
    };
  }

  // NOTE: `bedrooms` / `bathrooms` also have no matching columns yet.
  // Accepted but ignored for the same reason as `province` above.

  if (query.keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${query.keyword}%` } },
      { address: { [Op.like]: `%${query.keyword}%` } },
    ];
  }

  const include = [];
  if (query.university_id) {
    include.push({
      model: University,
      as: "nearbyUniversities",
      where: { id: parseInt(query.university_id) },
      attributes: [],
    });
  }

  const sortOptions = {
    price_asc: [["price_per_month", "ASC"]],
    price_desc: [["price_per_month", "DESC"]],
    newest: [["created_at", "DESC"]],
    oldest: [["created_at", "ASC"]],
  };
  const order = sortOptions[query.sort] || sortOptions.newest;

  const rooms = await Room.findAll({
    where,
    include,
    limit,
    offset,
    order,
  });

  return { rooms: rooms.map((room) => room.toJSON()), page, limit };
};

// ── GET OWNER'S OWN ROOMS ─────────────────────────────────────

/**
 * Get all rooms posted by a specific owner (all statuses).
 * Used in the owner dashboard.
 */
const getOwnerRooms = async (ownerId, query) => {
  const { limit, offset, page } = parsePagination(query);

  const where = { owner_id: ownerId };

  if (query.status) {
    where.status = query.status;
  }

  const rooms = await Room.findAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { rooms: rooms.map((room) => room.toJSON()), page, limit };
};

// ── GET FEATURED ROOMS ────────────────────────────────────────

/**
 * Curated small set of rooms for the homepage "featured" strip.
 * Placeholder ranking (most recently approved) until an
 * `is_featured` column exists on the Room model.
 */
const getFeaturedRooms = async (query) => {
  const limit = Math.min(parseInt(query.limit) || 8, 20);

  const rooms = await Room.findAll({
    where: { approval_status: "APPROVED", status: "AVAILABLE" },
    limit,
    order: [["created_at", "DESC"]],
  });

  return { rooms: rooms.map((room) => room.toJSON()) };
};

// ── GET LATEST ROOMS ──────────────────────────────────────────

/**
 * Paginated, newest-first list of publicly available rooms.
 */
const getLatestRooms = async (query) => {
  const { limit, offset, page } = parsePagination(query);

  const rooms = await Room.findAll({
    where: { approval_status: "APPROVED", status: "AVAILABLE" },
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { rooms: rooms.map((room) => room.toJSON()), page, limit };
};

// ── GET ROOMS FOR MAP ─────────────────────────────────────────

/**
 * Lightweight list (uuid, title, price, location) for map pin rendering.
 * Supports the same district/city filters as the main search.
 */
const getRoomsForMap = async (query) => {
  const where = { approval_status: "APPROVED", status: "AVAILABLE" };

  if (query.city) where.city = query.city;
  if (query.district) where.district = query.district;
  if (query.roomType) where.room_type = query.roomType;

  const rooms = await Room.findAll({
    where,
    attributes: [
      "uuid",
      "title",
      "price_per_month",
      "location",
      "district",
      "city",
      "room_type",
    ],
  });

  return { rooms: rooms.map((room) => room.toJSON()) };
};

// ── GET NEARBY ROOMS ──────────────────────────────────────────

/**
 * Rooms within `radius` km of a given lat/lng, closest first.
 * Query params: lat, lng (required), radius (optional, default 5km).
 */
const getNearbyRooms = async (query) => {
  const { limit, offset, page } = parsePagination(query);

  const lat = parseFloat(query.lat);
  const lng = parseFloat(query.lng);
  if (isNaN(lat) || isNaN(lng)) {
    throw {
      status: 400,
      message: "lat and lng query parameters are required.",
    };
  }

  const radiusKm = query.radius ? parseFloat(query.radius) : 5;
  const radiusMeters = radiusKm * 1000;

  const point = sequelize.fn("ST_GeomFromText", `POINT(${lng} ${lat})`, 4326);
  const distanceExpr = sequelize.fn(
    "ST_Distance_Sphere",
    sequelize.col("location"),
    point,
  );

  const rooms = await Room.findAll({
    where: {
      approval_status: "APPROVED",
      status: "AVAILABLE",
      [Op.and]: [sequelize.where(distanceExpr, { [Op.lte]: radiusMeters })],
    },
    attributes: {
      include: [[distanceExpr, "distance_meters"]],
    },
    order: [[sequelize.literal("distance_meters"), "ASC"]],
    limit,
    offset,
  });

  return { rooms: rooms.map((room) => room.toJSON()), page, limit };
};

// ── GET SINGLE ROOM ───────────────────────────────────────────

/**
 * Get a single room with all its images.
 * Increments the view counter each time someone opens the detail page.
 */
const getRoomById = async (id) => {
  const room = await Room.findByPk(id, {
    include: [{ model: RoomImage, as: "images" }],
  });

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.approval_status === "APPROVED") {
    await Room.update(
      { views_count: sequelize.literal("views_count + 1") },
      { where: { uuid: id } },
    );
  }

  return { ...room.toJSON(), images: room.images || [] };
};

// ── GET SIMILAR ROOMS ─────────────────────────────────────────

const getSimilarRooms = async (roomId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  const similar = await Room.findAll({
    where: {
      uuid: { [Op.ne]: roomId },
      approval_status: "APPROVED",
      status: "AVAILABLE",
      [Op.or]: [
        { district: room.district },
        { room_type: room.room_type },
        {
          price_per_month: {
            [Op.between]: [
              room.price_per_month * 0.7,
              room.price_per_month * 1.3,
            ],
          },
        },
      ],
    },
    limit: 6,
    order: [["created_at", "DESC"]],
  });

  return similar.map((item) => item.toJSON());
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
    price_per_month,
    address,
    district,
    city,
    latitude,
    longitude,
    room_type,
    size_sqm,
  } = body;

  if (!title || !price_per_month || !address || !room_type || !size_sqm) {
    throw {
      status: 400,
      message:
        "Title, price_per_month, address, room_type, and size_sqm are required.",
    };
  }

  if (isNaN(price_per_month) || parseFloat(price_per_month) <= 0) {
    throw { status: 400, message: "Price must be a positive number." };
  }

  const validTypes = ["STUDIO", "1BR", "2BR", "SHARED"];
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
    price_per_month: parseFloat(price_per_month),
    deposit: body.deposit ? parseFloat(body.deposit) : 0,
    address,
    district,
    city,
    location: sequelize.fn(
      "ST_GeomFromText",
      `POINT(${longitude || 0} ${latitude || 0})`,
    ),
    room_type,
    status: "AVAILABLE",
    approval_status: "PENDING",
  });

  return room.toJSON();
};

// ── UPDATE ROOM ───────────────────────────────────────────────

/**
 * Owner edits their own room.
 * Verifies ownership before allowing the update.
 */
const updateRoom = async (roomId, ownerId, body) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only edit your own listings." };
  }

  if (room.status === "RENTED" || room.status === "INACTIVE") {
    throw { status: 400, message: "This listing can no longer be edited." };
  }

  const updates = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.price !== undefined)
    updates.price_per_month = parseFloat(body.price);
  if (body.address !== undefined) updates.address = body.address;
  if (body.district !== undefined) updates.district = body.district;
  if (body.city !== undefined) updates.city = body.city;
  if (body.room_type !== undefined) updates.room_type = body.room_type;
  if (body.size_sqm !== undefined) updates.size_sqm = parseFloat(body.size_sqm);

  if (room.status === "AVAILABLE") {
    await room.update({ approval_status: "PENDING" });
  }

  const updated = await room.update(updates);
  return updated.toJSON();
};

// ── DELETE ROOM ───────────────────────────────────────────────

/**
 * Owner deletes their own room.
 * Also cleans up all images from Cloudinary.
 */
const deleteRoom = async (roomId, ownerId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only delete your own listings." };
  }

  const images = await RoomImage.findAll({ where: { room_id: room.uuid } });
  for (const img of images) {
    await deleteFromCloudinary(img.cloudinary_public_id).catch(() => {
      console.warn(
        `Could not delete image from Cloudinary: ${img.cloudinary_public_id}`,
      );
    });
  }

  await room.destroy();
};

// ── MARK AS RENTED ────────────────────────────────────────────

const markAsRented = async (roomId, ownerId) => {
  const room = await Room.findByPk(roomId);

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only update your own listings." };
  }

  await room.update({ status: "RENTED" });
  return (await Room.findByPk(roomId)).toJSON();
};

// ── UPDATE ROOM STATUS (owner dashboard) ──────────────────────

/**
 * Generic status toggle used by PATCH /api/owner/rooms/:roomId/status.
 * Reuses the same rules as markAsRented, generalized to any valid status.
 */
const updateRoomStatus = async (roomId, ownerId, status) => {
  const validStatuses = ["AVAILABLE", "RENTED"];
  if (!validStatuses.includes(status)) {
    throw {
      status: 400,
      message: `Status must be one of: ${validStatuses.join(", ")}.`,
    };
  }

  const room = await Room.findByPk(roomId);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only update your own listings." };
  }

  await room.update({ status });
  return (await Room.findByPk(roomId)).toJSON();
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

  const room = await Room.findByPk(roomId);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (room.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only upload images to your own listings.",
    };
  }

  const existingImages = await RoomImage.findAll({
    where: { room_id: room.uuid },
  });
  if (existingImages.length + files.length > 10) {
    throw {
      status: 400,
      message: `A room can have at most 10 images. You already have ${existingImages.length}.`,
    };
  }

  const hasPrimary = existingImages.some((img) => img.is_primary);

  const uploaded = await Promise.all(
    files.map((file, index) =>
      uploadToCloudinary(file.buffer, "roomease/rooms").then(
        ({ url, public_id }) => ({
          room_id: room.uuid,
          image_url: url,
          cloudinary_public_id: public_id,
          is_primary: !hasPrimary && index === 0,
          sort_order: existingImages.length + index,
        }),
      ),
    ),
  );

  await RoomImage.bulkCreate(uploaded);
  const images = await RoomImage.findAll({ where: { room_id: room.uuid } });
  return images.map((image) => image.toJSON());
};

// ── DELETE IMAGE ──────────────────────────────────────────────

const deleteImage = async (roomId, imageId, ownerId) => {
  const room = await Room.findByPk(roomId);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only delete images from your own listings.",
    };
  }

  const deleted = await RoomImage.findByPk(imageId);
  if (!deleted) throw { status: 404, message: "Image not found." };

  await deleteFromCloudinary(deleted.cloudinary_public_id).catch(() => {
    console.warn(
      `Could not delete image from Cloudinary: ${deleted.cloudinary_public_id}`,
    );
  });

  await deleted.destroy();

  if (deleted.is_primary) {
    const remaining = await RoomImage.findAll({
      where: { room_id: room.uuid },
    });
    if (remaining.length > 0) {
      await remaining[0].update({ is_primary: true });
    }
  }
};

// ── SET PRIMARY IMAGE ─────────────────────────────────────────

const setPrimaryImage = async (roomId, imageId, ownerId) => {
  const room = await Room.findByPk(roomId);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.owner_id !== ownerId) {
    throw { status: 403, message: "You can only update your own listings." };
  }

  await RoomImage.update(
    { is_primary: false },
    { where: { room_id: room.uuid } },
  );
  await RoomImage.update(
    { is_primary: true },
    { where: { uuid: imageId, room_id: room.uuid } },
  );
  const images = await RoomImage.findAll({ where: { room_id: room.uuid } });
  return images.map((image) => image.toJSON());
};

module.exports = {
  getAllRooms,
  getFeaturedRooms,
  getLatestRooms,
  getRoomsForMap,
  getNearbyRooms,
  getOwnerRooms,
  getRoomById,
  getSimilarRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  markAsRented,
  updateRoomStatus,
  uploadImages,
  deleteImage,
  setPrimaryImage,
};
