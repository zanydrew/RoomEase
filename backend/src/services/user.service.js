const bcrypt = require("bcryptjs");
const User = require("../models/User");
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
  const user = await User.findById(id);
  if (!user) {
    throw { status: 404, message: "User not found." };
  }
  return user;
};

// ── UPDATE PROFILE ────────────────────────────────────────────

/**
 * Update the logged-in user's own profile.
 * Only updates fields that were actually sent — ignores the rest.
 */
const updateProfile = async (userId, { name, phone, preferred_lang }) => {
  // Fetch current data so we can fill in anything not being changed
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw { status: 404, message: "User not found." };
  }

  const updated = await User.updateProfile(userId, {
    name: name ?? currentUser.name,
    phone: phone ?? currentUser.phone,
    avatar_url: currentUser.avatar_url, // avatar handled separately
    preferred_lang: preferred_lang ?? currentUser.preferred_lang,
  });

  return updated;
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
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw { status: 404, message: "User not found." };
  }

  // Delete old avatar from Cloudinary before uploading new one
  // Avatar URLs look like: .../roomease/avatars/abc123
  if (currentUser.avatar_url) {
    // Extract public_id from the URL
    // e.g. "https://res.cloudinary.com/.../roomease/avatars/abc123"
    //   →  "roomease/avatars/abc123"
    const urlParts = currentUser.avatar_url.split("/upload/")[1];
    if (urlParts) {
      // Remove file extension to get the public_id
      const publicId = urlParts.replace(/\.[^/.]+$/, "");
      await deleteFromCloudinary(publicId).catch(() => {
        // Don't crash if old image delete fails — just log it
        console.warn(`Could not delete old avatar: ${publicId}`);
      });
    }
  }

  // Upload new avatar
  const { url } = await uploadToCloudinary(fileBuffer, "roomease/avatars");

  // Save new URL to database
  const updated = await User.updateProfile(userId, {
    name: currentUser.name,
    phone: currentUser.phone,
    avatar_url: url,
    preferred_lang: currentUser.preferred_lang,
  });

  return updated;
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

  // Fetch full user including password hash
  const user = await User.findByEmail((await User.findById(userId)).email);

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  // Block OAuth users — they have no password to change
  if (user.auth_provider !== "local") {
    throw {
      status: 400,
      message:
        "Password cannot be changed for accounts using Google or Facebook login.",
    };
  }

  // Verify current password
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    throw { status: 401, message: "Current password is incorrect." };
  }

  // Prevent reusing same password
  const samePassword = await bcrypt.compare(newPassword, user.password);
  if (samePassword) {
    throw {
      status: 400,
      message: "New password must be different from current password.",
    };
  }

  // Hash and save new password
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.updatePassword(userId, hashed);
};

module.exports = {
  getProfileById,
  updateProfile,
  updateAvatar,
  changePassword,
};
