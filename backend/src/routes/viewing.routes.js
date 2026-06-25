const express = require("express");
const router = express.Router();
const viewingController = require("../controllers/viewing.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

// All viewing routes require login
router.use(verifyToken);

// Renter routes
router.post("/", requireRole("RENTER"), viewingController.requestViewing);

router.get(
  "/my-requests",
  requireRole("RENTER"),
  viewingController.getMyRequests,
);

router.put(
  "/:id/cancel",
  requireRole("RENTER"),
  viewingController.cancelViewing,
);

// Owner routes
router.get(
  "/incoming",
  requireRole("OWNER"),
  viewingController.getIncomingRequests,
);

router.put(
  "/:id/accept",
  requireRole("OWNER"),
  viewingController.acceptViewing,
);

router.put(
  "/:id/reject",
  requireRole("OWNER"),
  viewingController.rejectViewing,
);

router.put("/:id/suggest", requireRole("OWNER"), viewingController.suggestTime);

module.exports = router;
