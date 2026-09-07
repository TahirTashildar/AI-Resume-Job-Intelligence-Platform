const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const jobSearchService = require('../services/jobSearch/jobSearchService');
const jobService = require('../services/jobService');

const profile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('Please upload a resume before searching for jobs.');
  const result = await jobSearchService.createProfileFromUpload(req.file);
  sendSuccess(res, 200, result);
});

const search = asyncHandler(async (req, res) => {
  const { profile: candidateProfile, preferences } = req.body;
  if (!candidateProfile || !preferences) throw ApiError.badRequest('A processed resume profile and search preferences are required');
  const jobs = await jobSearchService.searchJobs({ profile: candidateProfile, preferences });
  sendSuccess(res, 200, { jobs });
});

const save = asyncHandler(async (req, res) => {
  const { job } = req.body;
  if (!job || !job.title || !job.sourceUrl) {
    throw ApiError.badRequest('A job title and source URL are required');
  }
  const savedJob = await jobService.createJob(req.user._id, {
    company: job.company || 'Company not listed',
    position: job.title,
    jobUrl: job.applyUrl || job.sourceUrl,
    location: job.location || '',
    jobDescription: job.description || `${job.title} opportunity found via ${job.source || 'web search'}.`,
    matchScore: job.matchScore,
  });
  sendSuccess(res, 201, { job: savedJob });
});

module.exports = { profile, search, save };
