const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favorite.controller");
const verifyToken = require("../middlewares/verifyToken");

// All favorite routes require login
router.use(verifyToken);

router.get("/", favoriteController.getMyFavorites);
router.get("/:roomId/check", favoriteController.checkIfSaved);
router.post("/:roomId", favoriteController.saveRoom);
router.delete("/:roomId", favoriteController.unsaveRoom);

module.exports = router;
