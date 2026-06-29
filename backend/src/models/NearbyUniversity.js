const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('NearbyUniversity', {
    room_id:       { type: DataTypes.UUID,    primaryKey: true },
    university_id: { type: DataTypes.INTEGER, primaryKey: true },
    distance_km:   { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    walk_minutes:  { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'NEARBY_UNIVERSITIES',
    timestamps: false,
  });
