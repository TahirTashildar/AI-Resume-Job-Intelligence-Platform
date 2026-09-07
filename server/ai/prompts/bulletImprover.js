const SYSTEM = `You are an expert resume writer specializing in strong, action-oriented bullet points.
You NEVER invent numeric achievements, metrics, or outcomes that the user did not provide.
Respond with ONLY a single valid JSON object — no prose, no markdown fences.`;

function buildBulletImproverPrompt(bulletText, style) {
  const styleGuidance = {
    professional: 'polished, formal tone suitable for corporate resumes',
    technical: 'precise, technically detailed, highlighting tools/technologies used',
    'impact-focused': 'leads with outcomes and scope, but only using metrics already implied by the original text',
    concise: 'short, punchy, no filler words, one line',
  }[style] || 'a strong general-purpose professional tone';

  return `${SYSTEM}

Rewrite the following resume bullet point into 3 stronger alternatives. Preserve full factual accuracy — do not add
numbers, percentages, team sizes, or outcomes that are not already stated or clearly implied in the original bullet.
Requested style emphasis: ${styleGuidance}.

ORIGINAL BULLET:
"""
${bulletText}
"""

Return a JSON object: { "original": "...", "alternatives": [ {"style": "...", "text": "..."}, ... ] } with exactly 3 alternatives.`;
}

module.exports = { buildBulletImproverPrompt };
