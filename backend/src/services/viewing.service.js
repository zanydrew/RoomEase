const ViewingRequest = require("../models/ViewingRequest");
const Room = require("../models/Room");
const Notification = require("../models/Notification");

// ── REQUEST A VIEWING ─────────────────────────────────────────

/**
 * Renter requests a physical visit to a room.
 *
 * Rules:
 * - Room must be approved and available
 * - Cannot request a viewing on a past date
 * - Renter cannot request on their own room
 */
const requestViewing = async (
  renterId,
  { room_id, requested_date, requested_time, renter_note },
) => {
  if (!room_id || !requested_date || !requested_time) {
    throw { status: 400, message: "Room, date, and time are required." };
  }

  // Check the room exists and is approved
  const room = await Room.findById(room_id);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }
  if (room.status !== "approved") {
    throw { status: 400, message: "This room is not available for viewing." };
  }

  // Renter cannot request a viewing on their own listing
  if (room.owner_id === renterId) {
    throw {
      status: 400,
      message: "You cannot request a viewing on your own listing.",
    };
  }

  // Requested date must be today or in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const viewingDate = new Date(requested_date);
  if (viewingDate < today) {
    throw {
      status: 400,
      message: "Viewing date must be today or in the future.",
    };
  }

  // Create the viewing request
  const viewing = await ViewingRequest.create({
    room_id,
    renter_id: renterId,
    owner_id: room.owner_id,
    requested_date,
    requested_time,
    renter_note: renter_note || null,
  });

  // Notify the owner
  await Notification.create({
    user_id: room.owner_id,
    type: "viewing_request",
    title: "New Viewing Request",
    body: `Someone wants to view "${room.title}" on ${requested_date} at ${requested_time}.`,
    reference_id: viewing.id,
    reference_type: "viewing",
  });

  return viewing;
};

// ── GET RENTER'S OWN REQUESTS ─────────────────────────────────

const getMyRequests = async (renterId, status) => {
  return ViewingRequest.findByRenter(renterId, status || null);
};

// ── GET OWNER'S INCOMING REQUESTS ────────────────────────────

const getIncomingRequests = async (ownerId, status) => {
  return ViewingRequest.findByOwner(ownerId, status || null);
};

// ── ACCEPT ────────────────────────────────────────────────────

const acceptViewing = async (viewingId, ownerId) => {
  const viewing = await ViewingRequest.findById(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only manage requests for your own rooms.",
    };
  }
  if (viewing.status !== "pending" && viewing.status !== "suggested") {
    throw {
      status: 400,
      message: "Only pending or suggested requests can be accepted.",
    };
  }

  const updated = await ViewingRequest.accept(viewingId);

  // Notify the renter
  await Notification.create({
    user_id: viewing.renter_id,
    type: "viewing_accepted",
    title: "Viewing Accepted!",
    body: `Your viewing for "${viewing.room_title}" on ${viewing.requested_date} has been accepted.`,
    reference_id: viewingId,
    reference_type: "viewing",
  });

  return updated;
};

// ── REJECT ────────────────────────────────────────────────────

const rejectViewing = async (viewingId, ownerId, owner_note) => {
  const viewing = await ViewingRequest.findById(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only manage requests for your own rooms.",
    };
  }
  if (viewing.status !== "pending" && viewing.status !== "suggested") {
    throw {
      status: 400,
      message: "Only pending or suggested requests can be rejected.",
    };
  }

  const updated = await ViewingRequest.reject(viewingId, owner_note);

  // Notify the renter
  await Notification.create({
    user_id: viewing.renter_id,
    type: "viewing_rejected",
    title: "Viewing Request Rejected",
    body: owner_note
      ? `Your viewing for "${viewing.room_title}" was rejected. Reason: ${owner_note}`
      : `Your viewing request for "${viewing.room_title}" was rejected.`,
    reference_id: viewingId,
    reference_type: "viewing",
  });

  return updated;
};

// ── SUGGEST ANOTHER TIME ──────────────────────────────────────

const suggestTime = async (
  viewingId,
  ownerId,
  { suggested_date, suggested_time, owner_note },
) => {
  if (!suggested_date || !suggested_time) {
    throw { status: 400, message: "Suggested date and time are required." };
  }

  const viewing = await ViewingRequest.findById(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only manage requests for your own rooms.",
    };
  }
  if (viewing.status !== "pending") {
    throw {
      status: 400,
      message: "Only pending requests can be given a new suggested time.",
    };
  }

  // Suggested date must be in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(suggested_date) < today) {
    throw {
      status: 400,
      message: "Suggested date must be today or in the future.",
    };
  }

  const updated = await ViewingRequest.suggestTime(viewingId, {
    suggested_date,
    suggested_time,
    owner_note,
  });

  // Notify the renter
  await Notification.create({
    user_id: viewing.renter_id,
    type: "viewing_suggested",
    title: "Owner Suggested a New Time",
    body: `The owner suggested ${suggested_date} at ${suggested_time} for "${viewing.room_title}".`,
    reference_id: viewingId,
    reference_type: "viewing",
  });

  return updated;
};

// ── CANCEL ────────────────────────────────────────────────────

/**
 * Renter cancels their own viewing request.
 * Can only cancel pending or suggested requests.
 */
const cancelViewing = async (viewingId, renterId) => {
  const viewing = await ViewingRequest.findById(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.renter_id !== renterId) {
    throw {
      status: 403,
      message: "You can only cancel your own viewing requests.",
    };
  }
  if (viewing.status === "accepted") {
    throw {
      status: 400,
      message: "Cannot cancel an already accepted viewing. Contact the owner.",
    };
  }
  if (viewing.status === "cancelled") {
    throw { status: 400, message: "This request is already cancelled." };
  }

  await ViewingRequest.cancel(viewingId);
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
