const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Room', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title:           { type: DataTypes.STRING(255), allowNull: false },
    description:     { type: DataTypes.TEXT,        allowNull: true  },
    price_per_month: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    deposit:         { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
    address:         { type: DataTypes.STRING(255), allowNull: false },
    district:        { type: DataTypes.STRING(100), allowNull: false },
    city:            { type: DataTypes.STRING(100), allowNull: false },
    location: {
      // Stored as MySQL POINT; Sequelize returns it as a GeoJSON-like object
      type: DataTypes.GEOMETRY('POINT', 4326),
      allowNull: false,
    },
    room_type: {
      type: DataTypes.ENUM('STUDIO', '1BR', '2BR', 'SHARED'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('AVAILABLE', 'RENTED'),
      allowNull: false,
      defaultValue: 'AVAILABLE',
    },
    approval_status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  }, {
    tableName: 'ROOMS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['owner_id'] },
      { fields: ['approval_status', 'status', 'district', 'price_per_month'] },
    ],
  });
