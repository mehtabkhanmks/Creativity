const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CollaborationProject = sequelize.define('CollaborationProject', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  creatorId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  roleNeeded: { type: DataTypes.STRING, defaultValue: 'Looking for Director' },
  projectGoal: { type: DataTypes.TEXT, defaultValue: '' },
  requiredSkills: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('requiredSkills')); } catch { return []; } },
    set(val) { this.setDataValue('requiredSkills', JSON.stringify(val || [])); }
  },
  category: { type: DataTypes.STRING, defaultValue: 'Film & Media' },
  status: { type: DataTypes.ENUM('open', 'in_progress', 'completed'), defaultValue: 'open' },
  isSaved: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true,
});

const CollaborationRequest = sequelize.define('CollaborationRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  projectId: { type: DataTypes.UUID, allowNull: true },
  senderName: { type: DataTypes.STRING, allowNull: false },
  senderAvatar: { type: DataTypes.STRING, defaultValue: '' },
  senderRole: { type: DataTypes.STRING, defaultValue: '' },
  message: { type: DataTypes.TEXT, allowNull: false },
  timeAgo: { type: DataTypes.STRING, defaultValue: 'Just now' },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'declined'), defaultValue: 'pending' },
  receiverId: { type: DataTypes.UUID, allowNull: true }
}, {
  timestamps: true,
});

module.exports = { CollaborationProject, CollaborationRequest };
