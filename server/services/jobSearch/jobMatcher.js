const ALIASES = [
  ['react', 'react js', 'reactjs'], ['node', 'node js', 'nodejs'],
  ['postgres', 'postgresql'], ['rest api', 'rest apis'],
  ['jwt authentication', 'authentication using jwt'],
];

const COMMON_JOB_SKILLS = [
  'docker', 'kubernetes', 'redis', 'aws', 'azure', 'gcp', 'terraform', 'jenkins',
  'graphql', 'typescript', 'javascript', 'python', 'java', 'react', 'node.js',
  'mongodb', 'postgresql', 'sql', 'rest api', 'fastapi', 'spring boot', 'git',
];

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[./+_-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function equivalent(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  return Boolean(left && right && (left === right || left.includes(right) || right.includes(left)
    || ALIASES.some((group) => group.includes(left) && group.includes(right))));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function profileTerms(profile) {
  return unique([
    ...(profile.skills || []), ...(profile.languages || []), ...(profile.frameworks || []),
    ...(profile.libraries || []), ...(profile.databases || []), ...(profile.developerTools || []),
    ...(profile.cloudSkills || []), ...(profile.aiMlSkills || []),
  ]);
}

function matchJob(job, profile, role, preferences = {}) {
  const text = normalize(`${job.title} ${job.description} ${(job.requiredSkills || job.skills || []).join(' ')} ${(job.requirements || []).join(' ')}`);
  const terms = profileTerms(profile);
  const jobSkills = unique(COMMON_JOB_SKILLS.filter((skill) => text.includes(normalize(skill))));
  const matchedSkills = terms.filter((term) => jobSkills.some((skill) => equivalent(skill, term)));
  const partialSkills = terms.filter((term) => !matchedSkills.includes(term) && normalize(job.title).includes(normalize(term))).slice(0, 5);
  const missingSkills = jobSkills.filter((skill) => !matchedSkills.some((term) => equivalent(skill, term))).slice(0, 6);

  const skillsScore = jobSkills.length ? (matchedSkills.length / jobSkills.length) * 100 : (terms.length ? 35 : 0);
  const roleScore = role && (text.includes(normalize(role)) || normalize(role).split(' ').some((word) => word.length > 3 && text.includes(word))) ? 100 : 35;
  const experienceScore = profile.experienceLevel === 'Fresher' || !job.experienceLevel
    ? 80
    : text.includes(normalize(profile.experienceLevel)) ? 100 : 50;
  const projectScore = profile.projects?.length && matchedSkills.length ? 85 : 45;
  const educationScore = profile.education?.length && /degree|bachelor|master|education|certif/i.test(text) ? 85 : 50;
  const locationText = normalize(`${job.location} ${job.workplaceType}`);
  const locationScore = preferences.location && (locationText.includes(normalize(preferences.location)) || job.workplaceType === preferences.remotePreference) ? 100 : 55;
  let matchScore = Math.round(
    skillsScore * 0.4 + roleScore * 0.25 + experienceScore * 0.15
    + projectScore * 0.1 + educationScore * 0.05 + locationScore * 0.05
  );
  if (jobSkills.length === 0 || job.description.length < 120) matchScore = Math.min(matchScore, 49);
  const matchReasons = [
    matchedSkills.length ? `Strong match with ${matchedSkills.slice(0, 3).join(', ')}` : '',
    roleScore >= 80 ? `Role aligns with ${role}` : '',
    projectScore >= 80 ? 'Resume projects demonstrate relevant experience' : '',
    experienceScore >= 80 ? 'Experience level is suitable for this opportunity' : '',
  ].filter(Boolean).slice(0, 4);

  return {
    matchScore: Math.max(0, Math.min(100, matchScore)),
    matchLabel: matchScore >= 85 ? 'Excellent Match' : matchScore >= 70 ? 'Strong Match' : matchScore >= 50 ? 'Good Match' : matchScore >= 30 ? 'Partial Match' : 'Low Match',
    matchedSkills: unique(matchedSkills).slice(0, 8),
    partialMatches: unique(partialSkills),
    partialSkills: unique(partialSkills),
    missingSkills,
    matchReasons,
  };
}

module.exports = { matchJob };
