const bcrypt = require("bcryptjs");
const { User } = require("../models");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

// ── GET MY PROFILE ────────────────────────────────────────────

/**
 * Get the logged-in user's own profile.
 * req.user is already attached by verifyToken, so this just re-shapes it.
 */
const getMyProfile = (user) => ({
  ...user.toJSON(),
  name: user.full_name,
  phone: user.phone_number,
});

// ── GENERIC PARTIAL UPDATE ────────────────────────────────────

/**
 * Update one or more allowed fields on the logged-in user's own profile.
 * Used directly by PATCH /me, and reused by the single-field
 * PATCH /me/fullName, /me/phoneNumber, /me/location, /me/email routes.
 */
const updateMe = async (userId, updates = {}) => {
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw { status: 404, message: "User not found." };
  }

  const allowed = {};

  if (updates.full_name !== undefined) {
    if (!updates.full_name.trim()) {
      throw { status: 400, message: "Full name cannot be empty." };
    }
    allowed.full_name = updates.full_name;
  }

  if (updates.phone_number !== undefined) {
    allowed.phone_number = updates.phone_number;
  }

  if (updates.location !== undefined) {
    allowed.location = updates.location;
  }

  if (updates.email !== undefined) {
    if (!updates.email.trim()) {
      throw { status: 400, message: "Email cannot be empty." };
    }
    const existing = await User.findOne({ where: { email: updates.email } });
    if (existing && existing.uuid !== userId) {
      throw { status: 409, message: "This email is already in use." };
    }
    allowed.email = updates.email;
  }

  if (Object.keys(allowed).length === 0) {
    return getMyProfile(currentUser);
  }

  const updated = await currentUser.update(allowed);
  return getMyProfile(updated);
};

// ── UPDATE AVATAR ─────────────────────────────────────────────

/**
 * Upload a new avatar image to Cloudinary and update the user record.
 * Deletes the old avatar from Cloudinary if one exists.
 *
 * @param {string} userId
 * @param {Buffer} fileBuffer  - from multer memoryStorage
 */
const updateAvatar = async (userId, fileBuffer) => {
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw { status: 404, message: "User not found." };
  }

  if (currentUser.avatar_url) {
    const urlParts = currentUser.avatar_url.split("/upload/")[1];
    if (urlParts) {
      const publicId = urlParts.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
      await deleteFromCloudinary(publicId).catch(() => {
        console.warn(`Could not delete old avatar: ${publicId}`);
      });
    }
  }

  const { url } = await uploadToCloudinary(fileBuffer, "roomease/avatars");
  const updated = await currentUser.update({ avatar_url: url });

  return getMyProfile(updated);
};

// ── CHANGE PASSWORD ───────────────────────────────────────────
// Not part of the new API design, but kept as an additional route
// (PATCH /me/password) since removing it would drop existing,
// security-relevant functionality that nothing else replaces.

/**
 * Change the logged-in user's password.
 *
 * Rules:
 * - Must provide correct current password
 * - New password must be at least 6 characters
 * - Cannot reuse the same password
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  if (!newPassword || newPassword.length < 6) {
    throw {
      status: 400,
      message: "New password must be at least 6 characters.",
    };
  }

  const user = await User.findByPk(userId);

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  if (user.google_id || user.facebook_id) {
    throw {
      status: 400,
      message:
        "Password cannot be changed for accounts using Google or Facebook login.",
    };
  }

  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match) {
    throw { status: 401, message: "Current password is incorrect." };
  }

  const samePassword = await bcrypt.compare(newPassword, user.password_hash);
  if (samePassword) {
    throw {
      status: 400,
      message: "New password must be different from current password.",
    };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password_hash: hashed });
};

// ── DELETE MY ACCOUNT ─────────────────────────────────────────

/**
 * Permanently delete the logged-in user's own account.
 * Admin accounts cannot self-delete through this endpoint.
 */
const deleteMe = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  if (user.role === "ADMIN") {
    throw { status: 403, message: "Admin accounts cannot be self-deleted." };
  }

  await user.destroy();
};

module.exports = {
  getMyProfile,
  updateMe,
  updateAvatar,
  changePassword,
  deleteMe,
};
