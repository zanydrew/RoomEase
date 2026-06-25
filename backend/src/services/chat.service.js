const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Room = require("../models/Room");
const Notification = require("../models/Notification");

// Auto-sent opening message when renter clicks "Chat Owner"
const OPENING_MESSAGE =
  "Hi, I'm interested in this room. Is it still available?";

// ── START OR OPEN A CONVERSATION ──────────────────────────────

/**
 * Called when a renter clicks "Chat Owner" on a room detail page.
 *
 * Behaviour:
 * - If a conversation already exists for this room+renter+owner → return it
 * - If not → create it and auto-send the opening message
 *
 * This means clicking "Chat Owner" multiple times is always safe —
 * it never creates duplicate threads.
 */
const startConversation = async (renterId, roomId) => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }
  if (room.status !== "approved") {
    throw { status: 400, message: "This room is not available." };
  }
  if (room.owner_id === renterId) {
    throw { status: 400, message: "You cannot chat with yourself." };
  }

  // Find existing conversation or create a new one
  const isNew = !(await checkConversationExists(
    roomId,
    renterId,
    room.owner_id,
  ));
  const conversation = await Conversation.findOrCreate(
    roomId,
    renterId,
    room.owner_id,
  );

  // Only auto-send the opening message for brand new conversations
  if (isNew) {
    await Message.create(conversation.id, renterId, OPENING_MESSAGE);
    await Conversation.touch(conversation.id);

    // Notify the owner
    await Notification.create({
      user_id: room.owner_id,
      type: "new_message",
      title: "New Message",
      body: `Someone sent you a message about "${room.title}".`,
      reference_id: conversation.id,
      reference_type: "conversation",
    });
  }

  // Return conversation with its messages
  const messages = await Message.findByConversation(conversation.id);
  return { conversation, messages };
};

// Helper — check if a conversation already exists
const checkConversationExists = async (roomId, renterId, ownerId) => {
  const conv = await Conversation.findOrCreate(roomId, renterId, ownerId);
  // findOrCreate always returns a conversation, so we check if messages exist
  const messages = await Message.findByConversation(conv.id);
  return messages.length > 0;
};

// ── GET MY CONVERSATIONS (INBOX) ──────────────────────────────

/**
 * Returns all conversations for the logged-in user,
 * whether they are the renter or the owner in each thread.
 */
const getMyConversations = async (userId) => {
  return Conversation.findByUser(userId);
};

// ── GET MESSAGES IN A CONVERSATION ───────────────────────────

/**
 * Fetch all messages in a conversation.
 * Also marks all unread messages as read for the caller.
 * Only participants (renter or owner) can read the conversation.
 */
const getMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw { status: 404, message: "Conversation not found." };
  }

  // Only the two participants can read this conversation
  const isParticipant =
    conversation.renter_id === userId || conversation.owner_id === userId;
  if (!isParticipant) {
    throw { status: 403, message: "You are not part of this conversation." };
  }

  // Mark all messages from the OTHER person as read
  await Message.markRead(conversationId, userId);

  const messages = await Message.findByConversation(conversationId);
  return { conversation, messages };
};

// ── SEND A MESSAGE ────────────────────────────────────────────

/**
 * Send a new message inside a conversation.
 * Notifies the other participant.
 */
const sendMessage = async (conversationId, senderId, content) => {
  if (!content || !content.trim()) {
    throw { status: 400, message: "Message content cannot be empty." };
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw { status: 404, message: "Conversation not found." };
  }

  // Only participants can send messages
  const isParticipant =
    conversation.renter_id === senderId || conversation.owner_id === senderId;
  if (!isParticipant) {
    throw { status: 403, message: "You are not part of this conversation." };
  }

  // Save the message
  const message = await Message.create(
    conversationId,
    senderId,
    content.trim(),
  );

  // Bump the conversation's last_message_at so inbox sorts correctly
  await Conversation.touch(conversationId);

  // Notify the OTHER participant
  const recipientId =
    conversation.renter_id === senderId
      ? conversation.owner_id
      : conversation.renter_id;

  await Notification.create({
    user_id: recipientId,
    type: "new_message",
    title: "New Message",
    body: content.length > 60 ? content.substring(0, 60) + "…" : content,
    reference_id: conversationId,
    reference_type: "conversation",
  });

  return message;
};

// ── MARK CONVERSATION AS READ ─────────────────────────────────

/**
 * Called when a user opens a conversation —
 * marks all messages from the other person as read.
 */
const markAsRead = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw { status: 404, message: "Conversation not found." };
  }

  const isParticipant =
    conversation.renter_id === userId || conversation.owner_id === userId;
  if (!isParticipant) {
    throw { status: 403, message: "You are not part of this conversation." };
  }

  await Message.markRead(conversationId, userId);
};

module.exports = {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markAsRead,
};
