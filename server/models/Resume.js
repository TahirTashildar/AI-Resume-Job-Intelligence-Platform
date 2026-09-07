const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    filename: { type: String, required: true },
    originalFilename: { type: String, required: true },
    label: { type: String, default: 'General' }, // e.g. "Frontend", "Target Company"
    extractedText: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    fileSize: { type: Number, required: true },
    resumeVersion: { type: Number, default: 1 },
    parentResumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    contentHash: { type: String, index: true }, // used to avoid re-analyzing unchanged content
    analysis: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeAnalysis', default: null },
    score: { type: Number, min: 0, max: 100, default: null },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', resumeSchema);
