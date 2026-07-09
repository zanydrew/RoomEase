const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

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
    throw {
      status: 409,
      message: "An account with this email already exists.",
    };
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
    throw {
      status: 403,
      message: "Your account has been banned. Contact support.",
    };
  }

  await user.update({ last_login_at: new Date() });

  const token = generateToken(user);

  const safeUser = user.toJSON();
  delete safeUser.password_hash;

  return { user: safeUser, token };
};

// ── Google Sign-In ───────────────────────────────────────────────

/**
 * Login (or auto-register) via a Google ID token.
 *
 * Rules:
 * - The Google ID token must be valid and its email must be verified
 *   (verifyGoogleIdToken throws a { status, message } error otherwise).
 * - If a user already has this google_id → log them in.
 * - Else if a LOCAL (email/password) account already exists with the same
 *   email → link the Google account to it (store google_id, backfill
 *   avatar_url if missing) instead of creating a duplicate user.
 * - Else → auto-create a new account. password_hash stays NULL because
 *   the account has no local password; it can only be accessed via
 *   Google (or later via "forgot password" when the project adds one in the future).
 * - Banned users are rejected, exactly like normal login.
 *
 * NOTE: Google Sign-In has no concept of "role" (RENTER vs OWNER) — the
 * existing register() flow requires the client to choose one explicitly.
 * Since there's no equivalent selection step here, new Google accounts
 * default to "RENTER" (the least-privileged role). If the product needs
 * the user to pick a role on first Google login, that should happen as a
 * follow-up "complete your profile" step on the client, not in this
 * endpoint — the login response can be used as-is in the meantime.
 */
const GOOGLE_DEFAULT_ROLE = "RENTER";

const loginWithGoogle = async ({ idToken }) => {
  if (!idToken) {
    throw { status: 400, message: "idToken is required." };
  }

  const { googleId, email, fullName, avatar, emailVerified } =
    await verifyGoogleIdToken(idToken);

  if (!emailVerified) {
    throw { status: 401, message: "Google account email is not verified." };
  }

  // 1. Already linked to this Google account
  let user = await User.findOne({ where: { google_id: googleId } });

  // 2. Not linked yet — check for an existing LOCAL account with the same email
  if (!user) {
    user = await User.findOne({ where: { email } });

    if (user) {
      // Link the existing account instead of creating a duplicate.
      await user.update({
        google_id: googleId,
        avatar_url: user.avatar_url || avatar,
        is_verified: true,
      });
    }
  }

  // 3. No existing user at all — auto-create one
  if (!user) {
    user = await User.create({
      full_name: fullName,
      email,
      password_hash: null,
      role: GOOGLE_DEFAULT_ROLE,
      avatar_url: avatar,
      google_id: googleId,
      is_verified: true,
    });
  }

  if (user.is_banned) {
    throw {
      status: 403,
      message: "Your account has been banned. Contact support.",
    };
  }

  await user.update({ last_login_at: new Date() });

  const token = generateToken(user);

  const safeUser = user.toJSON();
  delete safeUser.password_hash;

  return { user: safeUser, token };
};

module.exports = { register, login, loginWithGoogle, generateToken };
