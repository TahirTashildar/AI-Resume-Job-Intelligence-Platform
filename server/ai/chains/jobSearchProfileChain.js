const { runStructuredPrompt } = require('./runChain');
const { buildJobSearchProfilePrompt } = require('../prompts/jobSearchProfile');
const { schemas } = require('../parsers/structuredOutput');

async function extractJobSearchProfile(resumeText) {
  return runStructuredPrompt(
    buildJobSearchProfilePrompt(resumeText),
    schemas.jobSearchProfileSchema
  );
}

module.exports = { extractJobSearchProfile };
