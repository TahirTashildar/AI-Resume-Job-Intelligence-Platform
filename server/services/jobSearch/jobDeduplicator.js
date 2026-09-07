function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokenSimilarity(left, right) {
  const a = new Set(normalize(left).split(' ').filter(Boolean));
  const b = new Set(normalize(right).split(' ').filter(Boolean));
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / Math.max(1, Math.min(a.size, b.size));
}

function deduplicateJobs(jobs) {
  const unique = [];
  for (const job of jobs) {
    const duplicate = unique.find((existing) => (
      existing.sourceUrl === job.sourceUrl
      || (normalize(existing.company) === normalize(job.company)
        && normalize(existing.location) === normalize(job.location)
        && tokenSimilarity(existing.title, job.title) >= 0.8
        && tokenSimilarity(existing.description, job.description) >= 0.6)
    ));
    if (!duplicate) unique.push(job);
    else if ((job.postingQuality || 0) + (job.sourceQuality || 0) > (duplicate.postingQuality || 0) + (duplicate.sourceQuality || 0)) {
      unique[unique.indexOf(duplicate)] = job;
    }
  }
  return unique;
}

module.exports = { deduplicateJobs };
