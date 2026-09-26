const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  transactionId: { type: DataTypes.UUID, allowNull: false },
  fromUserId: { type: DataTypes.UUID, allowNull: false },
  toUserId: { type: DataTypes.UUID, allowNull: false },
  listingId: { type: DataTypes.UUID, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, defaultValue: '' },
}, {
  timestamps: true,
});

module.exports = Review;
