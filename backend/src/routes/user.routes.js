const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/verifyToken");
const { uploadSingle, handleUpload } = require("../middlewares/upload");

// All user routes require login
router.use(verifyToken);

// Profile

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Retrieve own profile
 *     description: Returns the currently logged-in user's detailed profile settings.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detailed user settings profile.
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
router.get("/profile", userController.getMyProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve profile by ID
 *     description: Returns any user's  profile (useful to view landlord profile details and reviews).
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The UUID of the user profile to fetch
 *     responses:
 *       200:
 *         description: Public landlord profile details and reviews.
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
 *         description: User profile not found.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/:id", userController.getProfileById);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update profile details
 *     description: Updates the logged-in user's name, phone, and preferred language setting.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Johnathan Doe
 *               phone:
 *                 type: string
 *                 example: "+85512345678"
 *               preferred_lang:
 *                 type: string
 *                 enum: [en, kh]
 *                 example: en
 *     responses:
 *       200:
 *         description: Profile updated successfully. Returns updated user profile.
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
 *                   example: Profile updated successfully.
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/profile", userController.updateProfile);

/**
 * @swagger
 * /api/users/avatar:
 *   put:
 *     summary: Upload and update avatar
 *     description: Uploads and updates a user's avatar image to Cloudinary.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file to upload
 *     responses:
 *       200:
 *         description: Avatar updated successfully. Returns updated user profile.
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
 *                   example: Avatar updated successfully.
 *                 data:
 *                   type: object
 *       400:
 *         description: No image file provided.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/avatar", handleUpload(uploadSingle), userController.updateAvatar);

// Password

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Change password
 *     description: Validates current password and updates to a new password.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPassword123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully.
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
 *                   example: Password changed successfully.
 *       400:
 *         description: Missing required fields or incorrect current password.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal Server Error.
 */
router.put("/password", userController.changePassword);

module.exports = router;
