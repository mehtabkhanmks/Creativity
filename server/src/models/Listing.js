const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Listing = sequelize.define('Listing', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  creatorId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  summary: { type: DataTypes.TEXT, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: {
    type: DataTypes.ENUM('stories','screenplays','business','research','creative','games','ai-software','designs','social','education','poetry','other'),
    allowNull: false
  },
  tags: {
    type: DataTypes.TEXT, defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('tags')); } catch { return []; } },
    set(val) { this.setDataValue('tags', JSON.stringify(val || [])); }
  },
  visibilityTier: {
    type: DataTypes.ENUM('public','teaser','private','draft'),
    defaultValue: 'public'
  },
  transactionTypes: {
    type: DataTypes.TEXT, defaultValue: '["buy"]',
    get() { try { return JSON.parse(this.getDataValue('transactionTypes')); } catch { return ['buy']; } },
    set(val) { this.setDataValue('transactionTypes', JSON.stringify(val || ['buy'])); }
  },
  price: { type: DataTypes.FLOAT, defaultValue: 0 },
  licenseTerms: { type: DataTypes.TEXT, defaultValue: '' },
  fundingTarget: { type: DataTypes.FLOAT, defaultValue: 0 },
  fundingRaised: { type: DataTypes.FLOAT, defaultValue: 0 },
  fingerprint: { type: DataTypes.STRING, allowNull: false },
  fingerprintedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: {
    type: DataTypes.ENUM('active','sold','archived','under_review'),
    defaultValue: 'active'
  },
  verificationStatus: {
    type: DataTypes.ENUM('verified', 'reviewing', 'archived'),
    defaultValue: 'verified'
  },
  mediaType: {
    type: DataTypes.ENUM('document', 'video', 'audio', 'image'),
    defaultValue: 'document'
  },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  inquiryCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  attachments: {
    type: DataTypes.TEXT, defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('attachments')); } catch { return []; } },
    set(val) { this.setDataValue('attachments', JSON.stringify(val || [])); }
  },
  ndaRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
  coverImage: { type: DataTypes.STRING, defaultValue: '' },
}, {
  timestamps: true,
});

module.exports = Listing;
