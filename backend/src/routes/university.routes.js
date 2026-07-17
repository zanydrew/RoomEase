const express = require("express");
const router = express.Router();
const universityController = require("../controllers/university.controller");

/**
 * @swagger
 * /api/universities:
 *   get:
 *     summary: Get all universities
 *     tags: [Universities]
 *     responses:
 *       200: { description: OK }
 */
router.get("/", universityController.getAllUniversities);

module.exports = router;
