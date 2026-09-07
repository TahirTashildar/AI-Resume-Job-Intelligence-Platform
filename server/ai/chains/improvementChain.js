const { runStructuredPrompt } = require('./runChain');
const { buildImprovementPrompt } = require('../prompts/resumeImprovement');
const { schemas } = require('../parsers/structuredOutput');

async function improveResume(resumeText, jobDescriptionText, jobAnalysisJson) {
  const prompt = buildImprovementPrompt(resumeText, jobDescriptionText, jobAnalysisJson);
  return runStructuredPrompt(prompt, schemas.improvementSchema);
}

module.exports = { improveResume };
