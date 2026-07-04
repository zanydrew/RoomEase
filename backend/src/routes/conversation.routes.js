const express = require("express");
const router = express.Router();
const chatController = require("../controllers/conversation.controller");
const verifyToken = require("../middlewares/verifyToken");

// All chat routes require login
router.use(verifyToken);

// Conversations (inbox)

/**
 * @swagger
 * /api/conversations/start:
 *   post:
 *     summary: Start a conversation linked to a listing
 *     description: Initializes a context-bound direct chat thread anchored straight to a specific listing. Sends a system opening message.
 *     tags:
 *       - Conversations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *             properties:
 *               room_id:
 *                 type: string
 *                 format: uuid
 *                 example: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
 *     responses:
 *       201:
 *         description: Conversation room identifier node details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Conversation ready.
 *                 data:
 *                   type: object
 *       400:
 *         description: Room ID is required.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/start", chatController.startConversation);

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Retrieve user's inbox conversations
 *     description: Fetches active inbox conversations with their latest messages to populate dashboard text feeds.
 *     tags:
 *       - Conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of thread records sorted chronologically.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/", chatController.getMyConversations);

// Messages inside a conversation

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   get:
 *     summary: Retrieve message ledger history
 *     description: Extracts full chronological message ledger histories running inside a conversation. Automatically marks unread messages as read.
 *     tags:
 *       - Conversations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Conversation UUID
 *     responses:
 *       200:
 *         description: Ordered array of text message records.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OK
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Conversation not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/:id/messages", chatController.getMessages);

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   post:
 *     summary: Append a message to conversation
 *     description: Appends a message block onto an active conversation session context.
 *     tags:
 *       - Conversations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Conversation UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The text message content to send
 *                 example: Hello, is this room still available?
 *     responses:
 *       201:
 *         description: Newly persistent text message node instance.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Message sent.
 *                 data:
 *                   type: object
 *       400:
 *         description: Content is required.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Conversation not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/:id/messages", chatController.sendMessage);

/**
 * @swagger
 * /api/conversations/{id}/read:
 *   put:
 *     summary: Mark messages as read
 *     description: Mark all messages in a conversation as read for the calling user.
 *     tags:
 *       - Conversations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Conversation UUID
 *     responses:
 *       200:
 *         description: Messages successfully marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Messages marked as read.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Conversation not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/:id/read", chatController.markAsRead);

module.exports = router;
