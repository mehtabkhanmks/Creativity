const { User, Listing } = require('../models');

// GET /api/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{
        model: Listing,
        as: 'listings',
        where: { status: 'active', visibilityTier: ['public', 'teaser'] },
        required: false,
        order: [['createdAt', 'DESC']],
      }],
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, skills, location, website, role, avatar } = req.body;
    await req.user.update({ name, bio, skills, location, website, role, avatar });
    res.json({ success: true, user: req.user });
  } catch (err) { next(err); }
};

// GET /api/users (search users/collaborators)
exports.searchUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 12 } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { bio: { [Op.like]: `%${search}%` } },
        { skills: { [Op.like]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id','name','avatar','bio','skills','role','rating','ratingCount','isVerified','location'],
      limit: parseInt(limit),
      offset,
      order: [['rating', 'DESC']],
    });
    res.json({
      success: true,
      users: rows,
      pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / parseInt(limit)) },
    });
  } catch (err) { next(err); }
};
