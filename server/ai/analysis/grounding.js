const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

const aliases = [
  ['jwt authentication', 'authentication and authorization using jwt', 'jwt based authentication'],
  ['react', 'react js'],
  ['postgres', 'postgresql'],
  ['rest api', 'rest apis'],
  ['cloud deployment', 'application deployment', 'deployment'],
];

function normalizeSkill(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[./+_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function equivalent(left, right) {
  const a = normalizeSkill(left);
  const b = normalizeSkill(right);
  if (!a || !b) return false;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  return aliases.some((group) => group.includes(a) && group.includes(b));
}

function hasResumeEvidence(skill, resumeText, evidence = []) {
  return evidence.some((item) => item.trim())
    || normalizeSkill(resumeText).includes(normalizeSkill(skill));
}

function jobSkillSet(jobAnalysis) {
  return [
    ...(jobAnalysis?.requiredSkills || []).map((skill) => ({ skill, priority: 'REQUIRED' })),
    ...(jobAnalysis?.preferredSkills || []).map((skill) => ({ skill, priority: 'PREFERRED' })),
    ...(jobAnalysis?.tools || []).map((skill) => ({ skill, priority: 'PREFERRED' })),
    ...(jobAnalysis?.technologies || []).map((skill) => ({ skill, priority: 'PREFERRED' })),
    ...(jobAnalysis?.keywords || []).map((skill) => ({ skill, priority: 'PREFERRED' })),
  ];
}

function inferPartialMatch(skill, resumeText, jobRequirement) {
  const resume = normalizeSkill(resumeText);
  const normalized = normalizeSkill(skill);
  if (normalized === 'crud operations'
    && /\brest apis?\b/.test(resume)
    && /(mongodb|postgresql|postgres|database design)/.test(resume)) {
    return {
      skill,
      status: 'PARTIAL_MATCH',
      resumeEvidence: ['REST APIs', 'database technologies or design'],
      jobRequirement,
      explanation: 'The resume demonstrates backend and database operations related to CRUD functionality, although CRUD is not explicitly stated.',
    };
  }
  if (normalized === 'cloud deployment'
    && (resume.includes('render') || resume.includes('railway'))) {
    return {
      skill,
      status: 'PARTIAL_MATCH',
      resumeEvidence: ['Render', 'Railway'].filter((platform) => resume.includes(platform.toLowerCase())),
      jobRequirement,
      explanation: 'The resume demonstrates application deployment experience but does not mention major cloud infrastructure platforms.',
    };
  }
  return null;
}

function calculateMatchScore(categories, experience) {
  const c = categories || {};
  const skill = clamp((clamp(c.requiredSkills) * 0.75) + (clamp(c.preferredSkills) * 0.25));
  const formal = experience?.formalExperiencePresent
    || experience?.internshipPresent
    || experience?.freelancePresent;

  if (!formal) {
    return clamp(
      skill * 0.30
      + clamp(c.projectRelevance) * 0.25
      + clamp(c.relevantExperience) * 0.10
      + clamp(c.educationMatch) * 0.15
      + clamp(c.keywordMatch) * 0.10
      + clamp(c.resumeQuality) * 0.10
    );
  }

  return clamp(
    skill * 0.30
    + clamp(c.relevantExperience) * 0.20
    + clamp(c.projectRelevance) * 0.15
    + clamp(c.preferredSkills) * 0.10
    + clamp(c.educationMatch) * 0.10
    + clamp(c.keywordMatch) * 0.10
    + clamp(c.resumeQuality) * 0.05
  );
}

function normalizeMatchingResult(result, resumeText, jobAnalysis) {
  const matched = (result.matchedSkills || []).map((item) =>
    typeof item === 'string' ? { skill: item, resumeEvidence: [], jobRequirement: '', explanation: '' } : item
  );
  const partial = (result.partialMatches || []).map((item) =>
    typeof item === 'string' ? { skill: item, resumeEvidence: [], jobRequirement: '', explanation: '' } : item
  );
  const missing = (result.missingSkills || []).map((item) =>
    typeof item === 'string' ? { skill: item, priority: 'PREFERRED', jobRequirement: '', reason: '' } : item
  );
  const jobSkills = jobSkillSet(jobAnalysis);

  const supportedMissing = missing.filter((item) => {
    const itemSkill = item.skill || '';
    const alreadyPresent = [...matched, ...partial].some((match) => equivalent(match.skill, itemSkill))
      || hasResumeEvidence(itemSkill, resumeText);
    const isJobRequirement = jobSkills.some((requirement) => equivalent(requirement.skill, itemSkill));
    if (!alreadyPresent && isJobRequirement) {
      const inferred = inferPartialMatch(itemSkill, resumeText, item.jobRequirement);
      if (inferred) {
        partial.push(inferred);
        return false;
      }
    }
    return !alreadyPresent && isJobRequirement;
  });

  const categories = result.categoryScores || {};
  const experience = result.experienceBreakdown || {};
  const hasFormalExperience = experience.formalExperiencePresent
    || experience.internshipPresent
    || experience.freelancePresent;
  const normalizedCategories = {
    requiredSkills: clamp(categories.requiredSkills || result.skillMatchScore),
    preferredSkills: clamp(categories.preferredSkills),
    relevantExperience: hasFormalExperience
      ? clamp(categories.relevantExperience || result.experienceMatchScore)
      : 0,
    projectRelevance: clamp(categories.projectRelevance),
    educationMatch: clamp(categories.educationMatch || result.educationMatchScore),
    keywordMatch: clamp(categories.keywordMatch || result.keywordMatchScore),
    resumeQuality: clamp(categories.resumeQuality),
  };
  return {
    ...result,
    matchScore: calculateMatchScore(normalizedCategories, experience),
    skillMatchScore: clamp(
      (normalizedCategories.requiredSkills * 0.75) + (normalizedCategories.preferredSkills * 0.25)
    ),
    experienceMatchScore: normalizedCategories.relevantExperience,
    educationMatchScore: normalizedCategories.educationMatch,
    keywordMatchScore: normalizedCategories.keywordMatch,
    matchedSkills: matched.map((item) => item.skill),
    missingSkills: supportedMissing.map((item) => item.skill),
    missingSkillDetails: supportedMissing,
    recommendedSkills: (result.recommendedSkills || []).filter((skill) =>
      supportedMissing.some((item) => equivalent(item.skill, skill))
    ),
    missingKeywords: (result.missingKeywords || []).filter((keyword) =>
      jobSkills.some((requirement) => equivalent(requirement.skill, keyword))
    ),
    categoryScores: normalizedCategories,
    experienceBreakdown: experience,
    partialMatches: partial,
    criticalSkillGaps: (result.criticalSkillGaps || []).filter((skill) =>
      supportedMissing.some((item) => equivalent(item.skill, skill))
    ),
  };
}

module.exports = { normalizeMatchingResult, calculateMatchScore, equivalent };
