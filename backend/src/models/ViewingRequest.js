const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('ViewingRequest', {
    uuid:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    room_id:        { type: DataTypes.UUID, allowNull: false },
    renter_id:      { type: DataTypes.UUID, allowNull: false },
    owner_id:       { type: DataTypes.UUID, allowNull: false },
    requested_date: { type: DataTypes.DATEONLY, allowNull: false },
    requested_time: { type: DataTypes.TIME,     allowNull: false },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUGGESTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    suggested_date: { type: DataTypes.DATEONLY, allowNull: true },
    suggested_time: { type: DataTypes.TIME,     allowNull: true },
    notes:          { type: DataTypes.TEXT,     allowNull: true },
  }, {
    tableName: 'VIEWING_REQUESTS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['renter_id', 'status'] },
      { fields: ['owner_id',  'status'] },
    ],
  });
