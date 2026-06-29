const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Notification', {
    uuid:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id:      { type: DataTypes.UUID, allowNull: false },
    type:         { type: DataTypes.STRING(50), allowNull: false },
    reference_id: { type: DataTypes.UUID, allowNull: true },
    message:      { type: DataTypes.TEXT, allowNull: false },
    is_read:      { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    tableName: 'NOTIFICATIONS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['user_id', 'is_read', 'created_at'] },
    ],
  });
