const { OAuth2Client } = require("google-auth-library");

// Single shared client instance, configured from .env — same pattern as
// how jsonwebtoken reads process.env.JWT_SECRET elsewhere in the project.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify a Google Sign-In ID token and return the payload we care about.
 *
 * Throws a { status, message } object (same shape used across
 * services/auth.service.js) so controllers can keep using the existing
 * try/catch → error(res, err.message, err.status) pattern.
 *
 * @param {string} idToken - the ID token sent by the client
 * @returns {Promise<{googleId: string, email: string, fullName: string, avatar: string, emailVerified: boolean}>}
 */
const verifyGoogleIdToken = async (idToken) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw {
      status: 500,
      message: "Google Sign-In is not configured on the server.",
    };
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    // google-auth-library throws generic Errors for malformed/expired/invalid
    // tokens (wrong audience, bad signature, expired, etc.) — normalize them.
    throw { status: 401, message: "Invalid or expired Google token." };
  }

  const payload = ticket.getPayload();

  if (!payload) {
    throw { status: 401, message: "Invalid or expired Google token." };
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    fullName: payload.name || payload.email,
    avatar: payload.picture || null,
    emailVerified: payload.email_verified === true,
  };
};

module.exports = { verifyGoogleIdToken };
