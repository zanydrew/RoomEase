const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('SavedRoom', {
    uuid:    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id: { type: DataTypes.UUID, allowNull: false },
    room_id: { type: DataTypes.UUID, allowNull: false },
  }, {
    tableName: 'SAVED_ROOMS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ unique: true, fields: ['user_id', 'room_id'] }],
  });
