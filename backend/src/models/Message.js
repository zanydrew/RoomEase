const { pool } = require("../config/db");

/**
 * Fetch all messages in a conversation (oldest → newest).
 */
const findByConversation = async (conversationId) => {
  const [rows] = await pool.query(
    `SELECT
       m.*,
       u.name       AS sender_name,
       u.avatar_url AS sender_avatar,
       u.role       AS sender_role
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at ASC`,
    [conversationId]
  );
  return rows;
};

/**
 * Send a new message and bump the conversation's last_message_at.
 * The Conversation.touch() call is done in the service layer.
 */
const create = async (conversation_id, sender_id, content) => {
  const [result] = await pool.query(
    "INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)",
    [conversation_id, sender_id, content]
  );
  const [rows] = await pool.query(
    `SELECT m.*, u.name AS sender_name, u.avatar_url AS sender_avatar
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.id = ?`,
    [result.insertId]
  );
  return rows[0];
};

/**
 * Mark all messages in a conversation as read for the given recipient.
 * (Called when the other party opens the chat.)
 */
const markRead = async (conversationId, recipientId) => {
  await pool.query(
    "UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?",
    [conversationId, recipientId]
  );
};

module.exports = { findByConversation, create, markRead };
