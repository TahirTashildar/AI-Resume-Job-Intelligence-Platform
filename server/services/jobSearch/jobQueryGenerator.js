function unique(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function generateJobQueries(profile, preferences) {
  const roles = unique(preferences.roles?.length ? preferences.roles : profile.targetRoles).slice(0, 4);
  const location = preferences.location || 'India';
  const experience = preferences.experienceLevel || profile.experienceLevel;
  const jobType = preferences.jobType && preferences.jobType !== 'Any' ? preferences.jobType : '';
  const remote = preferences.remotePreference && preferences.remotePreference !== 'Any'
    ? preferences.remotePreference
    : '';
  const skills = unique([
    ...(profile.skills || []),
    ...(profile.frameworks || []),
    ...(profile.languages || []),
    ...(profile.databases || []),
  ]).slice(0, 3);
  const skillPhrase = skills.slice(0, 4).join(' ');
  const suffix = [skillPhrase, experience, jobType, location, 'posted recently hiring'].filter(Boolean).join(' ');
  const queries = roles.map((role) => `"${role}" ${suffix}`);
  if (skills.length) queries.push(`${skills.slice(0, 3).join(' ')} developer ${experience} ${location} posted this week`);
  if (remote === 'Remote') queries.push(`Remote ${roles[0] || 'software'} ${skillPhrase} jobs posted recently`);
  const primaryRole = roles[0] || 'software developer';
  queries.push(
    `"${primaryRole}" jobs hiring now ${location}`,
    `"${primaryRole}" careers hiring ${location}`,
    `"${primaryRole}" jobs site:indeed.com ${location}`,
    `"${primaryRole}" jobs site:wellfound.com ${location}`,
  );
  if (!queries.length) queries.push(`software developer ${suffix}`);
  if (queries.length < 3) {
    const role = roles[0] || 'software developer';
    queries.push(`${role} careers apply ${location}`);
  }
  return unique(queries).slice(0, 5);
}

module.exports = { generateJobQueries };
