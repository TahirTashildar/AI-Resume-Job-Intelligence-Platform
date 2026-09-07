const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const matchingService = require('../services/matchingService');
const aiService = require('../ai/services/aiService');

const analyzeMatch = asyncHandler(async (req, res) => {
  const { resumeId, jobId } = req.body;
  if (!resumeId || !jobId) throw ApiError.badRequest('resumeId and jobId are required');
  const force = req.query.force === 'true';
  const { application, cached, matchDetails } = await matchingService.matchResumeToJob(
    req.user._id,
    resumeId,
    jobId,
    { force }
  );
  sendSuccess(res, 200, { application, cached, matchDetails });
});

const listMyMatches = asyncHandler(async (req, res) => {
  const applications = await matchingService.getUserApplications(req.user._id);
  sendSuccess(res, 200, { applications });
});

const skillGap = asyncHandler(async (req, res) => {
  const resumeService = require('../services/resumeService');
  const jobService = require('../services/jobService');
  const { resumeId, jobId } = req.body;
  if (!resumeId || !jobId) throw ApiError.badRequest('resumeId and jobId are required');

  const resume = await resumeService.getOwnedResume(req.user._id, resumeId);
  const job = await jobService.getOwnedJob(req.user._id, jobId);
  const { analysis: jobAnalysis } = await jobService.analyzeJob(req.user._id, jobId);

  const result = await aiService.analyzeSkillGap(resume.extractedText, job.jobDescription, jobAnalysis.toObject());
  sendSuccess(res, 200, { result });
});

module.exports = { analyzeMatch, listMyMatches, skillGap };
