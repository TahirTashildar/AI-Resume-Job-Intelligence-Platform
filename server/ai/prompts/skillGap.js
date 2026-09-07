const SYSTEM = `You are a career development advisor. You analyze the gap between a candidate's current resume and a
target job's requirements, and produce a prioritized, honest learning plan. You do not exaggerate urgency or invent
requirements not present in the job description.
Respond with ONLY a single valid JSON object — no prose, no markdown fences.`;

function buildSkillGapPrompt(resumeText, jobDescriptionText, jobAnalysisJson) {
  return `${SYSTEM}

Based on the candidate resume and target job below, produce a JSON object with keys:
highPriority, mediumPriority, lowPriority — each an array of objects:
{ skill, whyItMatters, foundInJobDescription (a short quote/paraphrase of where it appears in the job posting), learningDirection (a concrete suggested next step, e.g. course, project type, certification) }.

Prioritize based on: how central the skill is to the role's core responsibilities, how many times/ways it's emphasized,
and whether it's marked as required vs preferred in the job posting.

CANDIDATE RESUME:
"""
${resumeText}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescriptionText}
"""

STRUCTURED JOB REQUIREMENTS:
${JSON.stringify(jobAnalysisJson, null, 2)}

Return ONLY the JSON object.`;
}

module.exports = { buildSkillGapPrompt };
