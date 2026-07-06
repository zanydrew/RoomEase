const amenityService = require("../services/amenity.service");
const { success, error } = require("../utils/response");

// ── GET /api/amenities ─────────────────────────────────────────
const getAllAmenities = async (req, res) => {
  try {
    const amenities = await amenityService.getAllAmenities();
    return success(res, { amenities }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getAllAmenities };
