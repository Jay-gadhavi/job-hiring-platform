const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [{ type: String }],
  city: { type: String, required: true },
  experience: { type: Number, default: 0 },
  phone: { type: String, required: true },
  available: { type: Boolean, default: true },
  bio: { type: String },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);