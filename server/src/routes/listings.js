const express = require('express');
const router = express.Router();
const {
  getListings, getMyListings, getListing, createListing,
  updateListing, deleteListing, getDashboardStats
} = require('../controllers/listingsController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getListings);
router.get('/my', protect, getMyListings);
router.get('/stats', protect, getDashboardStats);
router.get('/:id', optionalAuth, getListing);
router.post('/', optionalAuth, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
