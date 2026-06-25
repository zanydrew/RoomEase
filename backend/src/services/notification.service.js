const Notification = require("../models/Notification");
const { parsePagination } = require("../utils/pagination");

// ── GET MY NOTIFICATIONS ──────────────────────────────────────

/**
 * Get the notification feed for the logged-in user.
 * Supports pagination — newer notifications come first.
 */
const getMyNotifications = async (userId, query) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const notifications = await Notification.findByUser(userId, {
    limit,
    offset,
  });
  return { notifications, page, limit };
};

// ── GET UNREAD COUNT ──────────────────────────────────────────

/**
 * Returns just the count of unread notifications.
 * Called frequently by the frontend to update the badge number
 * on the bell icon — kept lightweight on purpose.
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countUnread(userId);
  return { count };
};

// ── MARK ONE AS READ ──────────────────────────────────────────

const markOneRead = async (notificationId, userId) => {
  await Notification.markRead(notificationId, userId);
};

// ── MARK ALL AS READ ──────────────────────────────────────────

const markAllRead = async (userId) => {
  await Notification.markAllRead(userId);
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
};
