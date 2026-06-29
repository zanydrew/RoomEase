const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Review', {
    uuid:    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    room_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID, allowNull: false },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'REVIEWS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [{ fields: ['room_id'] }],
  });
