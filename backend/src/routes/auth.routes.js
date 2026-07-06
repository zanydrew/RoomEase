const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     description: Registers a new user account (Renter, Owner, or Admin). Hashes password via bcrypt.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Legal name of the user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Unique registration email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Plaintext password
 *                 example: Password123!
 *               role:
 *                 type: string
 *                 enum: [RENTER, OWNER, ADMIN]
 *                 description: User role
 *                 example: RENTER
 *     responses:
 *       201:
 *         description: Account created successfully. Returns the user profile object and fresh JWT token.
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
 *                   example: Account created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         uuid:
 *                           type: string
 *                           format: uuid
 *                         full_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Missing required fields or email already exists.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate credentials
 *     description: Authenticates email and password credentials, returning the user profile and session token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Registered account email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Account password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Logged in successfully. Returns authenticated user profile details and active session JWT token.
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
 *                   example: Logged in successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         uuid:
 *                           type: string
 *                           format: uuid
 *                         full_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                     token:
 *                       type: string
 *       400:
 *         description: Email and password are required.
 *       401:
 *         description: Invalid email or password.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current session user details
 *     description: Resolves and returns the user profile payload corresponding to the sent JWT token.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current authenticated user metadata.
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         uuid:
 *                           type: string
 *                           format: uuid
 *                         full_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *       401:
 *         description: Access token is missing or invalid.
 *       500:
 *         description: Internal Server Error.
 */
router.get("/me", verifyToken, authController.getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current session
 *     description: Stateless for JWT — confirms logout so the client can discard its token.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *       401:
 *         description: Unauthorized.
 */
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
