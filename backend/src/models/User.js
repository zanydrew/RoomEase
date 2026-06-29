const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('User', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('RENTER', 'OWNER', 'ADMIN'),
      allowNull: false,
    },
    avatar_url:    { type: DataTypes.STRING(255), allowNull: true },
    phone_number:  { type: DataTypes.STRING(50),  allowNull: true },
    google_id:     { type: DataTypes.STRING(255), allowNull: true, unique: true },
    facebook_id:   { type: DataTypes.STRING(255), allowNull: true, unique: true },
    is_verified:   { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_banned:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    last_login_at: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'USERS',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
