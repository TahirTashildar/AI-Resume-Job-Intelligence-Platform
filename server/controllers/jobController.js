const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const jobService = require('../services/jobService');
const JobAnalysis = require('../models/JobAnalysis');

const createJob = asyncHandler(async (req, res) => {
  const { company, position, jobDescription } = req.body;
  if (!company || !position || !jobDescription) {
    throw ApiError.badRequest('company, position, and jobDescription are required');
  }
  const job = await jobService.createJob(req.user._id, req.body);
  sendSuccess(res, 201, { job });
});

const listJobs = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await jobService.getUserJobs(req.user._id, {
    status, page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 50,
  });
  sendSuccess(res, 200, result);
});

const getJob = asyncHandler(async (req, res) => {
  const job = await jobService.getOwnedJob(req.user._id, req.params.id);
  const analysis = job.analysis ? await JobAnalysis.findById(job.analysis) : null;
  sendSuccess(res, 200, { job, analysis });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.user._id, req.params.id, req.body);
  sendSuccess(res, 200, { job });
});

const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.user._id, req.params.id);
  sendSuccess(res, 200, { message: 'Job deleted' });
});

const analyzeJob = asyncHandler(async (req, res) => {
  const force = req.query.force === 'true';
  const { analysis, cached } = await jobService.analyzeJob(req.user._id, req.params.id, { force });
  sendSuccess(res, 200, { analysis, cached });
});

// Standalone job-description analysis, not tied to a saved job (used by the "paste a JD" page)
const analyzeJobDescriptionText = asyncHandler(async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription || jobDescription.trim().length < 50) {
    throw ApiError.badRequest('Please provide a full job description (at least 50 characters)');
  }
  const analysis = await jobService.analyzeJobDescriptionText(jobDescription);
  sendSuccess(res, 200, { analysis });
});

module.exports = { createJob, listJobs, getJob, updateJob, deleteJob, analyzeJob, analyzeJobDescriptionText };
