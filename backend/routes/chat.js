const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Message = require('../models/Message');
const protect = require('../middleware/auth');
const { getIO } = require('../config/socket');

// @route   GET /api/chat/:jobId
// @desc    Get all messages for a specific job
// @access  Private
router.get('/:jobId', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('worker');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const isCustomer = job.customer.toString() === req.user.id;
    const isWorker = job.worker && job.worker.user.toString() === req.user.id;

    if (!isCustomer && !isWorker) {
      return res.status(403).json({ message: 'Not authorized to view messages for this job' });
    }

    const messages = await Message.find({ job: req.params.jobId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/chat/:jobId
// @desc    Send a message for a job
// @access  Private
router.post('/:jobId', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const job = await Job.findById(req.params.jobId).populate('worker');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    let receiverId;
    if (job.customer.toString() === req.user.id) {
      receiverId = job.worker.user;
    } else if (job.worker && job.worker.user.toString() === req.user.id) {
      receiverId = job.customer;
    } else {
      return res.status(403).json({ message: 'Not authorized to send messages for this job' });
    }

    const message = await Message.create({
      job: job._id,
      sender: req.user.id,
      receiver: receiverId,
      text: text.trim()
    });

    const populatedMsg = await Message.findById(message._id)
      .populate('sender', 'name email role');

    // Emit live socket event to job chat room and to receiver's user room
    const io = getIO();
    if (io) {
      io.to(`job_${job._id}`).emit('receive_message', populatedMsg);
      io.to(`user_${receiverId}`).emit('chat_notification', {
        jobId: job._id,
        message: populatedMsg
      });
    }

    res.status(201).json(populatedMsg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
