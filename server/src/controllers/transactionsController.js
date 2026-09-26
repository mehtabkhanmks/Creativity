const { Transaction, Listing, User } = require('../models');

const PLATFORM_FEE_RATE = 0.10; // 10%

// POST /api/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const { listingId, type, amount, notes } = req.body;
    if (!listingId || !type)
      return res.status(400).json({ success: false, message: 'listingId and type are required' });

    const listing = await Listing.findByPk(listingId);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found' });
    if (listing.creatorId === req.user.id)
      return res.status(400).json({ success: false, message: 'Cannot transact on your own listing' });

    const txAmount = parseFloat(amount) || listing.price || 0;
    const platformFee = parseFloat((txAmount * PLATFORM_FEE_RATE).toFixed(2));
    const sellerAmount = parseFloat((txAmount - platformFee).toFixed(2));

    const tx = await Transaction.create({
      listingId,
      buyerId: req.user.id,
      sellerId: listing.creatorId,
      type,
      amount: txAmount,
      platformFee,
      sellerAmount,
      notes: notes || '',
      status: txAmount > 0 ? 'escrow' : 'completed',
    });

    // Increment inquiry count on listing
    await listing.increment('inquiryCount');

    // For support transactions, mark completed immediately
    if (type === 'support' || type === 'contact') {
      await tx.update({ status: 'completed', completedAt: new Date() });
    }

    const full = await Transaction.findByPk(tx.id, {
      include: [
        { model: Listing, as: 'listing', attributes: ['id', 'title', 'category', 'coverImage'] },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'avatar'] },
      ],
    });

    res.status(201).json({ success: true, transaction: full });
  } catch (err) { next(err); }
};

// GET /api/transactions
exports.getMyTransactions = async (req, res, next) => {
  try {
    const { role = 'buyer' } = req.query;
    const where = role === 'seller' ? { sellerId: req.user.id } : { buyerId: req.user.id };

    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: Listing, as: 'listing', attributes: ['id', 'title', 'category', 'coverImage', 'price'] },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'avatar'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, transactions });
  } catch (err) { next(err); }
};

// GET /api/transactions/:id
exports.getTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Listing, as: 'listing' },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'avatar'] },
      ],
    });
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (tx.buyerId !== req.user.id && tx.sellerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, transaction: tx });
  } catch (err) { next(err); }
};

// PUT /api/transactions/:id/complete
exports.completeTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findByPk(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (tx.sellerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Only seller can complete transaction' });
    await tx.update({ status: 'completed', completedAt: new Date() });

    // Update seller earnings
    const seller = await User.findByPk(tx.sellerId);
    await seller.update({ totalEarnings: (seller.totalEarnings || 0) + tx.sellerAmount });

    res.json({ success: true, transaction: tx });
  } catch (err) { next(err); }
};
