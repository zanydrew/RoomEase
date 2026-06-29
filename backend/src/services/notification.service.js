const { Op } = require("sequelize");
const { Notification } = require("../models");
const { parsePagination } = require("../utils/pagination");

// ── GET MY NOTIFICATIONS ──────────────────────────────────────

const getMyNotifications = async (userId, query) => {
  const { limit, offset, page } = parsePagination(query, 20);
  const notifications = await Notification.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return { notifications: notifications.map((n) => n.toJSON()), page, limit };
};

// ── GET UNREAD COUNT ──────────────────────────────────────────

const getUnreadCount = async (userId) => {
  const count = await Notification.count({
    where: { user_id: userId, is_read: false },
  });
  return { count };
};

// ── MARK ONE AS READ ──────────────────────────────────────────

const markOneRead = async (notificationId, userId) => {
  await Notification.update(
    { is_read: true },
    { where: { uuid: notificationId, user_id: userId } },
  );
};

// ── MARK ALL AS READ ──────────────────────────────────────────

const markAllRead = async (userId) => {
  await Notification.update(
    { is_read: true },
    { where: { user_id: userId, is_read: false } },
  );
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
};
