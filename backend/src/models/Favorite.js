const { pool } = require("../config/db");

/**
 * Get all rooms saved by a user (joins room + primary image).
 */
const findByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
       f.id AS favorite_id,
       f.created_at AS saved_at,
       r.id, r.title, r.price, r.price_unit, r.district, r.room_type, r.status,
       img.image_url AS primary_image
     FROM favorites f
     JOIN rooms r ON r.id = f.room_id
     LEFT JOIN room_images img ON img.room_id = r.id AND img.is_primary = TRUE
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
};

/**
 * Check if a specific room is already saved by a user.
 */
const exists = async (userId, roomId) => {
  const [rows] = await pool.query(
    "SELECT id FROM favorites WHERE user_id = ? AND room_id = ?",
    [userId, roomId]
  );
  return rows.length > 0;
};

const create = async (userId, roomId) => {
  // INSERT IGNORE prevents duplicate error from UNIQUE KEY
  await pool.query(
    "INSERT IGNORE INTO favorites (user_id, room_id) VALUES (?, ?)",
    [userId, roomId]
  );
};

const remove = async (userId, roomId) => {
  await pool.query(
    "DELETE FROM favorites WHERE user_id = ? AND room_id = ?",
    [userId, roomId]
  );
};

module.exports = { findByUser, exists, create, remove };
