const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('creator', 'buyer', 'collaborator', 'admin', 'all'), defaultValue: 'creator' },
  bio: { type: DataTypes.TEXT, defaultValue: '' },
  skills: { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('skills')); } catch { return []; } }, set(val) { this.setDataValue('skills', JSON.stringify(val || [])); } },
  avatar: { type: DataTypes.STRING, defaultValue: '' },
  location: { type: DataTypes.STRING, defaultValue: '' },
  website: { type: DataTypes.STRING, defaultValue: '' },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isIdentityVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  totalEarnings: { type: DataTypes.FLOAT, defaultValue: 0 },
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
  defaultScope: { attributes: { exclude: ['passwordHash'] } },
  scopes: { withPassword: { attributes: {} } },
});

module.exports = User;
