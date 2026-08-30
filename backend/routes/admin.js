const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Worker = require('../models/Worker');
const Job = require('../models/Job');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');

// All routes in this file require Admin access
router.use(protect, admin);

// @route   GET /api/admin/stats
// @desc    Get system overview statistics
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalWorkers,
      totalJobs,
      completedJobs,
      pendingJobs,
      acceptedJobs,
      totalReviews,
      openDisputes,
      resolvedDisputes
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'worker' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'completed' }),
      Job.countDocuments({ status: 'pending' }),
      Job.countDocuments({ status: 'accepted' }),
      Review.countDocuments(),
      Dispute.countDocuments({ status: { $in: ['open', 'under_review'] } }),
      Dispute.countDocuments({ status: { $in: ['resolved', 'dismissed'] } })
    ]);

    res.json({
      totalUsers,
      totalCustomers,
      totalWorkers,
      totalJobs,
      completedJobs,
      pendingJobs,
      acceptedJobs,
      totalReviews,
      openDisputes,
      resolvedDisputes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with their worker profile details (if worker)
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const workers = await Worker.find();

    const workerMap = {};
    workers.forEach(w => {
      workerMap[w.user.toString()] = w;
    });

    const enrichedUsers = users.map(u => ({
      ...u.toObject(),
      workerProfile: workerMap[u._id.toString()] || null
    }));

    res.json(enrichedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Update user role (e.g. promote to admin)
// @access  Admin
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'worker', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: `Role updated to ${role}`, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user and associated profiles
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Worker.findOneAndDelete({ user: req.params.id });

    res.json({ message: 'User account removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/admin/jobs
// @desc    Get all jobs across the platform
// @access  Admin
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('customer', 'name email')
      .populate({
        path: 'worker',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('review')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
