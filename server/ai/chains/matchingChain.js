const { runStructuredPrompt } = require('./runChain');
const { buildMatchingPrompt } = require('../prompts/resumeMatching');
const { schemas } = require('../parsers/structuredOutput');
const { normalizeMatchingResult } = require('../analysis/grounding');

async function matchResumeToJob(resumeText, jobAnalysisJson, jobDescriptionText) {
  const prompt = buildMatchingPrompt(resumeText, jobAnalysisJson, jobDescriptionText);
  const result = await runStructuredPrompt(prompt, schemas.matchingSchema);
  return normalizeMatchingResult(result, resumeText, jobAnalysisJson);
}

module.exports = { matchResumeToJob };
