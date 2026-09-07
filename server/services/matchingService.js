const crypto = require('crypto');
const Application = require('../models/Application');
const resumeService = require('./resumeService');
const jobService = require('./jobService');
const aiService = require('../ai/services/aiService');
const { contentHash } = require('../utils/hash');

async function matchResumeToJob(userId, resumeId, jobId, { force = false } = {}) {
  const resume = await resumeService.getOwnedResume(userId, resumeId);
  const job = await jobService.getOwnedJob(userId, jobId);

  // Ensure we have a job analysis to ground the match in structured requirements
  const { analysis: jobAnalysis } = await jobService.analyzeJob(userId, jobId);

  const combinedHash = contentHash(
    crypto.createHash('sha256').update(`${resume.contentHash}:${job.contentHash}`).digest('hex')
  );

  if (!force) {
    const existing = await Application.findOne({ resumeId, jobId, contentHash: combinedHash });
    if (existing) return { application: existing, cached: true };
  }

  const result = await aiService.matchResumeToJob(resume.extractedText, jobAnalysis.toObject(), job.jobDescription);

  const application = await Application.findOneAndUpdate(
    { userId, resumeId, jobId },
    { ...result, userId, resumeId, jobId, contentHash: combinedHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  job.matchScore = result.matchScore;
  await job.save();

  return {
    application,
    cached: false,
    matchDetails: {
      categoryScores: result.categoryScores,
      experienceBreakdown: result.experienceBreakdown,
      partialMatches: result.partialMatches,
      missingSkillDetails: result.missingSkillDetails,
      criticalSkillGaps: result.criticalSkillGaps,
    },
  };
}

async function getUserApplications(userId) {
  return Application.find({ userId }).populate('jobId').populate('resumeId').sort({ createdAt: -1 });
}

module.exports = { matchResumeToJob, getUserApplications };
