const llmConfig = require('./config');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

const HF_ROUTER_URL = 'https://router.huggingface.co/v1/chat/completions';

async function callHuggingFaceChatCompletion({ apiKey, model, messages, temperature, maxTokens, signal }) {
  const res = await fetch(HF_ROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const err = new Error(`HF router ${res.status}: ${errBody.slice(0, 300)}`);
    err.status = res.status;
    err.response = { status: res.status, data: errBody };
    throw err;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return { content };
}

/**
 * Provider-agnostic LLM factory.
 *
 * The rest of the application must ONLY ever call getLLM() / getStructuredLLM().
 * It must never import a provider SDK directly. To add a new provider, add an
 * adapter branch below — no other file in the codebase needs to change.
 */

let cachedChatModel = null;

function buildProviderModel() {
  const { provider, model, apiKey, temperature, maxTokens } = llmConfig;

  if (!apiKey) {
    throw ApiError.internal(
      'No Hugging Face token configured on the server. Set HF_TOKEN in your .env file.'
    );
  }

  switch (provider) {
    case 'huggingface': {
      return {
        async invoke(messages, options = {}) {
          const payload = messages.map((message) => {
            const type = message._getType?.();
            const role = type === 'human'
              ? 'user'
              : type === 'ai'
                ? 'assistant'
                : 'system';
            return {
              role,
              content: typeof message.content === 'string'
                ? message.content
                : String(message.content),
            };
          });

          const { content } = await callHuggingFaceChatCompletion({
            apiKey,
            model,
            messages: payload,
            temperature,
            maxTokens,
            signal: options.signal,
          });
          return { content };
        },
      };
    }
    case 'openai': {
      // eslint-disable-next-line global-require
      const { ChatOpenAI } = require('@langchain/openai');
      return new ChatOpenAI({ apiKey, model, temperature, maxTokens });
    }
    case 'anthropic': {
      // eslint-disable-next-line global-require
      const { ChatAnthropic } = require('@langchain/anthropic');
      return new ChatAnthropic({ apiKey, model, temperature, maxTokens });
    }
    default:
      throw ApiError.internal(
        `Unsupported LLM_PROVIDER "${provider}". Supported: huggingface, openai, anthropic.`
      );
  }
}

/**
 * Returns a shared LangChain chat-model instance for the configured provider.
 * Application code (chains, services, controllers) should call this instead
 * of importing any provider SDK.
 */
function getLLM() {
  if (!cachedChatModel) {
    logger.info(`Initializing LLM provider: ${llmConfig.provider} (${llmConfig.model})`);
    cachedChatModel = buildProviderModel();
  }
  return cachedChatModel;
}

/**
 * Returns a chat model bound to a structured (schema-validated) output format.
 * Falls back gracefully if a provider's LangChain integration does not support
 * native structured output — callers should still run the result through the
 * shared JSON validators in ai/parsers/structuredOutput.js as a safety net.
 */
function getStructuredLLM(zodSchema) {
  const llm = getLLM();
  if (typeof llm.withStructuredOutput === 'function') {
    return llm.withStructuredOutput(zodSchema, { name: 'structured_response' });
  }
  return llm;
}

// Exposed for tests / admin diagnostics only — never for business logic to branch on.
function getProviderName() {
  return llmConfig.provider;
}

module.exports = { getLLM, getStructuredLLM, getProviderName };
