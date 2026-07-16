const { Op } = require("sequelize");
const { Conversation, Message, Room, RoomImage, User } = require("../models");

const conversationIncludes = [
  {
    model: User,
    as: "renter",
    attributes: ["uuid", "full_name", "avatar_url"],
  },
  { model: User, as: "owner", attributes: ["uuid", "full_name", "avatar_url"] },
  {
    model: Room,
    as: "room",
    attributes: ["uuid", "title", "price_per_month"],
    include: [
      {
        model: RoomImage,
        as: "images",
        attributes: ["uuid", "image_url", "is_primary"],
        where: { is_primary: true },
        required: false,
      },
    ],
  },
];

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
 */
const startConversation = async (renterId, roomId) => {
  const room = await Room.findByPk(roomId);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }
  if (room.approval_status !== "APPROVED" || room.status !== "AVAILABLE") {
    throw { status: 400, message: "This room is not available." };
  }
  if (room.owner_id === renterId) {
    throw { status: 400, message: "You cannot chat with yourself." };
  }

  const existingConversation = await Conversation.findOne({
    where: {
      room_id: room.uuid,
      renter_id: renterId,
      owner_id: room.owner_id,
    },
  });

  const conversation =
    existingConversation ||
    (await Conversation.create({
      room_id: room.uuid,
      renter_id: renterId,
      owner_id: room.owner_id,
    }));

  let messages;
  if (!existingConversation) {
    const openingMsg = await Message.create({
      conversation_id: conversation.uuid,
      sender_id: renterId,
      content: OPENING_MESSAGE,
    });
    messages = [openingMsg];
  } else {
    messages = await Message.findAll({
      where: { conversation_id: conversation.uuid },
      order: [["created_at", "ASC"]],
    });
  }

  const conversationWithDetails = await Conversation.findByPk(
    conversation.uuid,
    { include: conversationIncludes },
  );

  return {
    conversation: conversation.toJSON(),
    messages: messages.map((message) => message.toJSON()),
  };
};

// ── GET MY CONVERSATIONS (INBOX) ──────────────────────────────

/**
 * Returns all conversations for the logged-in user,
 * whether they are the renter or the owner in each thread.
 */
const getMyConversations = async (userId) => {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [{ renter_id: userId }, { owner_id: userId }],
    },
    include: conversationIncludes,
    order: [["updated_at", "DESC"]],
  });

  return Promise.all(
    conversations.map(async (conversation) => {
      const [lastMessage, unreadCount] = await Promise.all([
        Message.findOne({
          where: { conversation_id: conversation.uuid },
          order: [["created_at", "DESC"]],
        }),
        Message.count({
          where: {
            conversation_id: conversation.uuid,
            sender_id: { [Op.ne]: userId },
            is_read: false,
          },
        }),
      ]);

      return {
        ...conversation.toJSON(),
        lastMessage: lastMessage ? lastMessage.toJSON() : null,
        unread_count: unreadCount,
      };
    }),
  );
};

// ── GET MESSAGES IN A CONVERSATION ───────────────────────────

/**
 * Fetch all messages in a conversation.
 * Also marks all unread messages as read for the caller.
 * Only participants (renter or owner) can read the conversation.
 */
const getMessages = async (conversationId, userId) => {
  const conversation = await Conversation.findByPk(conversationId, {
    include: conversationIncludes,
  });
  if (!conversation) {
    throw { status: 404, message: "Conversation not found." };
  }

  const isParticipant =
    conversation.renter_id === userId || conversation.owner_id === userId;
  if (!isParticipant) {
    throw { status: 403, message: "You are not part of this conversation." };
  }

  await Message.update(
    { is_read: true },
    {
      where: {
        conversation_id: conversation.uuid,
        sender_id: { [Op.ne]: userId },
        is_read: false,
      },
    },
  );

  const messages = await Message.findAll({
    where: { conversation_id: conversation.uuid },
    order: [["created_at", "ASC"]],
  });

  return {
    conversation: conversation.toJSON(),
    messages: messages.map((message) => message.toJSON()),
  };
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

  const conversation = await Conversation.findByPk(conversationId);
  if (!conversation) {
    throw { status: 404, message: "Conversation not found." };
  }

  const isParticipant =
    conversation.renter_id === senderId || conversation.owner_id === senderId;
  if (!isParticipant) {
    throw { status: 403, message: "You are not part of this conversation." };
  }

  const message = await Message.create({
    conversation_id: conversation.uuid,
    sender_id: senderId,
    content: content.trim(),
  });

  await conversation.update({ updated_at: new Date() });

  const recipientId =
    conversation.renter_id === senderId
      ? conversation.owner_id
      : conversation.renter_id;

  return message.toJSON();
};

// ── MARK CONVERSATION AS READ ─────────────────────────────────

/**
 * Called when a user opens a conversation —
 * marks all messages from the other person as read.
 */
const markAsRead = async (conversationId, userId) => {
  const conversation = await Conversation.findByPk(conversationId);
  if (!conversation) {
    throw { status: 404, message: "Conversation not found." };
  }

  const isParticipant =
    conversation.renter_id === userId || conversation.owner_id === userId;
  if (!isParticipant) {
    throw { status: 403, message: "You are not part of this conversation." };
  }

  await Message.update(
    { is_read: true },
    {
      where: {
        conversation_id: conversation.uuid,
        sender_id: { [Op.ne]: userId },
        is_read: false,
      },
    },
  );
};

module.exports = {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  markAsRead,
};
