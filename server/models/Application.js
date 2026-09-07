const mongoose = require('mongoose');

// A "Matching" result / application-level intelligence record linking a resume to a job
const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },

    matchScore: { type: Number, min: 0, max: 100 },
    skillMatchScore: { type: Number, min: 0, max: 100 },
    experienceMatchScore: { type: Number, min: 0, max: 100 },
    educationMatchScore: { type: Number, min: 0, max: 100 },
    keywordMatchScore: { type: Number, min: 0, max: 100 },

    matchedSkills: [String],
    missingSkills: [String],
    recommendedSkills: [String],
    matchedKeywords: [String],
    missingKeywords: [String],

    resumeImprovements: [String],
    interviewPrepAreas: [String],

    contentHash: { type: String, index: true },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, resumeId: 1, jobId: 1 });

module.exports = mongoose.model('Application', applicationSchema);
