const { runStructuredPrompt } = require('./runChain');
const { buildJobAnalysisPrompt } = require('../prompts/jobAnalysis');
const { schemas } = require('../parsers/structuredOutput');

async function analyzeJobDescription(jobDescriptionText) {
  const prompt = buildJobAnalysisPrompt(jobDescriptionText);
  return runStructuredPrompt(prompt, schemas.jobAnalysisSchema);
}

module.exports = { analyzeJobDescription };
