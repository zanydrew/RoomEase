const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Token ─────────────────────────────────────────────────────

/**
 * Generate a JWT token for a user.
 * Stores only id and role inside the token (minimal payload).
 * The full user is always fetched fresh from DB in verifyToken.
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
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
const register = async ({ name, email, password, role }) => {
  // 1. Validate role — users can only self-register as RENTER or OWNER
  const allowedRoles = ["RENTER", "OWNER"];
  if (!allowedRoles.includes(role)) {
    throw { status: 400, message: "Role must be RENTER or OWNER." };
  }

  // 2. Validate password length
  if (!password || password.length < 6) {
    throw { status: 400, message: "Password must be at least 6 characters." };
  }

  // 3. Check if email is already registered
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw {
      status: 409,
      message: "An account with this email already exists.",
    };
  }

  // 4. Hash the password — never store plain text passwords
  //    10 = salt rounds (higher = more secure but slower)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Create the user in the database
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    auth_provider: "local",
  });

  // 6. Generate token so user is logged in immediately after register
  const token = generateToken(user);

  return { user, token };
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
  const user = await User.findByEmail(email);

  if (!user) {
    // Use a vague message — don't tell attacker which part was wrong
    throw { status: 401, message: "Invalid email or password." };
  }

  // 2. Block OAuth users from logging in with password
  if (user.auth_provider !== "local") {
    throw {
      status: 400,
      message: `This account was registered with ${user.auth_provider}. Please use that to log in.`,
    };
  }

  // 3. Compare the plain password with the stored hash
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw { status: 401, message: "Invalid email or password." };
  }

  // 4. Block banned users
  if (user.is_banned) {
    throw {
      status: 403,
      message: "Your account has been banned. Contact support.",
    };
  }

  // 5. Generate token
  const token = generateToken(user);

  // 6. Remove password from the returned user object
  const { password: _, ...safeUser } = user;

  return { user: safeUser, token };
};

module.exports = { register, login, generateToken };
