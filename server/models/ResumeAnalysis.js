const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contentHash: { type: String, index: true },

    contactInfo: {
      name: String, email: String, phone: String,
      linkedin: String, github: String, portfolio: String,
    },
    career: {
      currentRole: String,
      targetRole: String,
      experienceLevel: String,
    },
    skills: {
      technical: [String],
      soft: [String],
      tools: [String],
      frameworks: [String],
      languages: [String],
    },
    experience: [
      {
        company: String,
        role: String,
        responsibilities: [String],
        achievements: [String],
        quantifiedImpact: [String],
      },
    ],
    education: [
      { degree: String, university: String, graduationYear: String },
    ],
    projects: [
      { name: String, technologies: [String], description: String, impact: String },
    ],
    certifications: [String],

    overallScore: { type: Number, min: 0, max: 100 },
    atsScore: { type: Number, min: 0, max: 100 },
    skillsScore: { type: Number, min: 0, max: 100 },
    experienceScore: { type: Number, min: 0, max: 100 },
    projectScore: { type: Number, min: 0, max: 100 },
    educationScore: { type: Number, min: 0, max: 100 },
    impactScore: { type: Number, min: 0, max: 100 },
    formattingScore: { type: Number, min: 0, max: 100 },
    keywordScore: { type: Number, min: 0, max: 100 },
    summaryScore: { type: Number, min: 0, max: 100 },

    strengths: [String],
    weaknesses: [String],
    missingKeywords: [String],
    atsIssues: [
      { problem: String, recommendation: String },
    ],
    recommendations: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
