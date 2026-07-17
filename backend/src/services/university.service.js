const { University } = require("../models");

// ── GET ALL UNIVERSITIES ────────────────────────────────────────
const getAllUniversities = async () => {
  const universities = await University.findAll({
    attributes: ["id", "name", "address"],
    order: [["name", "ASC"]],
  });
  return universities.map((university) => university.toJSON());
};

module.exports = { getAllUniversities };
