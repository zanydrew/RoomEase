const { ViewingRequest, Room, Notification } = require("../models");

// ── REQUEST A VIEWING ─────────────────────────────────────────

const requestViewing = async (
  renterId,
  { room_id, requested_date, requested_time, notes },
) => {
  if (!room_id || !requested_date || !requested_time) {
    throw { status: 400, message: "Room, date, and time are required." };
  }

  const room = await Room.findByPk(room_id);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.approval_status !== "APPROVED") {
    throw { status: 400, message: "This room is not available for viewing." };
  }
  if (room.owner_id === renterId) {
    throw { status: 400, message: "You cannot request a viewing on your own listing." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(requested_date) < today) {
    throw { status: 400, message: "Viewing date must be today or in the future." };
  }

  const viewing = await ViewingRequest.create({
    room_id,
    renter_id: renterId,
    owner_id: room.owner_id,
    requested_date,
    requested_time,
    notes: notes || null,
  });

  await Notification.create({
    user_id: room.owner_id,
    type: "viewing_request",
    message: `Someone wants to view "${room.title}" on ${requested_date} at ${requested_time}.`,
    reference_id: viewing.uuid,
  });

  return viewing.toJSON();
};

// ── GET RENTER'S OWN REQUESTS ─────────────────────────────────

const getMyRequests = async (renterId, status) => {
  const where = { renter_id: renterId };
  if (status) where.status = status.toUpperCase();
  const requests = await ViewingRequest.findAll({
    where,
    order: [["created_at", "DESC"]],
  });
  return requests.map((r) => r.toJSON());
};

// ── GET OWNER'S INCOMING REQUESTS ────────────────────────────

const getIncomingRequests = async (ownerId, status) => {
  const where = { owner_id: ownerId };
  if (status) where.status = status.toUpperCase();
  const requests = await ViewingRequest.findAll({
    where,
    order: [["created_at", "DESC"]],
  });
  return requests.map((r) => r.toJSON());
};

// ── ACCEPT ────────────────────────────────────────────────────

const acceptViewing = async (viewingId, ownerId) => {
  const viewing = await ViewingRequest.findByPk(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw { status: 403, message: "You can only manage requests for your own rooms." };
  }
  if (viewing.status !== "PENDING" && viewing.status !== "SUGGESTED") {
    throw { status: 400, message: "Only pending or suggested requests can be accepted." };
  }

  await viewing.update({ status: "APPROVED" });

  const room = await Room.findByPk(viewing.room_id);
  await Notification.create({
    user_id: viewing.renter_id,
    type: "viewing_accepted",
    message: `Your viewing for "${room ? room.title : "the room"}" on ${viewing.requested_date} has been accepted.`,
    reference_id: viewing.uuid,
  });

  return viewing.toJSON();
};

// ── REJECT ────────────────────────────────────────────────────

const rejectViewing = async (viewingId, ownerId, notes) => {
  const viewing = await ViewingRequest.findByPk(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw { status: 403, message: "You can only manage requests for your own rooms." };
  }
  if (viewing.status !== "PENDING" && viewing.status !== "SUGGESTED") {
    throw { status: 400, message: "Only pending or suggested requests can be rejected." };
  }

  await viewing.update({ status: "REJECTED", notes: notes || viewing.notes });

  const room = await Room.findByPk(viewing.room_id);
  await Notification.create({
    user_id: viewing.renter_id,
    type: "viewing_rejected",
    message: notes
      ? `Your viewing for "${room ? room.title : "the room"}" was rejected. Reason: ${notes}`
      : `Your viewing request for "${room ? room.title : "the room"}" was rejected.`,
    reference_id: viewing.uuid,
  });

  return viewing.toJSON();
};

// ── SUGGEST ANOTHER TIME ──────────────────────────────────────

const suggestTime = async (
  viewingId,
  ownerId,
  { suggested_date, suggested_time, notes },
) => {
  if (!suggested_date || !suggested_time) {
    throw { status: 400, message: "Suggested date and time are required." };
  }

  const viewing = await ViewingRequest.findByPk(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw { status: 403, message: "You can only manage requests for your own rooms." };
  }
  if (viewing.status !== "PENDING") {
    throw { status: 400, message: "Only pending requests can be given a new suggested time." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(suggested_date) < today) {
    throw { status: 400, message: "Suggested date must be today or in the future." };
  }

  await viewing.update({
    status: "SUGGESTED",
    suggested_date,
    suggested_time,
    notes: notes || viewing.notes,
  });

  const room = await Room.findByPk(viewing.room_id);
  await Notification.create({
    user_id: viewing.renter_id,
    type: "viewing_suggested",
    message: `The owner suggested ${suggested_date} at ${suggested_time} for "${room ? room.title : "the room"}".`,
    reference_id: viewing.uuid,
  });

  return viewing.toJSON();
};

// ── CANCEL ────────────────────────────────────────────────────

const cancelViewing = async (viewingId, renterId) => {
  const viewing = await ViewingRequest.findByPk(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.renter_id !== renterId) {
    throw { status: 403, message: "You can only cancel your own viewing requests." };
  }
  if (viewing.status === "APPROVED") {
    throw { status: 400, message: "Cannot cancel an already accepted viewing. Contact the owner." };
  }

  await viewing.destroy();
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
