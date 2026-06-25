const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const { uploadMultiple, handleUpload } = require("../middlewares/upload");

// ── Public routes (no login needed) ──────────────────────────
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);
router.get("/:id/similar", roomController.getSimilarRooms);

// ── Owner only routes ─────────────────────────────────────────
router.get(
  "/owner/listings",
  verifyToken,
  requireRole("OWNER"),
  roomController.getOwnerRooms,
);

router.post("/", verifyToken, requireRole("OWNER"), roomController.createRoom);

router.put(
  "/:id",
  verifyToken,
  requireRole("OWNER"),
  roomController.updateRoom,
);

router.delete(
  "/:id",
  verifyToken,
  requireRole("OWNER"),
  roomController.deleteRoom,
);

router.put(
  "/:id/mark-rented",
  verifyToken,
  requireRole("OWNER"),
  roomController.markAsRented,
);

// Image management
router.post(
  "/:id/images",
  verifyToken,
  requireRole("OWNER"),
  handleUpload(uploadMultiple),
  roomController.uploadImages,
);

router.delete(
  "/:id/images/:imageId",
  verifyToken,
  requireRole("OWNER"),
  roomController.deleteImage,
);

router.put(
  "/:id/images/:imageId/primary",
  verifyToken,
  requireRole("OWNER"),
  roomController.setPrimaryImage,
);

module.exports = router;
