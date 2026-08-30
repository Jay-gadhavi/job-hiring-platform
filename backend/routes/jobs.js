const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const protect = require('../middleware/auth');
const { getIO } = require('../config/socket');



router.post('/request', protect, async (req, res) => {
  try {
    const { workerId, skill, description } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can request jobs' });
    }

    if (req.user.id === worker.user.toString()) {
      return res.status(400).json({ message: "You cannot request yourself" });
    }

    const job = await Job.create({
      customer: req.user.id,
      worker: workerId,
      skill,
      description
    });

    // Create Notification for the worker
    const notification = await Notification.create({
      user: worker.user,
      sender: req.user.id,
      message: `You have received a new job request for '${skill}'.`,
      type: 'job_request',
      relatedId: job._id
    });

    // Emit real-time socket events
    const io = getIO();
    if (io) {
      const populatedNotif = await Notification.findById(notification._id).populate('sender', 'name');
      io.to(`user_${worker.user}`).emit('notification', populatedNotif);
      io.to(`user_${worker.user}`).emit('job_updated', { type: 'new_job', job });
    }

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/worker', protect, async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user.id });
    if (!worker) return res.status(404).json({ message: 'Worker profile not found' });

    const jobs = await Job.find({ worker: worker._id })
      .populate('customer', 'name email');

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/customer', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can view their job requests' });
    }

    const jobs = await Job.find({ customer: req.user.id })
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


router.patch('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const worker = await Worker.findOne({ user: req.user.id });
    if (!worker || job.worker.toString() !== worker._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    job.status = status;
    await job.save();

    // Create Notification for the customer
    const notification = await Notification.create({
      user: job.customer,
      sender: req.user.id,
      message: `Your job request for '${job.skill}' has been ${status}.`,
      type: 'job_status',
      relatedId: job._id
    });

    // Emit real-time socket events
    const io = getIO();
    if (io) {
      const populatedNotif = await Notification.findById(notification._id).populate('sender', 'name');
      io.to(`user_${job.customer}`).emit('notification', populatedNotif);
      io.to(`user_${job.customer}`).emit('job_updated', { type: 'status_changed', job });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;