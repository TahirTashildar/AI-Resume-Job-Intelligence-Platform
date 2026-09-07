const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    jobUrl: { type: String, trim: true },
    location: { type: String, trim: true },
    salary: { type: String, trim: true },
    jobDescription: { type: String, required: true },
    status: {
      type: String,
      enum: ['saved', 'applied', 'assessment', 'interview', 'offer', 'rejected'],
      default: 'saved',
    },
    notes: { type: String, default: '' },
    appliedDate: { type: Date, default: null },
    interviewDate: { type: Date, default: null },
    analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'JobAnalysis', default: null },
    matchScore: { type: Number, min: 0, max: 100, default: null },
    contentHash: { type: String, index: true },
  },
  { timestamps: true }
);

jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
