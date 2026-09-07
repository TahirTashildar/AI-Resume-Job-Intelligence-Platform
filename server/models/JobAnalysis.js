const mongoose = require('mongoose');

const jobAnalysisSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentHash: { type: String, index: true },

    jobTitle: String,
    company: String,
    requiredSkills: [String],
    preferredSkills: [String],
    experienceRequirements: [String],
    educationRequirements: [String],
    responsibilities: [String],
    tools: [String],
    technologies: [String],
    keywords: [String],
    softSkills: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobAnalysis', jobAnalysisSchema);
