const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {User} = require("../models");
    
// ── Token ─────────────────────────────────────────────────────

/**
 * Generate a JWT token for a user.
 * Stores only id and role inside the token (minimal payload).
 * The full user is always fetched fresh from DB in verifyToken.
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.uuid, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ── Register ──────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 *
 * Rules:
 * - Email must not already be taken
 * - Password must be at least 6 characters
 * - Role must be RENTER or OWNER (not ADMIN — admins are created manually)
 */


const register = async ({ full_name, email, password, role }) => {
  const allowedRoles = ["RENTER", "OWNER"];
  if (!allowedRoles.includes(role)) {
    throw { status: 400, message: "Role must be RENTER or OWNER." };
  }

  if (!password || password.length < 6) {
    throw { status: 400, message: "Password must be at least 6 characters." };
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { status: 409, message: "An account with this email already exists." };
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    full_name,
    email,
    password_hash,
    role,
  });

  const token = generateToken(user);

  const safeUser = user.toJSON();
  delete safeUser.password_hash;

  return { user: safeUser, token };
};

// ── Login ─────────────────────────────────────────────────────

/**
 * Login with email + password.
 *
 * Rules:
 * - Email must exist
 * - Password must match the stored hash
 * - User must not be banned
 * - User must have registered with email (not OAuth)
 */
const login = async ({ email, password }) => {
  // 1. Find user by email
  //    We use the special findByEmail which returns the password hash too
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw { status: 401, message: "Invalid email or password." };
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw { status: 401, message: "Invalid email or password." };
  }

  if (user.is_banned) {
    throw { status: 403, message: "Your account has been banned. Contact support." };
  }

  await user.update({ last_login_at: new Date() });

  const token = generateToken(user);

  const safeUser = user.toJSON();
  delete safeUser.password_hash;

  return { user: safeUser, token };
};

module.exports = { register, login, generateToken };
