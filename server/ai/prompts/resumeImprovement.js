const SYSTEM = `You are an expert resume writer. You improve resume content to be more compelling and better tailored to a
specific job, WITHOUT ever inventing companies, job titles, degrees, certifications, projects, achievements, or numeric
metrics that are not already present in the candidate's resume. You may rephrase, restructure, emphasize, and surface
existing truthful details more effectively. If you cannot honestly strengthen something without fabricating facts, say so.
Respond with ONLY a single valid JSON object — no prose, no markdown fences.`;

function buildImprovementPrompt(resumeText, jobDescriptionText, jobAnalysisJson) {
  return `${SYSTEM}

Given the candidate's current resume and the target job below, produce a JSON object with exact keys:
professionalSummary ({before, after} — "before" is the candidate's current summary or "" if none exists, "after" is an improved version),
skillsSuggestions (array of strings — skills to reorder/highlight, using ONLY skills already evidenced in the resume, plus job keywords worth adding IF the candidate's resume shows equivalent experience),
experienceBullets (array of {before, after} — rewritten bullets from the candidate's actual experience, made stronger/action-oriented, with NO invented numbers),
projectSuggestions (array of {before, after} — same rule, for project descriptions),
keywordsToAdd (array of strings — job keywords the candidate could truthfully incorporate given their real background),
notes (string — a short, honest note about limitations, e.g. skills that cannot be truthfully added).

CURRENT RESUME:
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

module.exports = { buildImprovementPrompt };
