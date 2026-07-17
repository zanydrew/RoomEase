const { ViewingRequest, Room, RoomImage, User } = require("../models");

const viewingIncludes = [
  {
    model: Room,
    as: "room",
    attributes: ["uuid", "title", "price_per_month"],
    include: [
      {
        model: RoomImage,
        as: "images",
        attributes: ["uuid", "image_url", "is_primary"],
        where: { is_primary: true },
        required: false,
      },
    ],
  },
  {
    model: User,
    as: "renter",
    attributes: ["uuid", "full_name", "avatar_url", "phone_number"],
  },
  {
    model: User,
    as: "owner",
    attributes: ["uuid", "full_name", "avatar_url", "phone_number"],
  },
];

// ── REQUEST A VIEWING ─────────────────────────────────────────

const requestViewing = async (
  renterId,
  { room_id, requested_date, requested_time, renter_note },
) => {
  if (!room_id || !requested_date || !requested_time) {
    throw { status: 400, message: "Room, date, and time are required." };
  }

  const room = await Room.findByPk(room_id);
  if (!room) throw { status: 404, message: "Room not found." };
  if (room.approval_status !== "APPROVED" || room.status !== "AVAILABLE") {
    throw { status: 400, message: "This room is not available for viewing." };
  }
  if (room.owner_id === renterId) {
    throw {
      status: 400,
      message: "You cannot request a viewing on your own listing.",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(requested_date) < today) {
    throw {
      status: 400,
      message: "Viewing date must be today or in the future.",
    };
  }

  const viewing = await ViewingRequest.create({
    room_id,
    renter_id: renterId,
    owner_id: room.owner_id,
    requested_date,
    requested_time,
    notes: renter_note || null,
  });

  return viewing.toJSON();
};

// ── GET RENTER'S OWN REQUESTS ─────────────────────────────────

const getMyRequests = async (renterId, status) => {
  const where = { renter_id: renterId };
  if (status) where.status = status.toUpperCase();
  const requests = await ViewingRequest.findAll({
    where,
    include: viewingIncludes,
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
    include: viewingIncludes,
    order: [["created_at", "DESC"]],
  });
  return requests.map((r) => r.toJSON());
};

// ── GET SINGLE VIEWING REQUEST ────────────────────────────────

/**
 * Fetch a single viewing request. Only the renter or the owner
 * involved may view it.
 */
const getViewingById = async (viewingId, userId) => {
  const viewing = await ViewingRequest.findByPk(viewingId, {
    include: viewingIncludes,
  });
  if (!viewing) throw { status: 404, message: "Viewing request not found." };

  const isParticipant =
    viewing.renter_id === userId || viewing.owner_id === userId;
  if (!isParticipant) {
    throw { status: 403, message: "You are not part of this viewing request." };
  }

  return viewing.toJSON();
};

// ── ACCEPT ────────────────────────────────────────────────────

const acceptViewing = async (viewingId, ownerId) => {
  const viewing = await ViewingRequest.findByPk(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only manage requests for your own rooms.",
    };
  }
  if (viewing.status !== "PENDING" && viewing.status !== "SUGGESTED") {
    throw {
      status: 400,
      message: "Only pending or suggested requests can be accepted.",
    };
  }

  await viewing.update({ status: "APPROVED" });

  return viewing.toJSON();
};

// ── REJECT ────────────────────────────────────────────────────

const rejectViewing = async (viewingId, ownerId ) => {
  const viewing = await ViewingRequest.findByPk(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only manage requests for your own rooms.",
    };
  }
  if (viewing.status !== "PENDING" && viewing.status !== "SUGGESTED") {
    throw {
      status: 400,
      message: "Only pending or suggested requests can be rejected.",
    };
  }

  await viewing.update({ status: "REJECTED", notes: "sorry, the room have been rented at the moment" });

  return viewing.toJSON();
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

  const viewing = await ViewingRequest.findByPk(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.owner_id !== ownerId) {
    throw {
      status: 403,
      message: "You can only manage requests for your own rooms.",
    };
  }
  if (viewing.status !== "PENDING") {
    throw {
      status: 400,
      message: "Only pending requests can be given a new suggested time.",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(suggested_date) < today) {
    throw {
      status: 400,
      message: "Suggested date must be today or in the future.",
    };
  }

  await viewing.update({
    status: "SUGGESTED",
    suggested_date,
    suggested_time,
    notes: owner_note || viewing.notes,
  });

  return viewing.toJSON();
};

// ── CANCEL ────────────────────────────────────────────────────

const cancelViewing = async (viewingId, renterId) => {
  const viewing = await ViewingRequest.findByPk(viewingId);
  if (!viewing) throw { status: 404, message: "Viewing request not found." };
  if (viewing.renter_id !== renterId) {
    throw {
      status: 403,
      message: "You can only cancel your own viewing requests.",
    };
  }
  if (viewing.status === "APPROVED") {
    throw {
      status: 400,
      message: "Cannot cancel an already accepted viewing. Contact the owner.",
    };
  }

  await viewing.destroy();
};

module.exports = {
  requestViewing,
  getMyRequests,
  getIncomingRequests,
  getViewingById,
  acceptViewing,
  rejectViewing,
  suggestTime,
  cancelViewing,
};
