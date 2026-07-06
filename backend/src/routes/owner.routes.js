const express = require("express");
const router = express.Router();
const ownerController = require("../controllers/owner.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// Every route in this file requires a logged-in OWNER.
router.use(verifyToken, requireRole("OWNER"));

/**
 * @swagger
 * /api/owner/dashboard:
 *   get:
 *     summary: Owner dashboard summary
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/dashboard", ownerController.getDashboard);

// ── Owner Listings ─────────────────────────────────────────────

/**
 * @swagger
 * /api/owner/rooms:
 *   get:
 *     summary: Get my room listings (all statuses)
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/rooms", ownerController.getMyRooms);

/**
 * @swagger
 * /api/owner/rooms:
 *   post:
 *     summary: Submit a new room listing
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Room submitted successfully. }
 *       400: { description: Validation error. }
 */
router.post("/rooms", ownerController.createRoom);

/**
 * @swagger
 * /api/owner/rooms/{roomId}:
 *   get:
 *     summary: Get one of my rooms by id
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       403: { description: Not the owner of the listing. }
 *       404: { description: Room not found. }
 */
router.get("/rooms/:roomId", ownerController.getMyRoomById);

/**
 * @swagger
 * /api/owner/rooms/{roomId}:
 *   patch:
 *     summary: Edit one of my rooms
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Room updated. It will be re-reviewed by admin. }
 *       403: { description: Not the owner of the listing. }
 *       404: { description: Room not found. }
 */
router.patch("/rooms/:roomId", ownerController.updateRoom);

/**
 * @swagger
 * /api/owner/rooms/{roomId}:
 *   delete:
 *     summary: Delete one of my rooms
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Room deleted successfully. }
 *       403: { description: Not the owner of the listing. }
 *       404: { description: Room not found. }
 */
router.delete("/rooms/:roomId", ownerController.deleteRoom);

/**
 * @swagger
 * /api/owner/rooms/{roomId}/status:
 *   patch:
 *     summary: Change a room's AVAILABLE/RENTED status
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [AVAILABLE, RENTED] }
 *     responses:
 *       200: { description: Room status updated. }
 *       400: { description: Invalid status. }
 *       403: { description: Not the owner of the listing. }
 *       404: { description: Room not found. }
 */
router.patch("/rooms/:roomId/status", ownerController.updateRoomStatus);

// ── Viewing Requests ────────────────────────────────────────────

/**
 * @swagger
 * /api/owner/viewing-requests:
 *   get:
 *     summary: Get incoming viewing requests for my rooms
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED, SUGGESTED] }
 *     responses:
 *       200: { description: OK }
 */
router.get("/viewing-requests", ownerController.getViewingRequests);

// ── Statistics ────────────────────────────────────────────────

/**
 * @swagger
 * /api/owner/statistics:
 *   get:
 *     summary: Listing and viewing-request statistics for my account
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/statistics", ownerController.getStatistics);

// ── Profile ─────────────────────────────────────────────────────

/**
 * @swagger
 * /api/owner/profile:
 *   get:
 *     summary: Get my owner profile
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/profile", ownerController.getProfile);

/**
 * @swagger
 * /api/owner/profile:
 *   patch:
 *     summary: Update my owner profile
 *     tags: [Owner]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile updated successfully. }
 */
router.patch("/profile", ownerController.updateProfile);

module.exports = router;
