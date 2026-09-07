const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('../utils/ApiError');

/**
 * Extracts plain text from an uploaded PDF or DOCX file on disk.
 * Handles malformed/empty documents gracefully.
 */
async function extractText(filePath, fileType) {
  const buffer = await fs.readFile(filePath);

  let text = '';
  try {
    if (fileType === 'pdf') {
      const result = await pdfParse(buffer);
      text = result.text || '';
    } else if (fileType === 'docx') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } else {
      throw ApiError.badRequest('Unsupported file type for text extraction');
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.badRequest(
      'We could not read this file. It may be corrupted, password-protected, or empty.'
    );
  }

  const cleaned = text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();

  if (!cleaned || cleaned.length < 30) {
    throw ApiError.badRequest(
      'This document appears to be empty or contains too little readable text to analyze.'
    );
  }

  return cleaned;
}

function detectFileType(mimetype) {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  throw ApiError.badRequest('Only PDF and DOCX files are supported');
}

module.exports = { extractText, detectFileType };
