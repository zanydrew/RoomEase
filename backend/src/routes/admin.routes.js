const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// Every admin route requires login AND the ADMIN role.
router.use(verifyToken, requireRole("ADMIN"));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Admin dashboard (total users, owners, renters)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/dashboard", adminController.getDashboard);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Platform analytics (extra endpoint, kept from the previous API)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/analytics", adminController.getAnalytics);

// ── Room moderation (kept from the previous API) ───────────────

/**
 * @swagger
 * /api/admin/rooms/pending:
 *   get:
 *     summary: Get pending room listings
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/rooms/pending", adminController.getPendingRooms);

/**
 * @swagger
 * /api/admin/rooms:
 *   get:
 *     summary: Get all room listings (any status)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/rooms", adminController.getAllRooms);

/**
 * @swagger
 * /api/admin/rooms/{id}/approve:
 *   put:
 *     summary: Approve a room listing
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Room approved and is now publicly visible. }
 *       404: { description: Room not found. }
 */
router.put("/rooms/:id/approve", adminController.approveRoom);

/**
 * @swagger
 * /api/admin/rooms/{id}/reject:
 *   put:
 *     summary: Reject a room listing
 *     tags: [Admin]
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
 *             required: [rejection_reason]
 *             properties:
 *               rejection_reason: { type: string }
 *     responses:
 *       200: { description: Room rejected. Owner has been notified. }
 *       400: { description: A rejection reason is required. }
 *       404: { description: Room not found. }
 */
router.put("/rooms/:id/reject", adminController.rejectRoom);

// ── Users (generic) ─────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [RENTER, OWNER, ADMIN] }
 *       - in: query
 *         name: banned
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: OK }
 */
router.get("/users", adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a single user by id
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: User not found. }
 */
router.get("/users/:id", adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update a user (supports is_banned, is_verified, full_name, phone_number, location)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: User updated successfully. }
 *       404: { description: User not found. }
 */
router.patch("/users/:id", adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: User deleted successfully. }
 *       403: { description: Admin accounts cannot be deleted. }
 *       404: { description: User not found. }
 */
router.delete("/users/:id", adminController.deleteUser);

// ── Renters ──────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/renters:
 *   get:
 *     summary: Get all renters
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/renters", adminController.getAllRenters);

/**
 * @swagger
 * /api/admin/renters/{id}:
 *   get:
 *     summary: Get a single renter
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Renter not found. }
 */
router.get("/renters/:id", adminController.getRenterById);

/**
 * @swagger
 * /api/admin/renters/{id}:
 *   patch:
 *     summary: Update a renter
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Renter updated successfully. }
 *       404: { description: Renter not found. }
 */
router.patch("/renters/:id", adminController.updateRenter);

/**
 * @swagger
 * /api/admin/renters/{id}:
 *   delete:
 *     summary: Delete a renter
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Renter deleted successfully. }
 *       404: { description: Renter not found. }
 */
router.delete("/renters/:id", adminController.deleteRenter);

// ── Owners ───────────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/owners:
 *   get:
 *     summary: Get all owners
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 */
router.get("/owners", adminController.getAllOwners);

/**
 * @swagger
 * /api/admin/owners/{id}:
 *   get:
 *     summary: Get a single owner
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Owner not found. }
 */
router.get("/owners/:id", adminController.getOwnerById);

/**
 * @swagger
 * /api/admin/owners/{id}:
 *   patch:
 *     summary: "Update an owner (e.g. is_verified=true to verify)"
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Owner updated successfully. }
 *       404: { description: Owner not found. }
 */
router.patch("/owners/:id", adminController.updateOwner);

/**
 * @swagger
 * /api/admin/owners/{id}:
 *   delete:
 *     summary: Delete an owner
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Owner deleted successfully. }
 *       404: { description: Owner not found. }
 */
router.delete("/owners/:id", adminController.deleteOwner);

module.exports = router;
