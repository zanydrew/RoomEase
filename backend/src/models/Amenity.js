const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Amenity', {
    id:   { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    icon: { type: DataTypes.STRING(100), allowNull: true },
  }, {
    tableName: 'AMENITIES',
    timestamps: false,
  });
