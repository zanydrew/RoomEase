const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('SearchHistory', {
    uuid:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    user_id:   { type: DataTypes.UUID, allowNull: false },
    keyword:   { type: DataTypes.STRING(255), allowNull: true },
    city:      { type: DataTypes.STRING(100), allowNull: true },
    district:  { type: DataTypes.STRING(100), allowNull: true },
    min_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    max_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    room_type: {
      type: DataTypes.ENUM('STUDIO', '1BR', '2BR', 'SHARED'),
      allowNull: true,
    },
  }, {
    tableName: 'SEARCH_HISTORY',
    timestamps: true,
    createdAt: 'searched_at',
    updatedAt: false,
  });
