const express = require('express');
const router = express.Router();
const { getUser, updateProfile, searchUsers } = require('../controllers/usersController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

router.get('/', searchUsers);
router.get('/:id', getUser);
router.put('/profile', protect, updateProfile);

// Avatar upload
router.post('/avatar', protect, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

module.exports = router;
