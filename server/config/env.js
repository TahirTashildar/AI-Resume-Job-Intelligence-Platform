require('dotenv').config();

function required(name, fallback) {
  const val = process.env[name] ?? fallback;
  return val;
}

module.exports = {
  port: parseInt(required('PORT', '5000'), 10),
  nodeEnv: required('NODE_ENV', 'development'),
  clientUrl: required('CLIENT_URL', 'http://localhost:5173'),
  mongoUri: required('MONGO_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: required('JWT_EXPIRES_IN', '7d'),
  llm: {
    provider: required('LLM_PROVIDER', 'huggingface').toLowerCase(),
    model: required('LLM_MODEL', 'Qwen/Qwen2.5-7B-Instruct'),
    apiKey: required('HF_TOKEN') || required('HUGGINGFACE_API_KEY') || required('LLM_API_KEY'),
    temperature: parseFloat(required('LLM_TEMPERATURE', '0.3')),
    maxTokens: parseInt(required('LLM_MAX_TOKENS', '4096'), 10),
  },
  maxUploadMb: parseInt(required('MAX_UPLOAD_MB', '5'), 10),
  tavilyApiKey: required('TAVILY_API_KEY', ''),
};
