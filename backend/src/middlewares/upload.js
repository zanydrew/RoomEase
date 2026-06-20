const multer = require("multer");

// ── Storage ───────────────────────────────────────────────────
// memoryStorage keeps the file in memory as a Buffer.
// We pass that Buffer directly to Cloudinary instead of saving
// the file to disk first. Cleaner and faster.
const storage = multer.memoryStorage();

// ── File filter ───────────────────────────────────────────────
// Only allow image files. Reject anything else (PDF, exe, etc.)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
  }
};

// ── Multer instance ───────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per image
  },
});

// ── Named exports for different upload scenarios ───────────────

/**
 * Upload a single image.
 * Field name must be "image" in the form.
 * Usage: router.post("/avatar", verifyToken, uploadSingle, controller.updateAvatar)
 */
const uploadSingle = upload.single("image");

/**
 * Upload multiple room images at once (max 10).
 * Field name must be "images" in the form.
 * Usage: router.post("/rooms/:id/images", verifyToken, uploadMultiple, controller.uploadImages)
 */
const uploadMultiple = upload.array("images", 10);

/**
 * Wraps multer in a try/catch so multer errors (file too large,
 * wrong type) are returned as clean JSON instead of crashing.
 *
 * Usage: router.post("/upload", verifyToken, handleUpload(uploadMultiple), controller)
 */
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (file too large, too many files)
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) {
      // Our custom fileFilter error (wrong file type)
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = { uploadSingle, uploadMultiple, handleUpload };
