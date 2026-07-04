const bcrypt = require("bcryptjs");
const { User } = require("../models");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

// ── GET PROFILE ───────────────────────────────────────────────

/**
 * Get a user's public profile by their ID.
 * Used when a renter wants to see an owner's profile page.
 */
const getProfileById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  return {
    ...user.toJSON(),
    name: user.full_name,
    phone: user.phone_number,
  };
};

// ── UPDATE PROFILE ────────────────────────────────────────────

/**
 * Update the logged-in user's own profile.
 * Only updates fields that were actually sent — ignores the rest.
 */
const updateProfile = async (userId, { name, phone, preferred_lang }) => {
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw { status: 404, message: "User not found." };
  }

  const updates = {};
  if (name !== undefined) updates.full_name = name;
  if (phone !== undefined) updates.phone_number = phone;
  if (preferred_lang !== undefined) updates.preferred_lang = preferred_lang;

  if (Object.keys(updates).length === 0) {
    return {
      ...currentUser.toJSON(),
      name: currentUser.full_name,
      phone: currentUser.phone_number,
    };
  }

  const updated = await currentUser.update(updates);
  return {
    ...updated.toJSON(),
    name: updated.full_name,
    phone: updated.phone_number,
  };
};

// ── UPDATE AVATAR ─────────────────────────────────────────────

/**
 * Upload a new avatar image to Cloudinary and update the user record.
 * Deletes the old avatar from Cloudinary if one exists.
 *
 * @param {number} userId
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

  return {
    ...updated.toJSON(),
    name: updated.full_name,
    phone: updated.phone_number,
  };
};

// ── CHANGE PASSWORD ───────────────────────────────────────────

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

module.exports = {
  getProfileById,
  updateProfile,
  updateAvatar,
  changePassword,
};
