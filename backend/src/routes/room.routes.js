const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const { uploadMultiple, handleUpload } = require("../middlewares/upload");

// ── Public routes (no login needed) ──────────────────────────

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Browse and search room listings
 *     description: Browses, searches, and filters public approved listings. Supports spatial proximity computations and text search.
 *     tags:
 *       - Rooms
 *     parameters:
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district name
 *       - in: query
 *         name: room_type
 *         schema:
 *           type: string
 *           enum: [STUDIO, 1BR, 2BR, SHARED]
 *         description: Filter by layout category
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum monthly rent price
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum monthly rent price
 *       - in: query
 *         name: university_id
 *         schema:
 *           type: integer
 *         description: Filter by proximity to a specific university ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword search on title/description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Array of filtered properties matching criteria.
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
 *       500:
 *         description: Internal Server Error.
 */
router.get("/", roomController.getAllRooms);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get single room details
 *     description: Retrieves granular detail configurations for a single room, binding nested images and amenities lists.
 *     tags:
 *       - Rooms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the room to retrieve
 *     responses:
 *       200:
 *         description: Complete room object schema details.
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
 *       400:
 *         description: Invalid room ID format.
 *       404:
 *         description: Room listing not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/:id", roomController.getRoomById);

/**
 * @swagger
 * /api/rooms/{id}/similar:
 *   get:
 *     summary: Get similar rooms
 *     description: Recommends structurally similar rental listings located within adjacent districts or shared price points.
 *     tags:
 *       - Rooms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID to match similarities
 *     responses:
 *       200:
 *         description: Array of matching alternative room vectors.
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
 *       400:
 *         description: Invalid room ID format.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/:id/similar", roomController.getSimilarRooms);

// ── Owner only routes ─────────────────────────────────────────

/**
 * @swagger
 * /api/rooms/owner/listings:
 *   get:
 *     summary: Get owned room listings (Landlord dashboard)
 *     description: Fetches all properties belonging to the requesting landlord to populate isolated management views (Approved, Pending, and Rejected).
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: Array of owned listings.
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
 *       403:
 *         description: Forbidden. Requires OWNER role.
 *       500:
 *         description: Internal Server Error.
 */
router.get(
  "/owner/listings",
  verifyToken,
  requireRole("OWNER"),
  roomController.getOwnerRooms,
);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Submit a new room listing
 *     description: Submits a new property asset to the catalog. Automatically falls back into a PENDING approval status.
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price_per_month
 *               - address
 *               - room_type
 *               - size_sqm
 *             properties:
 *               title:
 *                 type: string
 *                 example: Cozy studio near CADT campus
 *               description:
 *                 type: string
 *                 example: Fully furnished studio room with WiFi and aircon.
 *               price_per_month:
 *                 type: number
 *                 example: 250.00
 *               deposit:
 *                 type: number
 *                 example: 250.00
 *               address:
 *                 type: string
 *                 example: Prek Leap, Chroy Changvar
 *               district:
 *                 type: string
 *                 example: Chroy Changvar
 *               city:
 *                 type: string
 *                 example: Phnom Penh
 *               latitude:
 *                 type: number
 *                 example: 11.6429
 *               longitude:
 *                 type: number
 *                 example: 104.9123
 *               room_type:
 *                 type: string
 *                 enum: [STUDIO, 1BR, 2BR, SHARED]
 *                 example: STUDIO
 *               size_sqm:
 *                 type: number
 *                 example: 25
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of amenity database IDs
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Newly created room entity.
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
 *                   example: Room submitted successfully. It will be visible after admin approval.
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation failure or missing fields.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/", verifyToken, requireRole("OWNER"), roomController.createRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Update an owned room listing
 *     description: Modifies existing details, pricing levels, coordinates, or amenities of an owned listing. Marks status back to PENDING.
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price_per_month:
 *                 type: number
 *               deposit:
 *                 type: number
 *               address:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               room_type:
 *                 type: string
 *                 enum: [STUDIO, 1BR, 2BR, SHARED]
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Updated room resource instance.
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
 *                   example: Room updated. It will be re-reviewed by admin.
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Not the owner of this room or incorrect role.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put(
  "/:id",
  verifyToken,
  requireRole("OWNER"),
  roomController.updateRoom,
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete a room listing
 *     description: Permanently clears a property entry and completely wipes associated image links hosted inside Cloudinary storage.
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID to delete
 *     responses:
 *       200:
 *         description: Confirmation block establishing clean removal status.
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
 *                   example: Room deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Not the owner of the listing.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete(
  "/:id",
  verifyToken,
  requireRole("OWNER"),
  roomController.deleteRoom,
);

/**
 * @swagger
 * /api/rooms/{id}/mark-rented:
 *   put:
 *     summary: Mark a listing as rented
 *     description: Toggles the operational availability flag to RENTED to hide the asset from public search visibility.
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID to mark rented
 *     responses:
 *       200:
 *         description: Modified instance mapping.
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
 *                   example: Room marked as rented.
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put(
  "/:id/mark-rented",
  verifyToken,
  requireRole("OWNER"),
  roomController.markAsRented,
);

// Image management

/**
 * @swagger
 * /api/rooms/{id}/images:
 *   post:
 *     summary: Upload property photos
 *     description: Uploads multiple property photos to Cloudinary using multipart handling via Multer middleware.
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Room UUID to upload photos to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files to upload
 *     responses:
 *       201:
 *         description: Array of newly stored image metadata links.
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
 *                   example: Images uploaded successfully.
 *                 data:
 *                   type: object
 *       400:
 *         description: No files uploaded.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */
router.post(
  "/:id/images",
  verifyToken,
  requireRole("OWNER"),
  handleUpload(uploadMultiple),
  roomController.uploadImages,
);

/**
 * @swagger
 * /api/rooms/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete a room image
 *     description: Removes a specific image from database records and Cloudinary storage.
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Room UUID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Image UUID to delete
 *     responses:
 *       200:
 *         description: Confirmation block establishing clean removal status.
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
 *                   example: Image deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Room or image not found.
 *       500:
 *         description: Internal Server Error.
 */
router.delete(
  "/:id/images/:imageId",
  verifyToken,
  requireRole("OWNER"),
  roomController.deleteImage,
);

/**
 * @swagger
 * /api/rooms/{id}/images/{imageId}/primary:
 *   put:
 *     summary: Set primary cover photo
 *     description: Sets a specific image as the primary cover photo for the listing.
 *     tags:
 *       - Rooms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Room UUID
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The Image UUID to set as primary
 *     responses:
 *       200:
 *         description: Primary image updated. Returns listing images array.
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
 *                   example: Primary image updated.
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Room or image not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put(
  "/:id/images/:imageId/primary",
  verifyToken,
  requireRole("OWNER"),
  roomController.setPrimaryImage,
);

module.exports = router;
