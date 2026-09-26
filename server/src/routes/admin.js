const express = require('express');
const router = express.Router();
const { Listing, User, Transaction, CollaborationProject, CollaborationRequest } = require('../models');

// GET Admin stats overview
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalListings = await Listing.count();
    const verifiedListings = await Listing.count({ where: { verificationStatus: 'verified' } });
    const reviewingListings = await Listing.count({ where: { verificationStatus: 'reviewing' } });
    const totalProjects = await CollaborationProject.count();
    const totalTransactions = await Transaction.count();
    
    // Sum total volume
    const listings = await Listing.findAll({ attributes: ['price'] });
    const totalVolume = listings.reduce((sum, item) => sum + (item.price || 0), 0);

    res.json({
      success: true,
      data: {
        totalVolume,
        totalUsers,
        totalListings,
        verifiedListings,
        reviewingListings,
        totalProjects,
        totalTransactions,
        platformHealth: 'Optimal',
        uptime: '99.98%'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all assets for moderation
router.get('/assets', async (req, res) => {
  try {
    const listings = await Listing.findAll({
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email', 'avatar', 'isVerified'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE asset verification status (verified, reviewing, archived) & isFeatured
router.patch('/assets/:id/status', async (req, res) => {
  try {
    const { verificationStatus, isFeatured, status } = req.body;
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Asset not found' });
    
    if (verificationStatus) listing.verificationStatus = verificationStatus;
    if (typeof isFeatured === 'boolean') listing.isFeatured = isFeatured;
    if (status) listing.status = status;
    
    await listing.save();
    res.json({ success: true, message: 'Asset updated successfully', data: listing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE asset (admin purge)
router.delete('/assets/:id', async (req, res) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Asset not found' });
    await listing.destroy();
    res.json({ success: true, message: 'Asset removed by admin' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all users for admin management
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE user role or verification status
router.patch('/users/:id', async (req, res) => {
  try {
    const { role, isVerified, isIdentityVerified } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (typeof isIdentityVerified === 'boolean') user.isIdentityVerified = isIdentityVerified;

    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET platform activity log
router.get('/activity', async (req, res) => {
  try {
    const recentListings = await Listing.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['name'] }]
    });
    const recentProjects = await CollaborationProject.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'creator', attributes: ['name'] }]
    });

    const activities = [
      ...recentListings.map(l => ({
        id: `listing-${l.id}`,
        type: 'New Asset Upload',
        title: l.title,
        user: l.creator?.name || 'Creator',
        price: l.price,
        time: l.createdAt,
        status: l.verificationStatus
      })),
      ...recentProjects.map(p => ({
        id: `collab-${p.id}`,
        type: 'New Project Listing',
        title: p.title,
        user: p.creator?.name || 'Creator',
        time: p.createdAt,
        status: p.status
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
