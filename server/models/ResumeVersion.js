const mongoose = require('mongoose');

// Tracks the version lineage / metadata for a family of resumes derived from one another
const resumeVersionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rootResumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    versionNumber: { type: Number, required: true },
    versionLabel: { type: String, default: 'General' },
  },
  { timestamps: true }
);

resumeVersionSchema.index({ rootResumeId: 1, versionNumber: 1 });

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
