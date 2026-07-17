const bcrypt = require("bcryptjs");
const { User } = require("../models");
const { uploadImage, deleteFromCloudinary } = require("../utils/imageUpload");

// ── GET MY PROFILE ────────────────────────────────────────────

const getMyProfile = (user) => ({
  ...user.toJSON(),
  name: user.full_name,
  phone: user.phone_number,
});

// ── GENERIC PARTIAL UPDATE ────────────────────────────────────

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

const updateAvatar = async (userId, base64Image) => {
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw { status: 404, message: "User not found." };
  }

  if (currentUser.avatar_url) {
    await deleteFromCloudinary(currentUser.avatar_url).catch(() => {
      console.warn(`Could not delete old avatar: ${currentUser.avatar_url}`);
    });
  }

  const { url } = await uploadImage(base64Image, "roomease/avatars");
  const updated = await currentUser.update({ avatar_url: url });

  return getMyProfile(updated);
};

const deleteAvatar = async (userId) => {
  const currentUser = await User.findByPk(userId);
  if (!currentUser) {
    throw { status: 404, message: "User not found." };
  }

  if (currentUser.avatar_url) {
    await deleteFromCloudinary(currentUser.avatar_url).catch(() => {
      console.warn(`Could not delete old avatar: ${currentUser.avatar_url}`);
    });
  }

  const updated = await currentUser.update({ avatar_url: null });
  return getMyProfile(updated);
};

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
  deleteAvatar,
  changePassword,
  deleteMe,
};
