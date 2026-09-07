const { runStructuredPrompt } = require('./runChain');
const { buildSkillGapPrompt } = require('../prompts/skillGap');
const { schemas } = require('../parsers/structuredOutput');

async function analyzeSkillGap(resumeText, jobDescriptionText, jobAnalysisJson) {
  const prompt = buildSkillGapPrompt(resumeText, jobDescriptionText, jobAnalysisJson);
  return runStructuredPrompt(prompt, schemas.skillGapSchema);
}

module.exports = { analyzeSkillGap };
