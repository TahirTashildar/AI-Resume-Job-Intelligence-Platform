const fs = require('fs/promises');
const Resume = require('../models/Resume');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const ResumeVersion = require('../models/ResumeVersion');
const ApiError = require('../utils/ApiError');
const { contentHash } = require('../utils/hash');
const aiService = require('../ai/services/aiService');
const { extractText, detectFileType } = require('./documentParser');

async function createResumeFromUpload(userId, file, label) {
  const fileType = detectFileType(file.mimetype);
  const extractedText = await extractText(file.path, fileType);
  const hash = contentHash(extractedText);

  const existingCount = await Resume.countDocuments({ userId });

  const resume = await Resume.create({
    userId,
    filename: file.filename,
    originalFilename: file.originalname,
    label: label || 'General',
    extractedText,
    fileType,
    fileSize: file.size,
    resumeVersion: 1,
    contentHash: hash,
    isActive: existingCount === 0,
  });

  await ResumeVersion.create({
    userId,
    rootResumeId: resume._id,
    resumeId: resume._id,
    versionNumber: 1,
    versionLabel: label || 'General',
  });

  if (existingCount === 0) {
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { activeResume: resume._id });
  }

  return resume;
}

async function getUserResumes(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Resume.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resume.countDocuments({ userId }),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}

async function getOwnedResume(userId, resumeId) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw ApiError.notFound('Resume not found');
  if (resume.userId.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have access to this resume');
  }
  return resume;
}

async function deleteResume(userId, resumeId) {
  const resume = await getOwnedResume(userId, resumeId);
  await ResumeAnalysis.deleteMany({ resumeId: resume._id });
  await ResumeVersion.deleteMany({ resumeId: resume._id });
  await fs.unlink(`${__dirname}/../uploads/${resume.filename}`).catch(() => {});
  await resume.deleteOne();
  return true;
}

async function renameResume(userId, resumeId, label) {
  const resume = await getOwnedResume(userId, resumeId);
  resume.label = label;
  await resume.save();
  return resume;
}

async function setActiveResume(userId, resumeId) {
  const resume = await getOwnedResume(userId, resumeId);
  await Resume.updateMany({ userId }, { isActive: false });
  resume.isActive = true;
  await resume.save();
  const User = require('../models/User');
  await User.findByIdAndUpdate(userId, { activeResume: resume._id });
  return resume;
}

async function duplicateResumeVersion(userId, resumeId, newLabel) {
  const original = await getOwnedResume(userId, resumeId);
  const rootId = original.parentResumeId || original._id;

  const latestVersion = await Resume.find({
    $or: [{ _id: rootId }, { parentResumeId: rootId }],
  }).sort({ resumeVersion: -1 }).limit(1);
  const nextVersionNumber = (latestVersion[0]?.resumeVersion || original.resumeVersion) + 1;

  const clone = await Resume.create({
    userId,
    filename: original.filename,
    originalFilename: original.originalFilename,
    label: newLabel || `${original.label} v${nextVersionNumber}`,
    extractedText: original.extractedText,
    fileType: original.fileType,
    fileSize: original.fileSize,
    resumeVersion: nextVersionNumber,
    parentResumeId: rootId,
    contentHash: original.contentHash,
  });

  await ResumeVersion.create({
    userId,
    rootResumeId: rootId,
    resumeId: clone._id,
    versionNumber: nextVersionNumber,
    versionLabel: clone.label,
  });

  return clone;
}

/**
 * Analyzes a resume with AI, but skips calling the LLM again if the resume's
 * content hasn't changed since the last analysis (rate-limit protection).
 */
async function analyzeResume(userId, resumeId, { force = false } = {}) {
  const resume = await getOwnedResume(userId, resumeId);

  if (!force) {
    const existing = await ResumeAnalysis.findOne({ resumeId: resume._id, contentHash: resume.contentHash });
    if (existing) {
      return { analysis: existing, cached: true };
    }
  }

  const result = await aiService.analyzeResume(resume.extractedText);

  const analysis = await ResumeAnalysis.findOneAndUpdate(
    { resumeId: resume._id },
    { ...result, resumeId: resume._id, userId, contentHash: resume.contentHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  resume.analysis = analysis._id;
  resume.score = result.overallScore;
  await resume.save();

  return { analysis, cached: false };
}

module.exports = {
  createResumeFromUpload,
  getUserResumes,
  getOwnedResume,
  deleteResume,
  renameResume,
  setActiveResume,
  duplicateResumeVersion,
  analyzeResume,
};
