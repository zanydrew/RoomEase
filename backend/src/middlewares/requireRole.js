/**
 * requireRole
 * Checks that the logged-in user has the required role.
 * Must always be used AFTER verifyToken, because it reads req.user.
 *
 * Usage in routes:
 *   router.post("/rooms", verifyToken, requireRole("OWNER"), controller.create);
 *   router.get("/admin/users", verifyToken, requireRole("ADMIN"), controller.getUsers);
 *
 * Also accepts multiple roles:
 *   requireRole("OWNER", "ADMIN")  → allows either role through
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    // req.user was attached by verifyToken
    // If requireRole is used without verifyToken this will catch it
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    // Check if the user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}.`,
      });
    }

    next(); // role is allowed, move to controller
  };
};

module.exports = requireRole;
