const SYSTEM = `You are an evidence-based technical recruiter. Compare only the supplied resume and job description.
Never invent experience or skills. Normalize equivalent terms before comparing them. An explicit equivalent is a
STRONG_MATCH; related evidence from projects or adjacent tools is a PARTIAL_MATCH; use MISSING only when there is
no meaningful evidence. Return only valid JSON matching the requested shape.`;

function buildMatchingPrompt(resumeText, jobAnalysisJson, jobDescriptionText) {
  return `${SYSTEM}

First extract resume evidence into skills, technologies/tools, formal jobs/internships/freelance work,
projects, education, and certifications. Then compare it with the job requirements.

Return JSON with these keys:
matchScore, skillMatchScore, experienceMatchScore, educationMatchScore, keywordMatchScore (integers 0-100),
categoryScores ({requiredSkills, preferredSkills, relevantExperience, projectRelevance, educationMatch,
keywordMatch, resumeQuality}: integers 0-100),
experienceBreakdown ({formalExperiencePresent, internshipPresent, freelancePresent, projectExperiencePresent}: booleans),
matchedSkills (array of {skill, status:"STRONG_MATCH", resumeEvidence[], jobRequirement, explanation}),
partialMatches (array of {skill, status:"PARTIAL_MATCH", resumeEvidence[], jobRequirement, explanation}),
missingSkills (array of {skill, status:"MISSING", priority:"REQUIRED"|"PREFERRED"|"NICE_TO_HAVE", jobRequirement, reason}),
criticalSkillGaps (array of strings), recommendedSkills (array of strings),
matchedKeywords (array of strings), missingKeywords (array of strings),
resumeImprovements (array of specific, truthful suggestions), interviewPrepAreas (array of strings).

Matching rules:
- JWT Authentication matches JWT-based authentication strongly; React matches React.js; Postgres matches PostgreSQL.
- REST APIs plus database design/operations is a PARTIAL_MATCH for CRUD operations, not MISSING.
- Render or Railway is a PARTIAL_MATCH for cloud deployment, not MISSING.
- Do not treat project experience as formal work experience. Project relevance can offset, but cannot become,
  formal experience. A fresher must never receive 100 for professional experience without evidence.
- Every missing skill must come directly from requiredSkills, preferredSkills, or a clearly stated job requirement.
- Never place the same normalized skill in matchedSkills/partialMatches and missingSkills.
- Interview prep must label existing skills separately from gaps, such as "EXISTING SKILL TO PREPARE: React.js"
  and "SKILL GAP TO LEARN: Docker".
- Score categories from evidence, not intuition. The backend calculates the final matchScore.
- Never fabricate metrics, employers, certifications, or achievements.

CANDIDATE RESUME TEXT:
"""
${resumeText}
"""

STRUCTURED JOB REQUIREMENTS:
${JSON.stringify(jobAnalysisJson, null, 2)}

ORIGINAL JOB DESCRIPTION:
"""
${jobDescriptionText}
"""

Return ONLY the JSON object.`;
}

module.exports = { buildMatchingPrompt };
