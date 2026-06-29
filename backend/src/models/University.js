const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('University', {
    id:       { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name:     { type: DataTypes.STRING(255), allowNull: false, unique: true },
    location: { type: DataTypes.GEOMETRY('POINT', 4326), allowNull: false },
    address:  { type: DataTypes.STRING(255), allowNull: true },
  }, {
    tableName: 'UNIVERSITIES',
    timestamps: false,
  });
