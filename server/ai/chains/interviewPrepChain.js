const { runStructuredPrompt } = require('./runChain');
const { buildInterviewPrepPrompt } = require('../prompts/interviewPrep');
const { schemas } = require('../parsers/structuredOutput');

async function generateInterviewPrep(resumeText, jobDescriptionText, jobAnalysisJson) {
  const prompt = buildInterviewPrepPrompt(resumeText, jobDescriptionText, jobAnalysisJson);
  return runStructuredPrompt(prompt, schemas.interviewPrepSchema);
}

module.exports = { generateInterviewPrep };
