const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('RoomAmenity', {
    room_id:    { type: DataTypes.UUID,    primaryKey: true },
    amenity_id: { type: DataTypes.INTEGER, primaryKey: true },
  }, {
    tableName: 'ROOM_AMENITIES',
    timestamps: false,
  });
