const express = require('express');
const router = express.Router();
const { CollaborationProject, CollaborationRequest, User } = require('../models');
const { protect } = require('../middleware/auth');

// GET all collaboration projects
router.get('/projects', async (req, res) => {
  try {
    const { search, skill } = req.query;
    const where = {};
    const projects = await CollaborationProject.findAll({
      where,
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar', 'isVerified'] }],
      order: [['createdAt', 'DESC']]
    });

    let filtered = projects;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.roleNeeded.toLowerCase().includes(q)
      );
    }
    if (skill) {
      filtered = filtered.filter(p => 
        p.requiredSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// CREATE new project
router.post('/projects', protect, async (req, res) => {
  try {
    const { title, description, roleNeeded, projectGoal, requiredSkills, category } = req.body;
    const project = await CollaborationProject.create({
      creatorId: req.user.id,
      title,
      description,
      roleNeeded: roleNeeded || 'Looking for Collaborator',
      projectGoal: projectGoal || '',
      requiredSkills: requiredSkills || [],
      category: category || 'General'
    });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// TOGGLE bookmark project
router.post('/projects/:id/bookmark', async (req, res) => {
  try {
    const project = await CollaborationProject.findByPk(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    project.isSaved = !project.isSaved;
    await project.save();
    res.json({ success: true, isSaved: project.isSaved, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET partnership inbox requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await CollaborationRequest.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SEND partnership request / connect proposal
router.post('/requests', async (req, res) => {
  try {
    const { projectId, senderName, senderAvatar, senderRole, message } = req.body;
    const request = await CollaborationRequest.create({
      projectId,
      senderName: senderName || 'Partner Candidate',
      senderAvatar: senderAvatar || '',
      senderRole: senderRole || 'Collaborator',
      message,
      timeAgo: 'Just now',
      status: 'pending'
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE request status (accept / decline)
router.patch('/requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await CollaborationRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    request.status = status;
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
