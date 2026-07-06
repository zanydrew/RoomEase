const express = require("express");
const router = express.Router();
const amenityController = require("../controllers/amenity.controller");

/**
 * @swagger
 * /api/amenities:
 *   get:
 *     summary: Get all amenities
 *     tags: [Amenities]
 *     responses:
 *       200: { description: OK }
 */
router.get("/", amenityController.getAllAmenities);

module.exports = router;
