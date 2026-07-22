const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const protect = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Submit a review for a completed job
// @access  Private (Customer Only)
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Only customers can review services' });
  }

  const { jobId, rating, comment } = req.body;

  if (!jobId || !rating) {
    return res.status(400).json({ message: 'Job ID and rating are required' });
  }

  try {
    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure this customer requested this job
    if (job.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to review this job' });
    }

    // Ensure the job is completed
    if (job.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed jobs can be reviewed' });
    }

    // Ensure review doesn't already exist for this job
    const existingReview = await Review.findOne({ job: jobId });
    if (existingReview) {
      return res.status(400).json({ message: 'A review has already been submitted for this job' });
    }

    // Create the review
    const review = await Review.create({
      customer: req.user.id,
      worker: job.worker,
      job: jobId,
      rating: Number(rating),
      comment
    });

    // Link the review to the Job
    job.review = review._id;
    await job.save();

    // Recalculate average rating and number of reviews for the worker
    const reviews = await Review.find({ worker: job.worker });
    const numReviews = reviews.length;
    const averageRating = parseFloat(
      (reviews.reduce((acc, r) => acc + r.rating, 0) / numReviews).toFixed(1)
    );

    const worker = await Worker.findByIdAndUpdate(job.worker, {
      averageRating,
      numReviews
    });

    if (worker) {
      await Notification.create({
        user: worker.user,
        sender: req.user.id,
        message: `A customer left you a ${rating}-star review for your '${job.skill}' job.`,
        type: 'review',
        relatedId: review._id
      });
    }

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/reviews/worker/:workerId
// @desc    Get reviews for a specific worker
// @access  Public
router.get('/worker/:workerId', async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
