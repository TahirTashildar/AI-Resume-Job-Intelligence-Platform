const { runStructuredPrompt } = require('./runChain');
const { buildBulletImproverPrompt } = require('../prompts/bulletImprover');
const { schemas } = require('../parsers/structuredOutput');

async function improveBullet(bulletText, style) {
  const prompt = buildBulletImproverPrompt(bulletText, style);
  return runStructuredPrompt(prompt, schemas.bulletImproverSchema);
}

module.exports = { improveBullet };
