const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/verifyToken");
const { uploadSingle, handleUpload } = require("../middlewares/upload");

// Every route in this file requires a logged-in user.
router.use(verifyToken);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: OK }
 *       401: { description: Unauthorized }
 */
router.get("/me", userController.getMe);

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update my profile (partial update)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile updated successfully. }
 *       401: { description: Unauthorized }
 */
router.patch("/me", userController.updateMe);

/**
 * @swagger
 * /api/users/me/avatar:
 *   patch:
 *     summary: Update my avatar
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200: { description: Avatar updated successfully. }
 *       400: { description: No image file provided. }
 *       401: { description: Unauthorized }
 */
router.patch("/me/avatar", userController.updateAvatar);

/**
 * @swagger
 * /api/users/me/phoneNumber:
 *   patch:
 *     summary: Update my phone number
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Phone number updated successfully. }
 *       400: { description: phone_number is required. }
 *       401: { description: Unauthorized }
 */
router.patch("/me/phoneNumber", userController.updatePhoneNumber);

/**
 * @swagger
 * /api/users/me/location:
 *   patch:
 *     summary: Update my location
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Location updated successfully. }
 *       400: { description: location is required. }
 *       401: { description: Unauthorized }
 */
router.patch("/me/location", userController.updateLocation);

/**
 * @swagger
 * /api/users/me/fullName:
 *   patch:
 *     summary: Update my full name
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Full name updated successfully. }
 *       400: { description: full_name is required. }
 *       401: { description: Unauthorized }
 */
router.patch("/me/fullName", userController.updateFullName);

/**
 * @swagger
 * /api/users/me/email:
 *   patch:
 *     summary: Update my email
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Email updated successfully. }
 *       400: { description: email is required. }
 *       409: { description: Email already in use. }
 *       401: { description: Unauthorized }
 */
router.patch("/me/email", userController.updateEmail);

/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     summary: Change my password (extra endpoint, kept from the previous API)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Password changed successfully. }
 *       400: { description: Validation error. }
 *       401: { description: Current password is incorrect. }
 */
router.patch("/me/password", userController.changePassword);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Delete my account
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Account deleted successfully. }
 *       401: { description: Unauthorized }
 *       403: { description: Admin accounts cannot be self-deleted. }
 */
router.delete("/me", userController.deleteMe);

module.exports = router;
