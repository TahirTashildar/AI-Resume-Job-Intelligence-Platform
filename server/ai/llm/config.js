const env = require('../../config/env');

// Single source of truth for LLM configuration, sourced entirely from environment
// variables. No provider or model name is hardcoded anywhere else in the app.
module.exports = {
  provider: env.llm.provider,       // 'huggingface' | 'openai' | 'anthropic'
  model: env.llm.model,
  apiKey: env.llm.apiKey,
  temperature: env.llm.temperature,
  maxTokens: env.llm.maxTokens,
};
