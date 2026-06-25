const chatService = require("../services/chat.service");
const { success, error } = require("../utils/response");

// ── POST /api/conversations/start ─────────────────────────────
// Renter clicks "Chat Owner" on a room detail page.
// Finds or creates a conversation and auto-sends the opening message.
const startConversation = async (req, res) => {
  try {
    const { room_id } = req.body;

    if (!room_id) {
      return error(res, "room_id is required.", 400);
    }

    const result = await chatService.startConversation(req.user.id, room_id);
    return success(res, result, "Conversation ready.", 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/conversations ────────────────────────────────────
// Returns the inbox — all conversations for the logged-in user.
// Works for both renters and owners.
const getMyConversations = async (req, res) => {
  try {
    const conversations = await chatService.getMyConversations(req.user.id);
    return success(res, { conversations }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/conversations/:id/messages ───────────────────────
// Fetch all messages in a conversation.
// Also marks unread messages as read automatically.
const getMessages = async (req, res) => {
  try {
    const result = await chatService.getMessages(req.params.id, req.user.id);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── POST /api/conversations/:id/messages ──────────────────────
// Send a new message inside a conversation.
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return error(res, "Message content is required.", 400);
    }

    const message = await chatService.sendMessage(
      req.params.id,
      req.user.id,
      content,
    );
    return success(res, { message }, "Message sent.", 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/conversations/:id/read ───────────────────────────
// Mark all messages in a conversation as read for the caller.
const markAsRead = async (req, res) => {
  try {
    await chatService.markAsRead(req.params.id, req.user.id);
    return success(res, null, "Messages marked as read.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markAsRead,
};
