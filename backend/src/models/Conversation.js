const { pool } = require("../config/db");

const BASE_SELECT = `
  SELECT
    c.*,
    r.title          AS room_title,
    r.status         AS room_status,
    img.image_url    AS room_image,
    renter.name      AS renter_name,
    renter.avatar_url AS renter_avatar,
    owner.name       AS owner_name,
    owner.avatar_url AS owner_avatar,
    -- Subquery: last message preview
    (SELECT content FROM messages m WHERE m.conversation_id = c.id
     ORDER BY m.created_at DESC LIMIT 1) AS last_message,
    -- Subquery: unread count for a specific user is computed at query time
    (SELECT COUNT(*) FROM messages m
     WHERE m.conversation_id = c.id AND m.is_read = FALSE) AS unread_count
  FROM conversations c
  LEFT JOIN rooms r    ON r.id = c.room_id
  LEFT JOIN room_images img ON img.room_id = r.id AND img.is_primary = TRUE
  JOIN users renter    ON renter.id = c.renter_id
  JOIN users owner     ON owner.id  = c.owner_id
`;

const findById = async (id) => {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE c.id = ?`, [id]);
  return rows[0] || null;
};

/**
 * Find or create a conversation for a room+renter+owner triple.
 * Called when renter clicks "Chat Owner".
 */
const findOrCreate = async (room_id, renter_id, owner_id) => {
  const [existing] = await pool.query(
    "SELECT id FROM conversations WHERE room_id = ? AND renter_id = ? AND owner_id = ?",
    [room_id, renter_id, owner_id]
  );
  if (existing.length) return findById(existing[0].id);

  const [result] = await pool.query(
    "INSERT INTO conversations (room_id, renter_id, owner_id) VALUES (?, ?, ?)",
    [room_id, renter_id, owner_id]
  );
  return findById(result.insertId);
};

/**
 * All conversations for a user (whether they are the renter or the owner).
 */
const findByUser = async (userId) => {
  const [rows] = await pool.query(
    `${BASE_SELECT}
     WHERE c.renter_id = ? OR c.owner_id = ?
     ORDER BY c.last_message_at DESC`,
    [userId, userId]
  );
  return rows;
};

/**
 * Bump last_message_at after a new message is sent.
 */
const touch = async (id) => {
  await pool.query(
    "UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?",
    [id]
  );
};

module.exports = { findById, findOrCreate, findByUser, touch };
