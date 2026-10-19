const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    stage: { type: String, enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'], default: 'Applied' },
    interviewDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);