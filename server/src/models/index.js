const sequelize = require('../config/database');
const User = require('./User');
const Listing = require('./Listing');
const Transaction = require('./Transaction');
const Review = require('./Review');
const { CollaborationProject, CollaborationRequest } = require('./Collaboration');

// Associations
User.hasMany(Listing, { foreignKey: 'creatorId', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

User.hasMany(CollaborationProject, { foreignKey: 'creatorId', as: 'collaborationProjects' });
CollaborationProject.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

CollaborationProject.hasMany(CollaborationRequest, { foreignKey: 'projectId', as: 'requests' });
CollaborationRequest.belongsTo(CollaborationProject, { foreignKey: 'projectId', as: 'project' });

User.hasMany(Transaction, { foreignKey: 'buyerId', as: 'purchases' });
User.hasMany(Transaction, { foreignKey: 'sellerId', as: 'sales' });
Listing.hasMany(Transaction, { foreignKey: 'listingId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Transaction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Transaction.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

Review.belongsTo(User, { foreignKey: 'fromUserId', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'toUserId', as: 'reviewee' });

const syncDB = async () => {
  await sequelize.sync();
  console.log('✅ Database synced successfully');
  const count = await Listing.count();
  if (count === 0) {
    console.log('🌱 Database is empty — auto-seeding sample ideas and creators...');
    const seedDatabase = require('../utils/seed');
    await seedDatabase();
  }
};

module.exports = { sequelize, User, Listing, Transaction, Review, CollaborationProject, CollaborationRequest, syncDB };
