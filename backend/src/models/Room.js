const { pool } = require("../config/db");

// ── Base SELECT (joins owner info + primary image) ────────────
const BASE_SELECT = `
  SELECT
    r.*,
    u.name          AS owner_name,
    u.phone         AS owner_phone,
    u.avatar_url    AS owner_avatar,
    u.is_verified   AS owner_is_verified,
    img.image_url   AS primary_image
  FROM rooms r
  JOIN users u ON u.id = r.owner_id
  LEFT JOIN room_images img ON img.room_id = r.id AND img.is_primary = TRUE
`;

// ── READ ──────────────────────────────────────────────────────

const findById = async (id) => {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE r.id = ?`, [id]);
  return rows[0] || null;
};

const findAll = async ({
  status = "approved",
  district,
  room_type,
  min_price,
  max_price,
  search,        // full-text keyword on title/address
  owner_id,
  limit = 12,
  offset = 0,
} = {}) => {
  let query = `${BASE_SELECT} WHERE 1=1`;
  const params = [];

  if (status) {
    query += " AND r.status = ?";
    params.push(status);
  }
  if (district) {
    query += " AND r.district = ?";
    params.push(district);
  }
  if (room_type) {
    query += " AND r.room_type = ?";
    params.push(room_type);
  }
  if (min_price !== undefined) {
    query += " AND r.price >= ?";
    params.push(min_price);
  }
  if (max_price !== undefined) {
    query += " AND r.price <= ?";
    params.push(max_price);
  }
  if (search) {
    query += " AND (r.title LIKE ? OR r.address LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (owner_id) {
    query += " AND r.owner_id = ?";
    params.push(owner_id);
  }

  query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Similar rooms: same district OR overlapping price band, excluding current room.
 */
const findSimilar = async (roomId, { district, price, room_type, limit = 6 }) => {
  const [rows] = await pool.query(
    `${BASE_SELECT}
     WHERE r.id != ?
       AND r.status = 'approved'
       AND (
         r.district = ?
         OR (r.price BETWEEN ? AND ?)
         OR r.room_type = ?
       )
     ORDER BY r.created_at DESC
     LIMIT ?`,
    [roomId, district, price * 0.7, price * 1.3, room_type, limit]
  );
  return rows;
};

// ── CREATE ────────────────────────────────────────────────────

const create = async ({
  owner_id,
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
}) => {
  const [result] = await pool.query(
    `INSERT INTO rooms
       (owner_id, title, description, price, price_unit, address, district, city,
        latitude, longitude, room_type, size_sqm, amenities, nearby_places, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      owner_id, title, description, price, price_unit || "month",
      address, district, city || "Phnom Penh",
      latitude || null, longitude || null,
      room_type, size_sqm || null,
      JSON.stringify(amenities || []),
      JSON.stringify(nearby_places || []),
    ]
  );
  return findById(result.insertId);
};

// ── UPDATE ────────────────────────────────────────────────────

const update = async (id, fields) => {
  const allowed = [
    "title", "description", "price", "price_unit", "address",
    "district", "city", "latitude", "longitude", "room_type",
    "size_sqm", "amenities", "nearby_places",
  ];

  const setClauses = [];
  const params = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      const val = ["amenities", "nearby_places"].includes(key)
        ? JSON.stringify(fields[key])
        : fields[key];
      params.push(val);
    }
  }

  if (setClauses.length === 0) return findById(id);

  params.push(id);
  await pool.query(`UPDATE rooms SET ${setClauses.join(", ")} WHERE id = ?`, params);
  return findById(id);
};

const setStatus = async (id, status, rejection_reason = null) => {
  await pool.query(
    "UPDATE rooms SET status = ?, rejection_reason = ? WHERE id = ?",
    [status, rejection_reason, id]
  );
};

const incrementViews = async (id) => {
  await pool.query("UPDATE rooms SET views_count = views_count + 1 WHERE id = ?", [id]);
};

// ── DELETE ────────────────────────────────────────────────────

const remove = async (id) => {
  await pool.query("DELETE FROM rooms WHERE id = ?", [id]);
};

// ── ANALYTICS ─────────────────────────────────────────────────

const countByStatus = async () => {
  const [rows] = await pool.query(
    "SELECT status, COUNT(*) AS total FROM rooms GROUP BY status"
  );
  return rows;
};

const popularDistricts = async (limit = 5) => {
  const [rows] = await pool.query(
    `SELECT district, COUNT(*) AS total
     FROM rooms
     WHERE status = 'approved' AND district IS NOT NULL
     GROUP BY district
     ORDER BY total DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

module.exports = {
  findById,
  findAll,
  findSimilar,
  create,
  update,
  setStatus,
  incrementViews,
  remove,
  countByStatus,
  popularDistricts,
};
