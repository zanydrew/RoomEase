const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('RoomImage', {
    uuid:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    room_id:    { type: DataTypes.UUID, allowNull: false },
    image_url:  { type: DataTypes.STRING(255), allowNull: false },
    is_primary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    tableName: 'ROOM_IMAGES',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });
