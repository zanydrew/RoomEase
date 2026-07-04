const express = require("express");
const router = express.Router();
const viewingController = require("../controllers/viewing.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// All viewing routes require login
router.use(verifyToken);

// Renter routes

/**
 * @swagger
 * /api/viewings:
 *   post:
 *     summary: Create viewing request (Renter only)
 *     description: Submits a request to physically tour an approved room listing at a targeted calendar block.
 *     tags:
 *       - Viewings
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
 *               - requested_date
 *               - requested_time
 *             properties:
 *               room_id:
 *                 type: string
 *                 format: uuid
 *                 example: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
 *               requested_date:
 *                 type: string
 *                 format: date
 *                 description: Format YYYY-MM-DD
 *                 example: 2026-07-15
 *               requested_time:
 *                 type: string
 *                 description: Format HH:MM:SS or HH:MM
 *                 example: 14:30:00
 *               renter_note:
 *                 type: string
 *                 example: I would love to check the kitchen.
 *     responses:
 *       201:
 *         description: Newly generated PENDING viewing request object.
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
 *                   example: Viewing request sent successfully.
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation failure or missing fields.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden. Renter role required.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/", requireRole("RENTER"), viewingController.requestViewing);

/**
 * @swagger
 * /api/viewings/my-requests:
 *   get:
 *     summary: Get renter's tour requests
 *     description: Pulls the historical catalog of appointment submissions dispatched by the logged-in renter.
 *     tags:
 *       - Viewings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, SUGGESTED]
 *         description: Filter viewing requests by status
 *     responses:
 *       200:
 *         description: Array of historical renter tour reservations.
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
 *         description: Forbidden. Renter role required.
 *       500:
 *         description: Internal Server Error.
 */
router.get(
  "/my-requests",
  requireRole("RENTER"),
  viewingController.getMyRequests,
);

/**
 * @swagger
 * /api/viewings/{id}/cancel:
 *   put:
 *     summary: Cancel a tour request (Renter only)
 *     description: Allows renters to retract an issued appointment request before execution.
 *     tags:
 *       - Viewings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the viewing request to cancel
 *     responses:
 *       200:
 *         description: Modified viewing row with status flags switched to cancelled.
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
 *                   example: Viewing request cancelled.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Viewing request not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put(
  "/:id/cancel",
  requireRole("RENTER"),
  viewingController.cancelViewing,
);

// Owner routes

/**
 * @swagger
 * /api/viewings/incoming:
 *   get:
 *     summary: Get landlord's incoming tour requests
 *     description: Pulls scheduling requests sent to a landlord's properties.
 *     tags:
 *       - Viewings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, SUGGESTED]
 *         description: Filter incoming requests by status
 *     responses:
 *       200:
 *         description: Array of renter booking nodes needing review.
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
 *         description: Forbidden. OWNER role required.
 *       500:
 *         description: Internal Server Error.
 */
router.get(
  "/incoming",
  requireRole("OWNER"),
  viewingController.getIncomingRequests,
);

/**
 * @swagger
 * /api/viewings/{id}/accept:
 *   put:
 *     summary: Accept a tour request (Owner only)
 *     description: Confirms and approves a tenant's physical visit timeframe slot.
 *     tags:
 *       - Viewings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the viewing request to accept
 *     responses:
 *       200:
 *         description: Updated viewing request status tracking APPROVED.
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
 *                   example: Viewing request accepted.
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Viewing request not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put(
  "/:id/accept",
  requireRole("OWNER"),
  viewingController.acceptViewing,
);

/**
 * @swagger
 * /api/viewings/{id}/reject:
 *   put:
 *     summary: Reject a tour request (Owner only)
 *     description: Declines a renter's visit request with optional notes.
 *     tags:
 *       - Viewings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the viewing request to reject
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner_note:
 *                 type: string
 *                 example: Property is undergoing renovation this week.
 *     responses:
 *       200:
 *         description: Viewing request rejected.
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
 *                   example: Viewing request rejected.
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Viewing request not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put(
  "/:id/reject",
  requireRole("OWNER"),
  viewingController.rejectViewing,
);

/**
 * @swagger
 * /api/viewings/{id}/suggest:
 *   put:
 *     summary: Propose a counter-proposal slot (Owner only)
 *     description: Proposes a counter-proposal date and alternative time slot back to the renter.
 *     tags:
 *       - Viewings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the viewing request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - suggested_date
 *               - suggested_time
 *             properties:
 *               suggested_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-07-16
 *               suggested_time:
 *                 type: string
 *                 example: 10:00:00
 *               owner_note:
 *                 type: string
 *                 example: Thursday morning is better for me.
 *     responses:
 *       200:
 *         description: Modified model state reflecting a SUGGESTED operational loop.
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
 *                   example: New time suggested to the renter.
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing suggested date or time.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Viewing request not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/:id/suggest", requireRole("OWNER"), viewingController.suggestTime);

module.exports = router;
