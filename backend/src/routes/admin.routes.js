const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// Every admin route requires login AND the ADMIN role
router.use(verifyToken, requireRole("ADMIN"));

// ── Room moderation ───────────────────────────────────────────

/**
 * @swagger
 * /api/admin/rooms/pending:
 *   get:
 *     summary: Get pending room listings
 *     description: Retrieves a paginated list of room listings awaiting admin moderation/approval.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of records to return per page
 *     responses:
 *       200:
 *         description: Successfully retrieved pending room listings.
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
 *                   properties:
 *                     rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *       403:
 *         description: Forbidden. Requires Admin role.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/rooms/pending", adminController.getPendingRooms);

/**
 * @swagger
 * /api/admin/rooms:
 *   get:
 *     summary: Get all room listings
 *     description: Retrieves a paginated list of all room listings across the system regardless of approval or availability states.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, RENTED, PENDING, APPROVED, REJECTED]
 *         description: Filter rooms by approval status or availability status
 *     responses:
 *       200:
 *         description: Comprehensive listing array.
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
 *         description: Forbidden. Requires Admin.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/rooms", adminController.getAllRooms);

/**
 * @swagger
 * /api/admin/rooms/{id}/approve:
 *   put:
 *     summary: Approve a room listing
 *     description: Vets and approves a room, making it visible to the public search filters.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the room to approve
 *     responses:
 *       200:
 *         description: Room approved successfully.
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
 *                   example: Room approved and is now publicly visible.
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid room ID format or listing is not pending.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/rooms/:id/approve", adminController.approveRoom);

/**
 * @swagger
 * /api/admin/rooms/{id}/reject:
 *   put:
 *     summary: Reject a room listing
 *     description: Rejects a listing and stores administrative feedback comments/rejection reasons.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the room to reject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejection_reason
 *             properties:
 *               rejection_reason:
 *                 type: string
 *                 description: Reason for rejecting the listing
 *                 example: Images are unclear and missing address details.
 *     responses:
 *       200:
 *         description: Room rejected successfully.
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
 *                   example: Room rejected. Owner has been notified.
 *                 data:
 *                   type: object
 *       400:
 *         description: Rejection reason is missing.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Room not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/rooms/:id/reject", adminController.rejectRoom);

// ── User management ───────────────────────────────────────────

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all registered users
 *     description: Fetches a systemic log of all registered users (Renters, Landlords, Admins) with pagination and optional filters.
 *     tags:
 *       - Admin
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
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [RENTER, OWNER, ADMIN]
 *         description: Filter users by role
 *       - in: query
 *         name: banned
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filter users by ban status
 *     responses:
 *       200:
 *         description: Paginated user registry array.
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
 *         description: Forbidden.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/users", adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}/ban:
 *   put:
 *     summary: Suspend a user account
 *     description: Suspends a user account to block platform authentication entirely.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user to ban
 *     responses:
 *       200:
 *         description: Account successfully banned.
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
 *                   example: User banned successfully.
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/users/:id/ban", adminController.banUser);

/**
 * @swagger
 * /api/admin/users/{id}/unban:
 *   put:
 *     summary: Restore a banned user account
 *     description: Restores system access permissions for an officially banned account.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user to unban
 *     responses:
 *       200:
 *         description: Account successfully unbanned.
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
 *                   example: User unbanned successfully.
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/users/:id/unban", adminController.unbanUser);

/**
 * @swagger
 * /api/admin/users/{id}/verify:
 *   put:
 *     summary: Verify a landlord/owner
 *     description: Upgrades a landlord profile status to a verified, trustworthy level.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user to verify
 *     responses:
 *       200:
 *         description: Landlord successfully verified.
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
 *                   example: Owner verified successfully.
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/users/:id/verify", adminController.verifyOwner);

// ── Analytics ─────────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get systemic analytical metrics
 *     description: Aggregates structural system metrics (total rooms, active users, open tour bookings, and general fill rates) for admin reporting.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Object counting total rooms, active users, open tour bookings, and general fill rates.
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
 *         description: Forbidden.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/analytics", adminController.getAnalytics);

module.exports = router;
