const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const resumeService = require('../services/resumeService');
const jobService = require('../services/jobService');
const aiService = require('../ai/services/aiService');

const generateInterviewPrep = asyncHandler(async (req, res) => {
  const { resumeId, jobId } = req.body;
  if (!resumeId || !jobId) throw ApiError.badRequest('resumeId and jobId are required');

  const resume = await resumeService.getOwnedResume(req.user._id, resumeId);
  const job = await jobService.getOwnedJob(req.user._id, jobId);
  const { analysis: jobAnalysis } = await jobService.analyzeJob(req.user._id, jobId);

  const result = await aiService.generateInterviewQuestions(resume.extractedText, job.jobDescription, jobAnalysis.toObject());
  sendSuccess(res, 200, { result });
});

module.exports = { generateInterviewPrep };
