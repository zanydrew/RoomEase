const express = require("express");
const router = express.Router();
const chatController = require("../controllers/conversation.controller");
const verifyToken = require("../middlewares/verifyToken");

// All chat routes require login
router.use(verifyToken);

// Conversations (inbox)
router.post("/start", chatController.startConversation);
router.get("/", chatController.getMyConversations);

// Messages inside a conversation
router.get("/:id/messages", chatController.getMessages);
router.post("/:id/messages", chatController.sendMessage);
router.put("/:id/read", chatController.markAsRead);

module.exports = router;
