const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  skill: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed'], default: 'pending' },
  review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);