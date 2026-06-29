const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * verifyToken
 * Reads the JWT from the Authorization header, verifies it,
 * then attaches the full user object to req.user.
 *
 * Usage in routes:
 *   router.post("/rooms", verifyToken, roomController.create);
 */
const verifyToken = async (req, res, next) => {
  try {
    // 1. Get the token from the header
    //    Frontend sends: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1]; // get the part after "Bearer "

    // 2. Verify the token using our JWT secret
    //    If the token is fake or expired, jwt.verify() throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch the real user from database
    //    (decoded only contains id, role — we want the full user)
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // 4. Block banned users from doing anything
    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Contact support.",
      });
    }

    // 5. Attach user to the request so controllers can access it
    //    e.g. req.user.id, req.user.role, req.user.name
    req.user = user;

    next(); // move on to the controller
  } catch (err) {
    // jwt.verify() throws these specific errors
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    // Unexpected error
    return res.status(500).json({
      success: false,
      message: "Authentication error.",
    });
  }
};

module.exports = verifyToken;
