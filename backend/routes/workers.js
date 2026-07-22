const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const protect = require('../middleware/auth');

router.post('/profile', protect, async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ message: 'Only workers can manage worker profiles' });
  }
  const { skills, city, experience, phone, bio } = req.body;
  try {
    const existing = await Worker.findOne({ user: req.user.id });
    if (existing) return res.status(400).json({ message: 'Profile already exists' });

    const worker = await Worker.create({
      user: req.user.id,
      skills, city, experience, phone, bio
    });
    res.status(201).json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  const { skill, city } = req.query;
  try {
    let query = { available: true };
    if (skill) query.skills = { $regex: skill, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };

    const workers = await Worker.find(query).populate('user', 'name email');
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my-profile', protect, async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ message: 'Only workers can retrieve their worker profile' });
  }
  try {
    const worker = await Worker.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!worker) return res.status(404).json({ message: 'Profile not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate('user', 'name email');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ message: 'Only workers can manage worker profiles' });
  }
  try {
    const worker = await Worker.findOne({ user: req.user.id });

    if (!worker) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    worker.skills = req.body.skills !== undefined ? req.body.skills : worker.skills;
    worker.city = req.body.city !== undefined ? req.body.city : worker.city;
    worker.experience = req.body.experience !== undefined ? req.body.experience : worker.experience;
    worker.phone = req.body.phone !== undefined ? req.body.phone : worker.phone;
    worker.bio = req.body.bio !== undefined ? req.body.bio : worker.bio;
    worker.available = req.body.available !== undefined ? req.body.available : worker.available;

    await worker.save();

    res.json({ message: 'Profile updated', worker });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;