const { Amenity } = require("../models");

// ── GET ALL AMENITIES ─────────────────────────────────────────
const getAllAmenities = async () => {
  const amenities = await Amenity.findAll({ order: [["name", "ASC"]] });
  return amenities.map((amenity) => amenity.toJSON());
};

module.exports = { getAllAmenities };
