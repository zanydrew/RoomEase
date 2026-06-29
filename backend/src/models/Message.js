const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Message', {
    uuid:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    conversation_id: { type: DataTypes.UUID, allowNull: false },
    sender_id:       { type: DataTypes.UUID, allowNull: false },
    content:         { type: DataTypes.TEXT, allowNull: false },
    is_read:         { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, {
    tableName: 'MESSAGES',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      { fields: ['conversation_id', 'created_at'] },
    ],
  });
