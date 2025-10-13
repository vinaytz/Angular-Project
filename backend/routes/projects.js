const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get projects with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, userId, category, skills, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by user (either client or freelancer)
    if (userId) {
      query.$or = [
        { clientId: userId },
        { freelancerId: userId }
      ];
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Project.countDocuments(query);
    
    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }),
  body('description').trim().isLength({ min: 10 }),
  body('price').isNumeric().isFloat({ min: 1 }),
  body('deadline').isISO8601(),
  body('skills').isArray({ min: 1 }),
  body('category').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = new Project({
      ...req.body,
      clientId: req.userId
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the client
    if (project.clientId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedFields = ['title', 'description', 'price', 'deadline', 'skills', 'priority'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Apply to project
router.post('/:id/apply', auth, [
  body('proposal').trim().isLength({ min: 10 }),
  body('bidAmount').optional().isNumeric(),
  body('deliveryTime').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if already applied
    const existingProposal = project.proposals.find(
      p => p.freelancerId.toString() === req.userId
    );
    if (existingProposal) {
      return res.status(400).json({ message: 'Already applied to this project' });
    }

    project.proposals.push({
      freelancerId: req.userId,
      proposal: req.body.proposal,
      bidAmount: req.body.bidAmount || project.price,
      deliveryTime: req.body.deliveryTime || 7
    });

    await project.save();
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply to project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept freelancer
router.post('/:id/accept', auth, [
  body('freelancerId').isMongoId()
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the client
    if (project.clientId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.freelancerId = req.body.freelancerId;
    project.status = 'active';
    await project.save();

    // Update freelancer stats
    await User.findByIdAndUpdate(req.body.freelancerId, {
      $inc: { totalProjects: 1 }
    });

    res.json(project);
  } catch (error) {
    console.error('Accept freelancer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update progress
router.patch('/:id/progress', auth, [
  body('progress').isNumeric().isFloat({ min: 0, max: 100 })
], async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the freelancer
    if (project.freelancerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.progress = req.body.progress;
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete project
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the freelancer
    if (project.freelancerId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    project.status = 'completed';
    project.progress = 100;
    project.completedAt = new Date();
    await project.save();

    // Update freelancer stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { 
        completedProjects: 1,
        totalEarnings: project.price,
        monthlyEarnings: project.price
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Complete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const stats = await Project.aggregate([
      {
        $match: {
          $or: [
            { clientId: mongoose.Types.ObjectId(userId) },
            { freelancerId: mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    const user = await User.findById(userId);
    
    res.json({
      activeProjects: stats.find(s => s._id === 'active')?.count || 0,
      completedProjects: user.completedProjects || 0,
      totalEarnings: user.totalEarnings || 0,
      monthlyEarnings: user.monthlyEarnings || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;