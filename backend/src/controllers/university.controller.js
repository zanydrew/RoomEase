const universityService = require("../services/university.service");
const { success, error } = require("../utils/response");

// ── GET /api/universities ─────────────────────────────────────
const getAllUniversities = async (req, res) => {
  try {
    const universities = await universityService.getAllUniversities();
    return success(res, { universities }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = { getAllUniversities };
