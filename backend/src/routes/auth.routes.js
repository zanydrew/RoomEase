const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
const verifyToken = require("../middlewares/verifyToken");
const { success, error } = require("../utils/response");

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return error(res, "full_name, email, password, and role are required.", 400);
    }

    const { user, token } = await authService.register({
      full_name,
      email,
      password,
      role,
    });

    return success(res, { user, token }, "Account created successfully.", 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, "Email and password are required.", 400);
    }

    const { user, token } = await authService.login({ email, password });

    return success(res, { user, token }, "Logged in successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
// verifyToken middleware already validated the token and
// attached the user to req.user — nothing left to do here
// except return that user.
const getMe = async (req, res) => {
  try {
    return success(res, { user: req.user }, "OK");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = router;

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
