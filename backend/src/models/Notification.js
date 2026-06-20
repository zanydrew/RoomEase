const { pool } = require("../config/db");

const findByUser = async (userId, { limit = 20, offset = 0 } = {}) => {
  const [rows] = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  return rows;
};

const countUnread = async (userId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = FALSE",
    [userId]
  );
  return rows[0].total;
};

/**
 * Create a notification for a single user.
 */
const create = async ({ user_id, type, title, body, reference_id, reference_type }) => {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, reference_id, reference_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, type, title, body || null, reference_id || null, reference_type || null]
  );
  const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ?", [result.insertId]);
  return rows[0];
};

const markRead = async (id, userId) => {
  await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
    [id, userId]
  );
};

const markAllRead = async (userId) => {
  await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE user_id = ?",
    [userId]
  );
};

module.exports = { findByUser, countUnread, create, markRead, markAllRead };
