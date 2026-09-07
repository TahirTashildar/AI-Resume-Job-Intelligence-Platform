const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');

const RECENCY = { 'Last 24 Hours': 'day', 'Last 3 Days': 'week', 'Last Week': 'week' };

async function searchTavily(query, recency) {
  if (!env.tavilyApiKey) {
    throw ApiError.internal('Job Search is not configured yet. Add TAVILY_API_KEY to the server environment.');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: env.tavilyApiKey,
      query,
      search_depth: 'basic',
      topic: 'general',
      max_results: 6,
      include_answer: false,
      include_raw_content: true,
      time_range: RECENCY[recency] || 'week',
    }),
  });

  if (response.status === 429) throw ApiError.tooMany('Job Search is temporarily rate-limited. Please try again shortly.');
  if (!response.ok) throw ApiError.internal('We could not search for jobs right now. Please try again later.');
  const data = await response.json();
  return Array.isArray(data.results)
    ? data.results.map((result) => ({ ...result, fetched_at: new Date().toISOString() }))
    : [];
}

async function searchTavilyQueries(queries, recency) {
  const batches = await Promise.all([...new Set(queries)].slice(0, 8).map((query) => searchTavily(query, recency)));
  return batches.flat();
}

module.exports = { searchTavilyQueries };
