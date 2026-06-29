const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Conversation', {
    uuid:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    room_id:   { type: DataTypes.UUID, allowNull: false },
    renter_id: { type: DataTypes.UUID, allowNull: false },
    owner_id:  { type: DataTypes.UUID, allowNull: false },
  }, {
    tableName: 'CONVERSATIONS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['room_id', 'renter_id', 'owner_id'] },
      { fields: ['renter_id', 'updated_at'] },
      { fields: ['owner_id',  'updated_at'] },
    ],
  });
