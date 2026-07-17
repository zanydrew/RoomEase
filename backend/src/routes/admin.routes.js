const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// Every admin route requires login AND the ADMIN role.
router.use(verifyToken, requireRole("ADMIN"));


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
router.put("/users/:id/ban", adminController.banUser);
router.put("/users/:id/unban", adminController.unbanUser);
router.put("/users/:id/verify", adminController.verifyOwner);

module.exports = router;
