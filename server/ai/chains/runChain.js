const { HumanMessage } = require('@langchain/core/messages');
const { getLLM } = require('../llm/llmFactory');
const { validateWithSchema } = require('../parsers/structuredOutput');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyError(err) {
  const status = err?.status || err?.response?.status || err?.code;
  if (status === 429) return { type: 'rate_limit', retriable: true };
  if (status === 401 || status === 403) return { type: 'auth', retriable: false };
  if (status === 400) return { type: 'bad_request', retriable: false };
  if (status === 500 || status === 502 || status === 503) return { type: 'provider_error', retriable: true };
  if (err?.name === 'AbortError' || err?.code === 'ETIMEDOUT') return { type: 'timeout', retriable: true };
  return { type: 'unknown', retriable: true };
}

function friendlyErrorFor(type) {
  switch (type) {
    case 'rate_limit':
      return ApiError.tooMany('The AI service is currently rate-limited. Please try again shortly.');
    case 'auth':
      return ApiError.internal('The AI provider rejected the request due to a server configuration issue.');
    case 'bad_request':
      return ApiError.badRequest('The AI request was malformed. Please try again or contact support.');
    case 'timeout':
      return ApiError.internal('The AI request timed out. Please try again.');
    default:
      return ApiError.internal('The AI service is temporarily unavailable. Please try again.');
  }
}

/**
 * Runs a single-turn prompt through the configured LLM with:
 * - a hard request timeout
 * - exponential backoff on retriable errors (max MAX_RETRIES)
 * - JSON schema validation of the final output
 *
 * This is the ONLY place in the codebase that talks to the LangChain chat model directly
 * for structured JSON tasks — every AI chain (resumeAnalysisChain, jobAnalysisChain, etc.)
 * calls this helper instead of touching the LLM itself.
 */
async function runStructuredPrompt(promptText, zodSchema, { timeoutMs = 45000 } = {}) {
  const llm = getLLM();
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await llm.invoke([new HumanMessage(promptText)], { signal: controller.signal });
      clearTimeout(timer);
      const rawText = typeof response.content === 'string'
        ? response.content
        : Array.isArray(response.content)
          ? response.content.map((c) => c.text || '').join('\n')
          : String(response.content);

      return validateWithSchema(zodSchema, rawText);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      const { type, retriable } = classifyError(err);

      logger.warn(`LLM call failed (attempt ${attempt + 1}/${MAX_RETRIES + 1})`, { type, message: err.message });

      if (!retriable || attempt === MAX_RETRIES) {
        if (err instanceof ApiError) throw err;
        throw friendlyErrorFor(type);
      }

      const delay = BASE_DELAY_MS * 2 ** attempt + Math.floor(Math.random() * 250);
      await sleep(delay);
    }
  }

  throw lastError instanceof ApiError ? lastError : friendlyErrorFor('unknown');
}

module.exports = { runStructuredPrompt };
