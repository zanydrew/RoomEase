const { pool } = require("../config/db");

const findByRoomId = async (roomId) => {
  const [rows] = await pool.query(
    "SELECT * FROM room_images WHERE room_id = ? ORDER BY display_order ASC",
    [roomId]
  );
  return rows;
};

const create = async ({ room_id, image_url, cloudinary_public_id, is_primary = false, display_order = 0 }) => {
  const [result] = await pool.query(
    `INSERT INTO room_images (room_id, image_url, cloudinary_public_id, is_primary, display_order)
     VALUES (?, ?, ?, ?, ?)`,
    [room_id, image_url, cloudinary_public_id, is_primary, display_order]
  );
  const [rows] = await pool.query("SELECT * FROM room_images WHERE id = ?", [result.insertId]);
  return rows[0];
};

/**
 * Insert many images in one query (used after multi-upload).
 * @param {Array<{room_id, image_url, cloudinary_public_id, is_primary, display_order}>} images
 */
const createMany = async (images) => {
  if (!images.length) return;
  const values = images.map((img) => [
    img.room_id,
    img.image_url,
    img.cloudinary_public_id,
    img.is_primary ?? false,
    img.display_order ?? 0,
  ]);
  await pool.query(
    `INSERT INTO room_images (room_id, image_url, cloudinary_public_id, is_primary, display_order)
     VALUES ?`,
    [values]
  );
};

const setPrimary = async (imageId, roomId) => {
  // Unset all, then set the target
  await pool.query("UPDATE room_images SET is_primary = FALSE WHERE room_id = ?", [roomId]);
  await pool.query("UPDATE room_images SET is_primary = TRUE WHERE id = ?", [imageId]);
};

const remove = async (id) => {
  const [rows] = await pool.query("SELECT * FROM room_images WHERE id = ?", [id]);
  await pool.query("DELETE FROM room_images WHERE id = ?", [id]);
  return rows[0] || null; // return deleted row so caller can remove from Cloudinary
};

const removeAllByRoom = async (roomId) => {
  const [rows] = await pool.query("SELECT * FROM room_images WHERE room_id = ?", [roomId]);
  await pool.query("DELETE FROM room_images WHERE room_id = ?", [roomId]);
  return rows; // caller deletes each from Cloudinary
};

module.exports = { findByRoomId, create, createMany, setPrimary, remove, removeAllByRoom };
