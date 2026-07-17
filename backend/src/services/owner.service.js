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
      attributes: [ "status"],
      raw: true,
    }),
    ViewingRequest.findAll({
      where: { owner_id: ownerId },
      attributes: ["status"],
      raw: true,
    }),
  ]);

  const roomStats = {
    AVAILABLE: 0,
    RENTED: 0,
  };

  rooms.forEach((room) => {
    if (room.status === "AVAILABLE") {
      roomStats.AVAILABLE += 1;
    } else if (room.status === "RENTED") {
      roomStats.RENTED += 1;
    }
  });

  const viewingStats = {
    TotalViewingRequest: viewingRequests.length,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };
  viewingRequests.forEach((request) => {
    if (request.status === "PENDING") {
      viewingStats.PENDING += 1;
    } else if (request.status === "APPROVED") {
      viewingStats.APPROVED += 1;
    } else if (request.status === "REJECTED") {
      viewingStats.REJECTED += 1;
    }
  });

  return {
    totalListings: rooms.length,
    listingsByStatus: roomStats,
    totalViewingRequests: viewingRequests.length,
    viewingRequestsByStatus: viewingStats,
  };
};

module.exports = { getDashboard, getStatistics };
