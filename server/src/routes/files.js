const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// POST /api/files/upload — multi-file upload for listing attachments
router.post('/upload', protect, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ success: false, message: 'No files uploaded' });

  const files = req.files.map(f => ({
    filename: f.originalname,
    url: `/uploads/${f.filename}`,
    mimetype: f.mimetype,
    size: f.size,
  }));

  res.json({ success: true, files });
});

// POST /api/files/cover — single cover image
router.post('/cover', protect, upload.single('cover'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

module.exports = router;
