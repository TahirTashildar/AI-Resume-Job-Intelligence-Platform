require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;

  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

module.exports = {
  // Server
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Frontend
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  mongoUri: required('MONGO_URI'),

  // Authentication
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // LLM
  llm: {
    provider: (process.env.LLM_PROVIDER || 'huggingface').toLowerCase(),

    model:
      process.env.LLM_MODEL ||
      'Qwen/Qwen2.5-7B-Instruct',

    apiKey:
      process.env.HF_TOKEN ||
      process.env.HUGGINGFACE_API_KEY ||
      process.env.LLM_API_KEY ||
      '',

    temperature: parseFloat(
      process.env.LLM_TEMPERATURE || '0.3'
    ),

    maxTokens: parseInt(
      process.env.LLM_MAX_TOKENS || '4096',
      10
    ),
  },

  // File uploads
  maxUploadMb: parseInt(
    process.env.MAX_UPLOAD_MB || '5',
    10
  ),

  // Search
  tavilyApiKey: process.env.TAVILY_API_KEY || '',
};