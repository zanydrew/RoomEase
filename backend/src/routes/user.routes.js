const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const verifyToken = require("../middlewares/verifyToken");
const { uploadSingle, handleUpload } = require("../middlewares/upload");

// All user routes require login
router.use(verifyToken);

// Profile
router.get("/profile", userController.getMyProfile);
router.get("/:id", userController.getProfileById);
router.put("/profile", userController.updateProfile);
router.put("/avatar", handleUpload(uploadSingle), userController.updateAvatar);

// Password
router.put("/password", userController.changePassword);

module.exports = router;
