const notificationService = require("../services/notification.service");
const { success, error } = require("../utils/response");

// ── GET /api/notifications ────────────────────────────────────
// Returns the full notification feed for the logged-in user.
// Supports ?page=1&limit=20
const getMyNotifications = async (req, res) => {
  try {
    const result = await notificationService.getMyNotifications(
      req.user.id,
      req.query,
    );
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/notifications/unread-count ───────────────────────
// Returns just the unread count for the notification badge.
// Kept as a separate lightweight endpoint so the frontend
// can poll this without loading the full notification list.
const getUnreadCount = async (req, res) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    return success(res, result, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/notifications/:id/read ──────────────────────────
// Mark a single notification as read.
const markOneRead = async (req, res) => {
  try {
    await notificationService.markOneRead(req.params.id, req.user.id);
    return success(res, null, "Notification marked as read.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/notifications/read-all ──────────────────────────
// Mark all notifications as read — called when user opens the
// notification panel and clicks "Mark all as read".
const markAllRead = async (req, res) => {
  try {
    await notificationService.markAllRead(req.user.id);
    return success(res, null, "All notifications marked as read.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markOneRead,
  markAllRead,
};
