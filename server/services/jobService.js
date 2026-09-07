const Job = require('../models/Job');
const JobAnalysis = require('../models/JobAnalysis');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const { contentHash } = require('../utils/hash');
const aiService = require('../ai/services/aiService');

async function createJob(userId, payload) {
  if (payload.jobUrl) {
    const existing = await Job.findOne({ userId, jobUrl: payload.jobUrl });
    if (existing) return existing;
  }
  const hash = contentHash(payload.jobDescription);
  const job = await Job.create({ ...payload, userId, contentHash: hash });
  return job;
}

async function getUserJobs(userId, { status, page = 1, limit = 50 } = {}) {
  const query = { userId };
  if (status) query.status = status;
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(query),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}

async function getOwnedJob(userId, jobId) {
  const job = await Job.findById(jobId);
  if (!job) throw ApiError.notFound('Job not found');
  if (job.userId.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have access to this job');
  }
  return job;
}

async function updateJob(userId, jobId, updates) {
  const job = await getOwnedJob(userId, jobId);
  const editableFields = [
    'company', 'position', 'jobUrl', 'location', 'salary',
    'status', 'notes', 'appliedDate', 'interviewDate',
  ];
  for (const field of editableFields) {
    if (updates[field] !== undefined) job[field] = updates[field];
  }
  if (updates.jobDescription && updates.jobDescription !== job.jobDescription) {
    job.jobDescription = updates.jobDescription;
    job.contentHash = contentHash(updates.jobDescription);
    job.analysis = null; // force re-analysis next time since content changed
  }
  await job.save();
  return job;
}

async function deleteJob(userId, jobId) {
  const job = await getOwnedJob(userId, jobId);
  await JobAnalysis.deleteMany({ jobId: job._id });
  await Application.deleteMany({ jobId: job._id });
  await job.deleteOne();
  return true;
}

/** Analyzes a job description, standalone (not tied to a saved Job doc). */
async function analyzeJobDescriptionText(jobDescriptionText) {
  return aiService.analyzeJobDescription(jobDescriptionText);
}

/** Analyzes (or returns cached analysis for) a saved job. */
async function analyzeJob(userId, jobId, { force = false } = {}) {
  const job = await getOwnedJob(userId, jobId);

  if (!force) {
    const existing = await JobAnalysis.findOne({ jobId: job._id, contentHash: job.contentHash });
    if (existing) return { analysis: existing, cached: true };
  }

  const result = await aiService.analyzeJobDescription(job.jobDescription);
  const analysis = await JobAnalysis.findOneAndUpdate(
    { jobId: job._id },
    { ...result, jobId: job._id, userId, contentHash: job.contentHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  job.analysis = analysis._id;
  await job.save();

  return { analysis, cached: false };
}

module.exports = {
  createJob,
  getUserJobs,
  getOwnedJob,
  updateJob,
  deleteJob,
  analyzeJobDescriptionText,
  analyzeJob,
};
