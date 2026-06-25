const userService = require("../services/user.service");
const { success, error } = require("../utils/response");

// ── GET /api/users/profile ────────────────────────────────────
// Returns the currently logged-in user's own profile.
// req.user is already attached by verifyToken middleware.
const getMyProfile = async (req, res) => {
  try {
    return success(res, { user: req.user }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/users/:id ────────────────────────────────────────
// Returns any user's public profile by ID.
// Used to view an owner's profile page.
const getProfileById = async (req, res) => {
  try {
    const user = await userService.getProfileById(req.params.id);
    return success(res, { user }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/users/profile ────────────────────────────────────
// Update the logged-in user's name, phone, preferred language.
const updateProfile = async (req, res) => {
  try {
    const { name, phone, preferred_lang } = req.body;
    const updated = await userService.updateProfile(req.user.id, {
      name,
      phone,
      preferred_lang,
    });
    return success(res, { user: updated }, "Profile updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/users/avatar ─────────────────────────────────────
// Upload a new profile picture.
// req.file is attached by the upload middleware (multer).
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "No image file provided.", 400);
    }

    const updated = await userService.updateAvatar(
      req.user.id,
      req.file.buffer,
    );
    return success(res, { user: updated }, "Avatar updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/users/password ───────────────────────────────────
// Change the logged-in user's password.
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return error(res, "Current password and new password are required.", 400);
    }

    await userService.changePassword(req.user.id, {
      currentPassword,
      newPassword,
    });
    return success(res, null, "Password changed successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getMyProfile,
  getProfileById,
  updateProfile,
  updateAvatar,
  changePassword,
};
