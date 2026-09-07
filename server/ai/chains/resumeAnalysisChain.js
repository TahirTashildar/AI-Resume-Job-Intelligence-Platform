const { runStructuredPrompt } = require('./runChain');
const { buildResumeAnalysisPrompt } = require('../prompts/resumeAnalysis');
const { schemas } = require('../parsers/structuredOutput');

async function analyzeResume(resumeText) {
  const prompt = buildResumeAnalysisPrompt(resumeText);
  return runStructuredPrompt(prompt, schemas.resumeAnalysisSchema);
}

module.exports = { analyzeResume };
