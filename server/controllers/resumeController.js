const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/apiResponse');
const resumeService = require('../services/resumeService');
const aiService = require('../ai/services/aiService');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded');
  const resume = await resumeService.createResumeFromUpload(req.user._id, req.file, req.body.label);
  sendSuccess(res, 201, { resume });
});

const listResumes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const result = await resumeService.getUserResumes(req.user._id, { page, limit });
  sendSuccess(res, 200, result);
});

const getResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.getOwnedResume(req.user._id, req.params.id);
  const analysis = resume.analysis ? await ResumeAnalysis.findById(resume.analysis) : null;
  sendSuccess(res, 200, { resume, analysis });
});

const deleteResume = asyncHandler(async (req, res) => {
  await resumeService.deleteResume(req.user._id, req.params.id);
  sendSuccess(res, 200, { message: 'Resume deleted' });
});

const renameResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.renameResume(req.user._id, req.params.id, req.body.label);
  sendSuccess(res, 200, { resume });
});

const setActiveResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.setActiveResume(req.user._id, req.params.id);
  sendSuccess(res, 200, { resume });
});

const duplicateResume = asyncHandler(async (req, res) => {
  const resume = await resumeService.duplicateResumeVersion(req.user._id, req.params.id, req.body.label);
  sendSuccess(res, 201, { resume });
});

const analyzeResume = asyncHandler(async (req, res) => {
  const force = req.query.force === 'true';
  const { analysis, cached } = await resumeService.analyzeResume(req.user._id, req.params.id, { force });
  sendSuccess(res, 200, { analysis, cached });
});

const improveResume = asyncHandler(async (req, res) => {
  const { jobDescription } = req.body;
  if (!jobDescription || jobDescription.trim().length < 50) {
    throw ApiError.badRequest('Please provide a full job description (at least 50 characters)');
  }
  const resume = await resumeService.getOwnedResume(req.user._id, req.params.id);
  const jobAnalysis = await aiService.analyzeJobDescription(jobDescription);
  const improvement = await aiService.improveResume(resume.extractedText, jobDescription, jobAnalysis);
  sendSuccess(res, 200, { improvement });
});

const improveBullet = asyncHandler(async (req, res) => {
  const { bullet, style } = req.body;
  if (!bullet || bullet.trim().length < 5) {
    throw ApiError.badRequest('Please provide a resume bullet to improve');
  }
  const result = await aiService.improveResumeBullet(bullet, style || 'professional');
  sendSuccess(res, 200, { result });
});

module.exports = {
  uploadResume, listResumes, getResume, deleteResume, renameResume,
  setActiveResume, duplicateResume, analyzeResume, improveResume, improveBullet,
};
