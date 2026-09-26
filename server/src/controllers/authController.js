const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendVerificationCode, verifyCode } = require('../utils/emailService');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'narrative_engine_secret_key_2026', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/send-code (Send 6-digit Gmail code)
exports.sendCode = async (req, res, next) => {
  try {
    const { email, role, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid Gmail or email address is required' });
    }

    const result = await sendVerificationCode({
      email,
      role: role || 'creator',
      name: name || ''
    });

    res.json(result);
  } catch (err) { next(err); }
};

// POST /api/auth/verify-code (Verify Gmail 6-digit code & Login / Register)
exports.verifyCodeAndLogin = async (req, res, next) => {
  try {
    const { email, code, role, name } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit code are required' });
    }

    const verificationResult = verifyCode({ email, code });
    if (!verificationResult.valid) {
      return res.status(400).json({ success: false, message: verificationResult.message });
    }

    const assignedRole = role || verificationResult.data?.role || 'creator';
    const userName = name || verificationResult.data?.name || email.split('@')[0];

    // Find or create user
    let user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      const defaultPasswordHash = await bcrypt.hash('verified_' + Date.now(), 10);
      user = await User.create({
        name: userName,
        email: email.toLowerCase().trim(),
        passwordHash: defaultPasswordHash,
        role: assignedRole,
        isVerified: true,
        isIdentityVerified: true,
        avatar: assignedRole === 'creator' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : assignedRole === 'collaborator'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : assignedRole === 'admin'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      });
    } else {
      // If logging in as admin or updating role
      if (assignedRole && assignedRole !== user.role && (assignedRole === 'admin' || user.role !== 'admin')) {
        user.role = assignedRole;
      }
      user.isVerified = true;
      user.isIdentityVerified = true;
      await user.save();
    }

    const token = signToken(user.id);
    const { passwordHash: _, ...userData } = user.toJSON();

    res.json({
      success: true,
      message: `Verified successfully as ${user.role.toUpperCase()}`,
      token,
      user: userData
    });
  } catch (err) { next(err); }
};

// POST /api/auth/register (Standard password fallback)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const existing = await User.scope('withPassword').findOne({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role: role || 'creator', isVerified: true });

    const token = signToken(user.id);
    res.status(201).json({ success: true, token, user });
  } catch (err) { next(err); }
};

// POST /api/auth/login (Standard password fallback)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user.id);
    const { passwordHash: _, ...userData } = user.toJSON();
    res.json({ success: true, token, user: userData });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// PUT /api/auth/me
exports.updateMe = async (req, res, next) => {
  try {
    const { name, bio, skills, location, website, role } = req.body;
    await req.user.update({ name, bio, skills, location, website, role });
    res.json({ success: true, user: req.user });
  } catch (err) { next(err); }
};

// POST /api/auth/google (Google One-Click Authentication)
exports.googleLogin = async (req, res, next) => {
  try {
    const { email, name, avatar, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      const defaultPasswordHash = await bcrypt.hash('google_auth_' + Date.now(), 10);
      user = await User.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        passwordHash: defaultPasswordHash,
        role: role || (normalizedEmail.includes('admin') ? 'admin' : 'creator'),
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isVerified: true,
        isIdentityVerified: true,
      });
    } else {
      if (role && role !== user.role && (role === 'admin' || user.role !== 'admin')) {
        user.role = role;
      }
      user.isVerified = true;
      user.isIdentityVerified = true;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    const token = signToken(user.id);
    const { passwordHash: _, ...userData } = user.toJSON();

    res.json({
      success: true,
      message: `Signed in with Google as ${user.name}`,
      token,
      user: userData
    });
  } catch (err) { next(err); }
};

