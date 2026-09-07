const SYSTEM = `You extract a factual candidate profile for job search from a resume.
Use only evidence in the resume. Never invent skills, work experience, projects, education, or target roles.
Separate formal work, internships, freelance work, and projects. Return only valid JSON.`;

function buildJobSearchProfilePrompt(resumeText) {
  return `${SYSTEM}

Return an object with exactly these keys:
skills, languages, frameworks, libraries, databases, developerTools, cloudSkills, aiMlSkills,
projects, education, workExperience, internshipExperience, experienceLevel, targetRoles, keywords.
All list values are arrays of strings. projects may contain concise project names. education,
workExperience, and internshipExperience must contain only facts explicitly present. experienceLevel
must be one of "Fresher", "Entry Level", "Experienced", or "Unknown". targetRoles should contain
at most five roles supported by the resume's actual profile. Do not add generic roles without evidence.

RESUME:
"""
${resumeText}
"""

Return ONLY the JSON object.`;
}

module.exports = { buildJobSearchProfilePrompt };
