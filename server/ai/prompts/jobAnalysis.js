const SYSTEM = `You are an expert technical recruiter and job-description analyst.
You extract structured, factual information from job postings without embellishment.
Respond with ONLY a single valid JSON object — no prose, no markdown fences.`;

function buildJobAnalysisPrompt(jobDescriptionText) {
  return `${SYSTEM}

Extract structured information from the following job description and return a JSON object with these exact keys:
jobTitle, company (best guess, empty string if truly unknown),
requiredSkills (array of strings), preferredSkills (array of strings),
experienceRequirements (array of strings, e.g. "3+ years backend development"),
educationRequirements (array of strings),
responsibilities (array of strings),
tools (array of strings), technologies (array of strings),
keywords (array of strings — important ATS/resume keywords a candidate should mirror),
softSkills (array of strings).

Distinguish clearly between REQUIRED and PREFERRED/nice-to-have skills based on the language used in the posting.

JOB DESCRIPTION:
"""
${jobDescriptionText}
"""

Return ONLY the JSON object.`;
}

module.exports = { buildJobAnalysisPrompt };
