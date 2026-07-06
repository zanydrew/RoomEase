const { Room, ViewingRequest } = require("../models");

// ── DASHBOARD ─────────────────────────────────────────────────

/**
 * Summary counts for the owner dashboard landing page.
 */
const getDashboard = async (ownerId) => {
  const [
    totalRooms,
    availableRooms,
    rentedRooms,
    pendingRooms,
    pendingViewings,
  ] = await Promise.all([
    Room.count({ where: { owner_id: ownerId } }),
    Room.count({ where: { owner_id: ownerId, status: "AVAILABLE" } }),
    Room.count({ where: { owner_id: ownerId, status: "RENTED" } }),
    Room.count({ where: { owner_id: ownerId, approval_status: "PENDING" } }),
    ViewingRequest.count({ where: { owner_id: ownerId, status: "PENDING" } }),
  ]);

  return {
    rooms: {
      total: totalRooms,
      available: availableRooms,
      rented: rentedRooms,
      pendingApproval: pendingRooms,
    },
    viewingRequests: {
      pending: pendingViewings,
    },
  };
};

// ── STATISTICS ────────────────────────────────────────────────

/**
 * A slightly deeper breakdown than the dashboard summary —
 * room counts grouped by approval status, plus total viewing
 * request volume for this owner.
 */
const getStatistics = async (ownerId) => {
  const [rooms, viewingRequests] = await Promise.all([
    Room.findAll({
      where: { owner_id: ownerId },
      attributes: ["approval_status", "status"],
      raw: true,
    }),
    ViewingRequest.findAll({
      where: { owner_id: ownerId },
      attributes: ["status"],
      raw: true,
    }),
  ]);

  const roomStats = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    AVAILABLE: 0,
    RENTED: 0,
  };
  for (const room of rooms) {
    roomStats[room.approval_status] =
      (roomStats[room.approval_status] || 0) + 1;
    roomStats[room.status] = (roomStats[room.status] || 0) + 1;
  }

  const viewingStats = { PENDING: 0, APPROVED: 0, REJECTED: 0, SUGGESTED: 0 };
  for (const viewing of viewingRequests) {
    viewingStats[viewing.status] = (viewingStats[viewing.status] || 0) + 1;
  }

  return {
    totalListings: rooms.length,
    listingsByStatus: roomStats,
    totalViewingRequests: viewingRequests.length,
    viewingRequestsByStatus: viewingStats,
  };
};

module.exports = { getDashboard, getStatistics };
