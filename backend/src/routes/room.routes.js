const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const { uploadMultiple, handleUpload } = require("../middlewares/upload");

// ── Public routes (no login needed) ──────────────────────────
// Owner-only listing management (create/edit/delete/status) now
// lives in owner.routes.js under /api/owner/rooms.

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Browse and search room listings
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *       - in: query
 *         name: keyword
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: province
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: roomType
 *         schema: { type: string, enum: [STUDIO, 1BR, 2BR, SHARED] }
 *       - in: query
 *         name: bedrooms
 *         schema: { type: integer }
 *       - in: query
 *         name: bathrooms
 *         schema: { type: integer }
 *       - in: query
 *         name: available
 *         schema: { type: boolean }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [price_asc, price_desc, newest, oldest] }
 *     responses:
 *       200: { description: OK }
 */
router.get("/", roomController.getAllRooms);

/**
 * @swagger
 * /api/rooms/featured:
 *   get:
 *     summary: Get featured rooms
 *     tags: [Rooms]
 *     responses:
 *       200: { description: OK }
 */
router.get("/featured", roomController.getFeaturedRooms);

/**
 * @swagger
 * /api/rooms/home-sections:
 *   get:
 *     summary: Get pre-built room rails for the homepage
 *     description: >
 *       Returns three room rails in one request: rooms in a given
 *       district, rooms near a named university, and the cheapest
 *       available rooms — avoiding separate round trips (including a
 *       university name → id lookup) from the client.
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: district
 *         schema: { type: string, default: Toul Kork }
 *       - in: query
 *         name: university
 *         schema: { type: string, default: Royal University of Phnom Penh }
 *         description: Matched against university names with LIKE %value%.
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 4 }
 *         description: Rooms per rail.
 *     responses:
 *       200:
 *         description: >
 *           OK. `data.sections` is an array of 3 objects, each
 *           `{ type: 'district'|'university'|'affordable', label, rooms }`.
 */
router.get("/home-sections", roomController.getHomeSections);

/**
 * @swagger
 * /api/rooms/latest:
 *   get:
 *     summary: Get the newest room listings
 *     tags: [Rooms]
 *     responses:
 *       200: { description: OK }
 */
router.get("/latest", roomController.getLatestRooms);

/**
 * @swagger
 * /api/rooms/map:
 *   get:
 *     summary: Get rooms for map pin rendering
 *     tags: [Rooms]
 *     responses:
 *       200: { description: OK }
 */
router.get("/map", roomController.getRoomsForMap);

/**
 * @swagger
 * /api/rooms/nearby:
 *   get:
 *     summary: Get rooms near a lat/lng point
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         required: true
 *         schema: { type: number }
 *       - in: query
 *         name: radius
 *         schema: { type: number, default: 5 }
 *         description: Radius in kilometers
 *     responses:
 *       200: { description: OK }
 *       400: { description: lat and lng are required. }
 */
router.get("/nearby", roomController.getNearbyRooms);

/**
 * @swagger
 * /api/rooms/{roomId}:
 *   get:
 *     summary: Get single room details
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Room listing not found. }
 */
router.get("/:roomId", roomController.getRoomById);

/**
 * @swagger
 * /api/rooms/{roomId}/similar:
 *   get:
 *     summary: Get similar rooms (extra endpoint, kept from the previous API)
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Room not found. }
 */
router.get("/:roomId/similar", roomController.getSimilarRooms);

// ── Room Images ───────────────────────────────────────────────
// Owner-only, but the path stays under /api/rooms per the API design.

/**
 * @swagger
 * /api/rooms/{roomId}/images:
 *   post:
 *     summary: Upload property photos
 *     tags: [Rooms]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Images uploaded successfully. }
 *       400: { description: No files uploaded. }
 *       403: { description: Forbidden. }
 *       404: { description: Room not found. }
 */
router.post(
  "/:roomId/images",
  verifyToken,
  requireRole("OWNER"),
  roomController.uploadImages,
);

/**
 * @swagger
 * /api/rooms/{roomId}/images/{imageId}:
 *   delete:
 *     summary: Delete a room image
 *     tags: [Rooms]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Image deleted successfully. }
 *       403: { description: Forbidden. }
 *       404: { description: Room or image not found. }
 */
router.delete(
  "/:roomId/images/:imageId",
  verifyToken,
  requireRole("OWNER"),
  roomController.deleteImage,
);

/**
 * @swagger
 * /api/rooms/{roomId}/images/{imageId}:
 *   patch:
 *     summary: Update a room image (currently only supports setting it as primary)
 *     tags: [Rooms]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_primary: { type: boolean, example: true }
 *     responses:
 *       200: { description: Primary image updated. }
 *       403: { description: Forbidden. }
 *       404: { description: Room or image not found. }
 */
router.patch(
  "/:roomId/images/:imageId",
  verifyToken,
  requireRole("OWNER"),
  roomController.updateImage,
);

module.exports = router;
