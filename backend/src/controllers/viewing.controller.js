const viewingService = require("../services/viewing.service");
const { success, error } = require("../utils/response");

// ── POST /api/viewings ────────────────────────────────────────
// Renter requests a viewing for a room.
const requestViewing = async (req, res) => {
  try {
    const { room_id, requested_date, requested_time, renter_note } = req.body;
      const viewing = await viewingService.requestViewing(req.user.uuid, {
        room_id,
        requested_date,
        requested_time,
        renter_note,
      });
    return success(res, { viewing }, "Viewing request sent successfully.", 201);
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/viewings/my-requests ─────────────────────────────
// Renter sees all their own viewing requests.
// Optional query: ?status=pending|accepted|rejected|suggested|cancelled
const getMyRequests = async (req, res) => {
  try {
    const viewings = await viewingService.getMyRequests(
      req.user.uuid,
      req.query.status,
    );
    return success(res, { viewings }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── GET /api/viewings/incoming ────────────────────────────────
// Owner sees all viewing requests coming in for their rooms.
// Optional query: ?status=pending|accepted|rejected|suggested|cancelled
const getIncomingRequests = async (req, res) => {
  try {
    const viewings = await viewingService.getIncomingRequests(
      req.user.uuid,
      req.query.status,
    );
    return success(res, { viewings }, "OK");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/viewings/:id/accept ──────────────────────────────
const acceptViewing = async (req, res) => {
  try {
    const viewing = await viewingService.acceptViewing(
      req.params.id,
      req.user.uuid,
    );
    return success(res, { viewing }, "Viewing request accepted.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/viewings/:id/reject ──────────────────────────────
const rejectViewing = async (req, res) => {
  try {
    const viewing = await viewingService.rejectViewing(
      req.params.id,
      req.user.uuid,
      req.body.owner_note,
    );
    return success(res, { viewing }, "Viewing request rejected.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/viewings/:id/suggest ─────────────────────────────
const suggestTime = async (req, res) => {
  try {
    const { suggested_date, suggested_time, owner_note } = req.body;
    const viewing = await viewingService.suggestTime(
      req.params.id,
      req.user.uuid,
      {
        suggested_date,
        suggested_time,
        owner_note,
      },
    );
    return success(res, { viewing }, "New time suggested to the renter.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

// ── PUT /api/viewings/:id/cancel ──────────────────────────────
const cancelViewing = async (req, res) => {
  try {
    await viewingService.cancelViewing(req.params.id, req.user.uuid);
    return success(res, null, "Viewing request cancelled.");
  } catch (err) {
    return error(res, err.message, err.status || 500);
  }
};

module.exports = {
  requestViewing,
  getMyRequests,
  getIncomingRequests,
  acceptViewing,
  rejectViewing,
  suggestTime,
  cancelViewing,
};
