const express = require('express');
const router = express.Router();
const Dispute = require('../models/Dispute');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const protect = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getIO } = require('../config/socket');

// @route   POST /api/disputes
// @desc    Raise a dispute on a job
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { jobId, reason, description } = req.body;
    if (!jobId || !reason || !description) {
      return res.status(400).json({ message: 'Job ID, reason, and description are required' });
    }

    const job = await Job.findById(jobId).populate('worker');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let againstUserId;
    if (job.customer.toString() === req.user.id) {
      againstUserId = job.worker.user;
    } else if (job.worker && job.worker.user.toString() === req.user.id) {
      againstUserId = job.customer;
    } else {
      return res.status(403).json({ message: 'You are not authorized to raise a dispute for this job' });
    }

    const existing = await Dispute.findOne({
      job: jobId,
      raisedBy: req.user.id,
      status: { $in: ['open', 'under_review'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'A dispute is already active for this job' });
    }

    const dispute = await Dispute.create({
      job: jobId,
      raisedBy: req.user.id,
      against: againstUserId,
      reason,
      description
    });

    // Notify the other party
    const notification = await Notification.create({
      user: againstUserId,
      sender: req.user.id,
      message: `A dispute has been raised regarding job '${job.skill}': ${reason}.`,
      type: 'dispute_alert',
      relatedId: dispute._id
    });

    const io = getIO();
    if (io) {
      const populatedNotif = await Notification.findById(notification._id).populate('sender', 'name');
      io.to(`user_${againstUserId}`).emit('notification', populatedNotif);
    }

    const populatedDispute = await Dispute.findById(dispute._id)
      .populate('job')
      .populate('raisedBy', 'name email role')
      .populate('against', 'name email role');

    res.status(201).json(populatedDispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/disputes/my
// @desc    Get disputes for current user
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ raisedBy: req.user.id }, { against: req.user.id }]
    })
      .populate('job')
      .populate('raisedBy', 'name email role')
      .populate('against', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/disputes
// @desc    Get all disputes (Admin only)
// @access  Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const disputes = await Dispute.find(query)
      .populate('job')
      .populate('raisedBy', 'name email role')
      .populate('against', 'name email role')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/disputes/:id
// @desc    Update dispute status and resolution notes (Admin only)
// @access  Admin
router.patch('/:id', protect, admin, async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    const dispute = await Dispute.findById(req.params.id)
      .populate('job')
      .populate('raisedBy', 'name email')
      .populate('against', 'name email');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    if (status) dispute.status = status;
    if (resolutionNotes !== undefined) dispute.resolutionNotes = resolutionNotes;
    if (status === 'resolved' || status === 'dismissed') {
      dispute.resolvedBy = req.user.id;
    }

    await dispute.save();

    try {
      const notifyUsers = [dispute.raisedBy?._id, dispute.against?._id].filter(Boolean);
      const io = getIO();

      for (const userId of notifyUsers) {
        const notif = await Notification.create({
          user: userId,
          sender: req.user.id,
          message: `Dispute for '${dispute.job?.skill || 'Job'}' has been marked as ${status.toUpperCase()}.`,
          type: 'dispute_resolution',
          relatedId: dispute._id
        });

        if (io) {
          const popNotif = await Notification.findById(notif._id).populate('sender', 'name');
          io.to(`user_${userId}`).emit('notification', popNotif);
        }
      }
    } catch (notifErr) {
      console.warn('Dispute notification warning:', notifErr.message);
    }

    res.json(dispute);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
