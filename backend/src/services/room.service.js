const { Op } = require("sequelize");
const {
  Room,
  RoomImage,
  University,
  Amenity,
  User,
  sequelize,
} = require("../models");
const { uploadImage, deleteFromCloudinary } = require("../utils/imageUpload");
const { parsePagination } = require("../utils/pagination");

// ── AMENITIES HELPER ───────────────────────────────────────────

// Reusable attribute/include shape so every list & detail query surfaces
// amenities the same way (no join-table columns leaking into the response).
const amenitiesInclude = {
  model: Amenity,
  as: "amenities",
  attributes: ["id", "name", "icon"],
  through: { attributes: [] },
};

/**
 * Validate and attach amenities to a room via the Room<->Amenity
 * belongsToMany association (Room.belongsToMany(Amenity, { as: "amenities" })
 * in models/index.js already gives every Room instance a setAmenities()
 * mixin — no need to touch RoomAmenity directly).
 *
 * - `amenity_ids` undefined  → leave existing amenities untouched (used by
 *   updateRoom, so a PATCH that doesn't mention amenities doesn't wipe them).
 * - `amenity_ids` an array   → replace the room's amenities with exactly
 *   this set (validates every id exists first; [] clears them all).
 */
const setRoomAmenities = async (room, amenity_ids) => {
  if (amenity_ids === undefined) return;

  if (!Array.isArray(amenity_ids)) {
    throw {
      status: 400,
      message: "amenity_ids must be an array of amenity ids.",
    };
  }

  if (amenity_ids.length === 0) {
    await room.setAmenities([]);
    return;
  }

  const ids = [...new Set(amenity_ids.map((id) => parseInt(id, 10)))];

  if (ids.some((id) => isNaN(id))) {
    throw { status: 400, message: "amenity_ids must contain only valid ids." };
  }

  const found = await Amenity.findAll({ where: { id: ids } });
  if (found.length !== ids.length) {
    throw { status: 400, message: "One or more amenity_ids do not exist." };
  }

  await room.setAmenities(ids);
};

// ── ROOM IMAGES (THUMBNAIL) HELPER ─────────────────────────────

// List pages only need ONE cover photo per room, not the full gallery.
// Filtering the eager-loaded association to is_primary: true (rather than
// fetching all images and slicing in JS) keeps this a single SQL JOIN —
// no extra round trip, no N+1, and no over-fetching of unused images.
// `required: false` keeps rooms with no primary image yet (should not
// normally happen — uploadImages() always assigns one — but a listing
// with zero images uploaded is still valid and must still be returned).
const thumbnailInclude = {
  model: RoomImage,
  as: "images",
  attributes: ["uuid", "image_url", "sort_order"],
};

// Shapes a room's images the way the frontend list/browse pages expect:
// { image_id, image_url, display_order }[] — at most one entry.
const withThumbnail = (room) => {
  const json = room.toJSON();
  const images = json.images || [];
  const best =
    images.find((img) => img.is_primary) ||
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0];
  json.images = best
    ? [
        {
          image_id: best.uuid,
          image_url: best.image_url,
          display_order: best.sort_order,
        },
      ]
    : [];
  return json;
};

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

  if (query.amenities) {
    const amenityIds = query.amenities.split(",").map((id) => parseInt(id, 10));
    const cleanIds = amenityIds.filter((id) => !isNaN(id));
    if (cleanIds.length > 0) {
      where.uuid = {
        ...(where.uuid || {}),
        [Op.in]: sequelize.literal(`(
          SELECT room_id FROM ROOM_AMENITIES
          WHERE amenity_id IN (${cleanIds.join(",")})
          GROUP BY room_id
          HAVING COUNT(DISTINCT amenity_id) = ${cleanIds.length}
        )`),
      };
    }
  }

  if (query.keyword) {
    const needle = `%${query.keyword.toLowerCase()}%`;
    where[Op.or] = [
      sequelize.where(sequelize.fn("LOWER", sequelize.col("title")), {
        [Op.like]: needle,
      }),
      sequelize.where(sequelize.fn("LOWER", sequelize.col("address")), {
        [Op.like]: needle,
      }),
      sequelize.where(sequelize.fn("LOWER", sequelize.col("district")), {
        [Op.like]: needle,
      }),
    ];
  }

  const include = [{ model: RoomImage, as: "images" }];
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

  const { count, rows } = await Room.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order,
    distinct: true,
    col: "uuid",
  });

  return { rooms: rows.map(withThumbnail), page, limit, total: count };
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

  const { count, rows } = await Room.findAndCountAll({
    where,
    include: [{ model: RoomImage, as: "images" }],
    limit,
    offset,
    order: [["created_at", "DESC"]],
    distinct: true,
    col: "uuid",
  });

  return { rooms: rows.map(withThumbnail), page, limit, total: count };
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
    include: [{ model: RoomImage, as: "images" }],
    limit,
    order: [["created_at", "DESC"]],
  });

  return { rooms: rooms.map((room) => room.toJSON()) };
};

// ── GET HOME PAGE SECTIONS ──────────────────────────────────────

/**
 * Pre-built room rails for the homepage, so the frontend can render the
 * whole page from a single request instead of composing several
 * independent calls (including a name → id university lookup) itself.
 *
 * - `district`: rooms in a specific district (defaults to "Toul Kork",
 *   matching the Figma; pass ?district= to override).
 * - `university`: rooms near a named university (defaults to "Royal
 *   University of Phnom Penh"; falls back to newest rooms if no
 *   university matches that name).
 * - `affordable`: cheapest available rooms, price ascending.
 */
const getHomeSections = async (query) => {
  const limit = Math.min(parseInt(query.limit) || 4, 20);
  const baseWhere = { approval_status: "APPROVED", status: "AVAILABLE" };

  const districtName = query.district || "Toul Kork";
  const universityName = query.university || "Royal University of Phnom Penh";

  const [districtRooms, universityMatch, affordableRooms] = await Promise.all([
    Room.findAll({
      where: {
        ...baseWhere,
        [Op.and]: sequelize.where(
          sequelize.fn("LOWER", sequelize.col("district")),
          districtName.toLowerCase(),
        ),
      },
      include: [amenitiesInclude, thumbnailInclude],
      limit,
      order: [["created_at", "DESC"]],
    }),
    University.findOne({
      where: { name: { [Op.like]: `%${universityName}%` } },
    }),
    Room.findAll({
      where: baseWhere,
      include: [amenitiesInclude, thumbnailInclude],
      limit,
      order: [["price_per_month", "ASC"]],
    }),
  ]);

  let universityRooms;
  if (universityMatch) {
    universityRooms = await Room.findAll({
      where: baseWhere,
      include: [
        amenitiesInclude,
        thumbnailInclude,
        {
          model: University,
          as: "nearbyUniversities",
          where: { id: universityMatch.id },
          attributes: [],
        },
      ],
      limit,
      order: [["created_at", "DESC"]],
    });
  } else {
    // No matching university on record — fall back to the newest
    // listings rather than returning an empty rail.
    universityRooms = await Room.findAll({
      where: baseWhere,
      include: [amenitiesInclude, thumbnailInclude],
      limit,
      order: [["created_at", "DESC"]],
    });
  }

  return {
    sections: [
      {
        type: "district",
        label: districtName,
        rooms: districtRooms.map(withThumbnail),
      },
      {
        type: "university",
        label: universityMatch ? universityMatch.name : universityName,
        id: universityMatch ? universityMatch.id : null,
        rooms: universityRooms.map(withThumbnail),
      },
      {
        type: "affordable",
        label: null,
        rooms: affordableRooms.map(withThumbnail),
      },
    ],
  };
};

// ── GET LATEST ROOMS ──────────────────────────────────────────

/**
 * Paginated, newest-first list of publicly available rooms.
 */
const getLatestRooms = async (query) => {
  const { limit, offset, page } = parsePagination(query);

  const rooms = await Room.findAll({
    where: { approval_status: "APPROVED", status: "AVAILABLE" },
    include: [{ model: RoomImage, as: "images" }],
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });

  return { rooms: rooms.map(withThumbnail), page, limit };
};

// ── GET ROOMS FOR MAP ─────────────────────────────────────────

/**
 * Lightweight list (uuid, title, price, location) for map pin rendering.
 * Supports the same district/city filters as the main search.
 *
 * Intentionally does NOT include images/amenities: a map view can render
 * hundreds of pins at once, and pins don't display photos — adding images
 * here would bloat the payload against this endpoint's own "lightweight"
 * design goal. If the frontend's map pin/preview popup needs a thumbnail,
 * say so and this can add the same thumbnailInclude used below.
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
    include: [amenitiesInclude, thumbnailInclude],
    attributes: {
      include: [[distanceExpr, "distance_meters"]],
    },
    order: [[sequelize.literal("distance_meters"), "ASC"]],
    limit,
    offset,
  });

  return { rooms: rooms.map(withThumbnail), page, limit };
};

// ── GET SINGLE ROOM ───────────────────────────────────────────

/**
 * Get a single room with all its images.
 * Increments the view counter each time someone opens the detail page.
 */
const getRoomById = async (id, { countView = false } = {}) => {
  const room = await Room.findByPk(id, {
    include: [
      { model: RoomImage, as: "images" },
      amenitiesInclude,
      {
        model: User,
        as: "owner",
        attributes: ["uuid", "full_name", "phone_number", "avatar_url"],
      },
      {
        model: University,
        as: "nearbyUniversities",
        attributes: ["id", "name"],
        through: { attributes: ["distance_km", "walk_minutes"] },
      },
    ],
  });

  if (!room) {
    throw { status: 404, message: "Room not found." };
  }

  if (countView && room.approval_status === "APPROVED") {
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
    include: [amenitiesInclude, thumbnailInclude],
    limit: 6,
    order: [["created_at", "DESC"]],
  });

  return similar.map(withThumbnail);
};

// ── CREATE ROOM ───────────────────────────────────────────────

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
    amenity_ids,
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
    approval_status: "APPROVED",
  });

  // amenity_ids is optional on create — if provided, attach; if omitted,
  // the room simply starts with no amenities (nothing to do).
  await setRoomAmenities(room, amenity_ids);

  const roomWithAmenities = await Room.findByPk(room.uuid, {
    include: [amenitiesInclude],
  });
  return roomWithAmenities.toJSON();

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

  const updated = await room.update(updates);

  // amenity_ids omitted → leave amenities as-is. Provided (even []) → replace.
  await setRoomAmenities(updated, body.amenity_ids);

  const roomWithAmenities = await Room.findByPk(updated.uuid, {
    include: [amenitiesInclude],
  });
  return roomWithAmenities.toJSON();
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
    await deleteFromCloudinary(img.image_url).catch(() => {
      console.warn(`Could not delete image from Cloudinary: ${img.image_url}`);
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
const uploadImages = async (roomId, ownerId, images) => {
  if (!images || images.length === 0) {
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
  if (existingImages.length + images.length > 10) {
    throw {
      status: 400,
      message: `A room can have at most 10 images. You already have ${existingImages.length}.`,
    };
  }

  const hasPrimary = existingImages.some((img) => img.is_primary);

  const uploaded = await Promise.all(
    images.map((base64Str, index) =>
      uploadImage(base64Str, "roomease/rooms").then(({ url }) => ({
        room_id: room.uuid,
        image_url: url,
        is_primary: !hasPrimary && index === 0,
        sort_order: existingImages.length + index,
      })),
    ),
  );

  await RoomImage.bulkCreate(uploaded);
  const resultImages = await RoomImage.findAll({
    where: { room_id: room.uuid },
  });
  return resultImages.map((image) => image.toJSON());
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

  await deleteFromCloudinary(deleted.image_url).catch(() => {
    console.warn(
      `Could not delete image from Cloudinary: ${deleted.image_url}`,
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
  getHomeSections,
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
