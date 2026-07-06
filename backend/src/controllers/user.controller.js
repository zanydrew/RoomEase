const userService = require("../services/user.service");
const { success, error } = require("../utils/response");

// ── GET /api/users/me ─────────────────────────────────────────
// req.user is already attached by verifyToken middleware.
const getMe = async (req, res) => {
  try {
    const user = userService.getMyProfile(req.user);
    return success(res, { user }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PATCH /api/users/me ───────────────────────────────────────
// Generic partial update — accepts any subset of the editable fields.
const updateMe = async (req, res) => {
  try {
    const { full_name, phone_number, location, email } = req.body;
    const updated = await userService.updateMe(req.user.uuid, {
      full_name,
      phone_number,
      location,
      email,
    });
    return success(res, { user: updated }, "Profile updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PATCH /api/users/me/avatar ────────────────────────────────
// req.file is attached by the upload middleware (multer).
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return error(res, "No image file provided.", 400);
    }

    const updated = await userService.updateAvatar(
      req.user.uuid,
      req.file.buffer,
    );
    return success(res, { user: updated }, "Avatar updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PATCH /api/users/me/phoneNumber ───────────────────────────
const updatePhoneNumber = async (req, res) => {
  try {
    const { phone_number } = req.body;
    if (!phone_number) {
      return error(res, "phone_number is required.", 400);
    }
    const updated = await userService.updateMe(req.user.uuid, { phone_number });
    return success(
      res,
      { user: updated },
      "Phone number updated successfully.",
    );
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PATCH /api/users/me/location ──────────────────────────────
const updateLocation = async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return error(res, "location is required.", 400);
    }
    const updated = await userService.updateMe(req.user.uuid, { location });
    return success(res, { user: updated }, "Location updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PATCH /api/users/me/fullName ──────────────────────────────
const updateFullName = async (req, res) => {
  try {
    const { full_name } = req.body;
    if (!full_name) {
      return error(res, "full_name is required.", 400);
    }
    const updated = await userService.updateMe(req.user.uuid, { full_name });
    return success(res, { user: updated }, "Full name updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PATCH /api/users/me/email ─────────────────────────────────
const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return error(res, "email is required.", 400);
    }
    const updated = await userService.updateMe(req.user.uuid, { email });
    return success(res, { user: updated }, "Email updated successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PATCH /api/users/me/password ──────────────────────────────
// Extra endpoint (not part of the new API design) kept so the
// existing change-password functionality isn't lost.
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return error(res, "Current password and new password are required.", 400);
    }

    await userService.changePassword(req.user.uuid, {
      currentPassword,
      newPassword,
    });
    return success(res, null, "Password changed successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── DELETE /api/users/me ──────────────────────────────────────
const deleteMe = async (req, res) => {
  try {
    await userService.deleteMe(req.user.uuid);
    return success(res, null, "Account deleted successfully.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  getMe,
  updateMe,
  updateAvatar,
  updatePhoneNumber,
  updateLocation,
  updateFullName,
  updateEmail,
  changePassword,
  deleteMe,
};
