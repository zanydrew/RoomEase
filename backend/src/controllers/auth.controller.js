const authService = require("../services/auth.service");
const { success, error } = require("../utils/response");

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    // Basic presence check — detailed validation is in the service
    if (!full_name || !email || !password || !role) {
      return error(
        res,
        "full_name, email, password, and role are required.",
        400,
      );
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

// ── POST /api/auth/google ─────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return error(res, "idToken is required.", 400);
    }

    const { user, token } = await authService.loginWithGoogle({ idToken });

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

// ── POST /api/auth/logout ─────────────────────────────────────
// JWTs are stateless, so there is nothing to invalidate server-side.
// This endpoint exists for API symmetry / so the client has a clear
// call to make when logging out (it should also discard its token).
const logout = async (req, res) => {
  try {
    return success(res, null, "Logged out successfully.");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = { register, login, googleLogin, logout, getMe };
