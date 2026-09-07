const fs = require('fs/promises');
const { extractText, detectFileType } = require('../documentParser');
const aiService = require('../../ai/services/aiService');
const { generateJobQueries } = require('./jobQueryGenerator');
const { searchTavilyQueries } = require('./tavilySearchService');
const { normalizeJobResult } = require('./jobNormalizer');
const { freshnessScore } = require('./jobFreshnessScorer');
const { deduplicateJobs } = require('./jobDeduplicator');
const { matchJob } = require('./jobMatcher');

async function createProfileFromUpload(file) {
  try {
    const resumeText = await extractText(file.path, detectFileType(file.mimetype));
    const profile = await aiService.extractJobSearchProfile(resumeText);
    return { profile, filename: file.originalname };
  } finally {
    try {
      await fs.unlink(file.path);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

async function searchJobs({ profile, preferences }) {
  const queries = generateJobQueries(profile, preferences);
  const rawResults = await searchTavilyQueries(queries, preferences.recency);
  const seenUrls = new Set();
  const uniqueRawResults = rawResults.filter((result) => {
    const url = String(result.url || '').toLowerCase().replace(/\/+$/, '');
    if (!url || seenUrls.has(url)) return false;
    seenUrls.add(url);
    return true;
  });
  const normalized = uniqueRawResults.map(normalizeJobResult).filter(Boolean);
  const uniqueJobs = deduplicateJobs(normalized);
  const role = preferences.roles?.[0] || profile.targetRoles?.[0] || '';
  return uniqueJobs
    .map((job) => {
      const freshness = freshnessScore(job.publishedDate, job.fetchedAt, preferences.recency);
      if (!freshness) return null;
      const match = matchJob(job, profile, role, preferences);
      return {
        ...job,
        freshnessScore: freshness.score,
        freshnessLabel: freshness.label,
        freshnessConfidence: freshness.confidence,
        ...match,
        freshness: freshness.label,
        rankingScore: Math.round(
          match.matchScore * 0.6
          + freshness.score * 0.2
          + (job.sourceQuality || 0) * 0.1
          + (job.postingQuality || 0) * 0.1
        ),
      };
    })
    .filter((job) => job && job.qualityScore >= 60 && job.matchScore >= 30)
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .slice(0, 40);
}

module.exports = { createProfileFromUpload, searchJobs };
