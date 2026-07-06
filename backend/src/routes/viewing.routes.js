const express = require("express");
const router = express.Router();
const viewingController = require("../controllers/viewing.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// Every route in this file requires a logged-in user.
// Mounted at /api/viewing-requests in app.js.
router.use(verifyToken);

/**
 * @swagger
 * /api/viewing-requests:
 *   post:
 *     summary: Request a room viewing (Renter only)
 *     tags: [ViewingRequests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [room_id, requested_date, requested_time]
 *             properties:
 *               room_id: { type: string, format: uuid }
 *               requested_date: { type: string, format: date }
 *               requested_time: { type: string, example: "14:30" }
 *               renter_note: { type: string }
 *     responses:
 *       201: { description: Viewing request sent successfully. }
 *       400: { description: Validation error. }
 *       403: { description: Renter role required. }
 */
router.post("/", requireRole("RENTER"), viewingController.requestViewing);

/**
 * @swagger
 * /api/viewing-requests/my:
 *   get:
 *     summary: Get my own viewing requests (Renter only)
 *     tags: [ViewingRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED, SUGGESTED] }
 *     responses:
 *       200: { description: OK }
 */
router.get("/my", requireRole("RENTER"), viewingController.getMyRequests);

/**
 * @swagger
 * /api/viewing-requests/owner:
 *   get:
 *     summary: Get incoming viewing requests for my rooms (Owner only)
 *     tags: [ViewingRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, APPROVED, REJECTED, SUGGESTED] }
 *     responses:
 *       200: { description: OK }
 */
router.get("/owner", requireRole("OWNER"), viewingController.getOwnerRequests);

/**
 * @swagger
 * /api/viewing-requests/{id}:
 *   get:
 *     summary: Get a single viewing request (participant only)
 *     tags: [ViewingRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       403: { description: You are not part of this viewing request. }
 *       404: { description: Viewing request not found. }
 */
router.get("/:id", viewingController.getViewingById);

/**
 * @swagger
 * /api/viewing-requests/{id}/accept:
 *   patch:
 *     summary: Accept a viewing request (Owner only)
 *     tags: [ViewingRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Viewing request accepted. }
 *       403: { description: Forbidden. }
 *       404: { description: Viewing request not found. }
 */
router.patch(
  "/:id/accept",
  requireRole("OWNER"),
  viewingController.acceptViewing,
);

/**
 * @swagger
 * /api/viewing-requests/{id}/reject:
 *   patch:
 *     summary: Reject a viewing request (Owner only)
 *     tags: [ViewingRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Viewing request rejected. }
 *       403: { description: Forbidden. }
 *       404: { description: Viewing request not found. }
 */
router.patch(
  "/:id/reject",
  requireRole("OWNER"),
  viewingController.rejectViewing,
);

/**
 * @swagger
 * /api/viewing-requests/{id}/cancel:
 *   patch:
 *     summary: Cancel a viewing request (Renter only)
 *     tags: [ViewingRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Viewing request cancelled. }
 *       400: { description: Cannot cancel an already accepted viewing. }
 *       403: { description: Forbidden. }
 *       404: { description: Viewing request not found. }
 */
router.patch(
  "/:id/cancel",
  requireRole("RENTER"),
  viewingController.cancelViewing,
);

/**
 * @swagger
 * /api/viewing-requests/{id}/reschedule:
 *   patch:
 *     summary: Propose a new date/time for a viewing (Owner only)
 *     tags: [ViewingRequests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [suggested_date, suggested_time]
 *             properties:
 *               suggested_date: { type: string, format: date }
 *               suggested_time: { type: string, example: "16:00" }
 *               owner_note: { type: string }
 *     responses:
 *       200: { description: New time suggested to the renter. }
 *       403: { description: Forbidden. }
 *       404: { description: Viewing request not found. }
 */
router.patch(
  "/:id/reschedule",
  requireRole("OWNER"),
  viewingController.rescheduleViewing,
);

module.exports = router;
