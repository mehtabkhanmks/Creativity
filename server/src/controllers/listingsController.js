const { Op } = require('sequelize');
const { Listing, User, Transaction } = require('../models');
const { generateFingerprint } = require('../utils/fingerprint');

// GET /api/listings
exports.getListings = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, category, mediaType, type, minPrice, maxPrice,
      search, sort = 'createdAt', order = 'DESC', featured, verificationStatus
    } = req.query;

    const where = { status: 'active' };
    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }
    if (category) {
      if (category.includes(',')) {
        where.category = { [Op.in]: category.split(',').map(c => c.trim()) };
      } else {
        where.category = category;
      }
    }
    if (mediaType) {
      if (mediaType.includes(',')) {
        where.mediaType = { [Op.in]: mediaType.split(',').map(m => m.trim()) };
      } else {
        where.mediaType = mediaType;
      }
    }
    if (featured === 'true') where.isFeatured = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    if (type) {
      where.transactionTypes = { [Op.like]: `%"${type}"%` };
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { tags: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await Listing.findAndCountAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar', 'isVerified', 'rating'] }],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      listings: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)), limit: parseInt(limit) },
    });
  } catch (err) { next(err); }
};

// GET /api/listings/my
exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.findAll({
      where: { creatorId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, listings });
  } catch (err) { next(err); }
};

// GET /api/listings/:id
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'avatar', 'bio', 'isVerified', 'rating', 'ratingCount', 'location'] },
      ],
    });
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });

    // Increment view count (non-owner)
    if (!req.user || req.user.id !== listing.creatorId) {
      await listing.increment('viewCount');
    }

    res.json({ success: true, listing });
  } catch (err) { next(err); }
};

// POST /api/listings
exports.createListing = async (req, res, next) => {
  try {
    const {
      title, summary, description, category, tags, visibilityTier,
      transactionTypes, price, licenseTerms, fundingTarget, ndaRequired, coverImage,
      mediaType, verificationStatus
    } = req.body;

    if (!title || price === undefined || price === null || isNaN(parseFloat(price)))
      return res.status(400).json({ success: false, message: 'Content Name and valid Price are required' });

    let creatorId = req.user?.id;
    if (!creatorId) {
      const defaultUser = await User.findOne({ where: { role: 'creator' } });
      creatorId = defaultUser ? defaultUser.id : (await User.create({ name: 'Elena Hayes', email: 'elena@example.com', passwordHash: 'guest', role: 'creator' })).id;
    }

    const { fingerprint, fingerprintedAt } = generateFingerprint(`${title}::${description || ''}::${creatorId}`);

    const listing = await Listing.create({
      creatorId,
      title,
      summary: summary || (description ? description.slice(0, 120) + '...' : title),
      description: description || title,
      category: category || 'business',
      mediaType: mediaType || 'document',
      verificationStatus: verificationStatus || 'verified',
      status: 'active',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      visibilityTier: visibilityTier || 'public',
      transactionTypes: Array.isArray(transactionTypes) ? transactionTypes : ['buy'],
      price: parseFloat(price) || 0,
      licenseTerms: licenseTerms || 'Commercial & Adaptation License included.',
      fundingTarget: parseFloat(fundingTarget) || 0,
      fingerprint, fingerprintedAt,
      ndaRequired: ndaRequired === true || ndaRequired === 'true',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    });

    const full = await Listing.findByPk(listing.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar', 'isVerified'] }],
    });
    res.status(201).json({ success: true, listing: full });
  } catch (err) { next(err); }
};

// PUT /api/listings/:id
exports.updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.creatorId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const fields = ['title','summary','description','category','tags','visibilityTier',
      'transactionTypes','price','licenseTerms','fundingTarget','ndaRequired','coverImage',
      'status','verificationStatus','mediaType','isFeatured'];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    await listing.update(updates);
    res.json({ success: true, listing });
  } catch (err) { next(err); }
};

// DELETE /api/listings/:id
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.creatorId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await listing.update({ status: 'archived' });
    res.json({ success: true, message: 'Listing archived successfully' });
  } catch (err) { next(err); }
};

// GET /api/listings/stats (dashboard analytics)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const listings = await Listing.findAll({ where: { creatorId: req.user.id } });
    const totalViews = listings.reduce((a, l) => a + l.viewCount, 0);
    const totalInquiries = listings.reduce((a, l) => a + l.inquiryCount, 0);

    const transactions = await Transaction.findAll({ where: { sellerId: req.user.id, status: 'completed' } });
    const totalEarnings = transactions.reduce((a, t) => a + (t.sellerAmount || 0), 0);

    res.json({
      success: true,
      stats: {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'active').length,
        totalViews,
        totalInquiries,
        totalEarnings,
        totalSales: transactions.length,
      },
    });
  } catch (err) { next(err); }
};
