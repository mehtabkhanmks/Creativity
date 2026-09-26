const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  listingId: { type: DataTypes.UUID, allowNull: false },
  buyerId: { type: DataTypes.UUID, allowNull: false },
  sellerId: { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM('buy','license','support','invest','collaborate','contact'),
    allowNull: false
  },
  amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  platformFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  sellerAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending','escrow','completed','cancelled','disputed'),
    defaultValue: 'pending'
  },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
  licenseTerms: { type: DataTypes.TEXT, defaultValue: '' },
  completedAt: { type: DataTypes.DATE },
}, {
  timestamps: true,
});

module.exports = Transaction;
