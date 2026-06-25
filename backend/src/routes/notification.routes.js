const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const verifyToken = require("../middlewares/verifyToken");

// All notification routes require login
router.use(verifyToken);

// ── Note on route order ───────────────────────────────────────
// "/read-all" must be defined BEFORE "/:id/read"
// otherwise Express would try to match "read-all" as an :id param
router.get("/", notificationController.getMyNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.put("/read-all", notificationController.markAllRead);
router.put("/:id/read", notificationController.markOneRead);

module.exports = router;
