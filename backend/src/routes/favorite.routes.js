const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const verifyToken = require("../middlewares/verifyToken");

// All favorite routes require login
router.use(verifyToken);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Retrieve renter's saved favorites
 *     description: Pulls properties bookmarked by the active renter to show inside their personal favorites page.
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Collection list of bookmarked room records.
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
router.get("/", favoriteController.getMyFavorites);

/**
 * @swagger
 * /api/favorites/{roomId}/check:
 *   get:
 *     summary: Check if a room is saved
 *     description: Checks if a specific room is currently saved by the active renter.
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID to check
 *     responses:
 *       200:
 *         description: Object indicating boolean saved state.
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
router.get("/:roomId/check", favoriteController.checkIfSaved);

/**
 * @swagger
 * /api/favorites/{roomId}:
 *   post:
 *     summary: Bookmark/Save a room
 *     description: Links a specific room to the user's saved list. Safe to call multiple times.
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID to bookmark
 *     responses:
 *       200:
 *         description: Room already saved.
 *       201:
 *         description: Success confirmation envelope.
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
 *                   example: Room saved successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/:roomId", favoriteController.saveRoom);

/**
 * @swagger
 * /api/favorites/{roomId}:
 *   delete:
 *     summary: Remove room from bookmarks
 *     description: Unlinks and removes a room from the user's saved bookmarks list.
 *     tags:
 *       - Favorites
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID to remove from bookmarks
 *     responses:
 *       200:
 *         description: Success indication tracking block.
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
 *                   example: Room removed from saved list.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Saved room record not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete("/:roomId", favoriteController.unsaveRoom);

module.exports = router;
