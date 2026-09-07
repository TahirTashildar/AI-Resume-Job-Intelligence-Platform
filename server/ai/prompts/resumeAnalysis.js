const SYSTEM = `You are an expert resume reviewer and ATS specialist.
Use only evidence in the supplied resume. Never invent skills, experience, internships, achievements,
metrics, companies, degrees, certifications, or career goals. Treat formal work experience separately
from projects, coursework, and personal practice. Return only valid JSON matching the requested shape.`;

function buildResumeAnalysisPrompt(resumeText) {
  return `${SYSTEM}

Analyze the resume and return JSON with these exact keys:
contactInfo (name, email, phone, linkedin, github, portfolio),
career (currentRole, targetRole, experienceLevel),
skills (technical, soft, tools, frameworks, languages — each an array of strings),
experience (array of {company, role, responsibilities[], achievements[], quantifiedImpact[]}),
education (array of {degree, university, graduationYear}),
projects (array of {name, technologies[], description, impact}),
certifications (array of strings),
overallScore, atsScore, skillsScore, experienceScore, projectScore, educationScore, impactScore,
formattingScore, keywordScore, summaryScore (integers 0-100),
strengths, weaknesses, missingKeywords, atsIssues (array of {problem, recommendation}), recommendations.

Rules:
- Extract skills, tools, technologies, formal jobs/internships/freelance work, projects, education,
  and certifications only when the resume provides evidence.
- Do not treat projects, coursework, or personal practice as formal work experience.
- missingKeywords MUST be [] because no job description is provided. Use recommendations for
  relevant "potential skills to develop" or "areas for improvement", never random missing skills.
- Recommendations must be specific, truthful, and actionable. Never suggest fake achievements,
  work experience, credentials, or metrics.
- Scores must reflect this resume's actual content and formatting, not generic role expectations.
- Return only one valid JSON object, with no markdown or commentary.

RESUME TEXT:
"""
${resumeText}
"""

Return ONLY the JSON object.`;
}

module.exports = { buildResumeAnalysisPrompt };
