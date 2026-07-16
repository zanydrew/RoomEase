const { SavedRoom, Room, RoomImage, Amenity } = require("../models");

// ── GET MY SAVED ROOMS ────────────────────────────────────────

const getMyFavorites = async (userId) => {
  const favorites = await SavedRoom.findAll({
    where: { user_id: userId },
    include: [
      {
        model: Room,
        as: "room",
        include: [
          { model: RoomImage, as: "images" },
          {
            model: Amenity,
            as: "amenities",
            attributes: ["id", "name", "icon"],
            through: { attributes: [] },
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });
  return favorites.map((f) => f.toJSON().room).filter(Boolean);
};

// ── SAVE A ROOM ───────────────────────────────────────────────

const saveRoom = async (userId, roomId) => {
  const room = await Room.findByPk(roomId);
  if (!room) {
    throw { status: 404, message: "Room not found." };
  }
  if (room.approval_status !== "APPROVED" || room.status !== "AVAILABLE") {
    throw { status: 400, message: "This room is not available." };
  }

  const already = await SavedRoom.findOne({
    where: { user_id: userId, room_id: roomId },
  });
  if (already) {
    return { alreadySaved: true };
  }

  await SavedRoom.create({ user_id: userId, room_id: roomId });
  return { alreadySaved: false };
};

// ── UNSAVE A ROOM ─────────────────────────────────────────────

const unsaveRoom = async (userId, roomId) => {
  await SavedRoom.destroy({ where: { user_id: userId, room_id: roomId } });
};

// ── CHECK IF A ROOM IS SAVED ──────────────────────────────────

const isSaved = async (userId, roomId) => {
  const record = await SavedRoom.findOne({
    where: { user_id: userId, room_id: roomId },
  });
  return record !== null;
};

module.exports = { getMyFavorites, saveRoom, unsaveRoom, isSaved };
