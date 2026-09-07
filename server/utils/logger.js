// Minimal structured logger. Never log secrets, tokens, or API keys.
const redactKeys = ['password', 'token', 'apiKey', 'authorization', 'jwt'];

function scrub(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(clone)) {
    if (redactKeys.some((r) => key.toLowerCase().includes(r.toLowerCase()))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object') {
      clone[key] = scrub(clone[key]);
    }
  }
  return clone;
}

const logger = {
  info: (msg, meta) => console.log(`[info] ${msg}`, meta ? scrub(meta) : ''),
  warn: (msg, meta) => console.warn(`[warn] ${msg}`, meta ? scrub(meta) : ''),
  error: (msg, meta) => console.error(`[error] ${msg}`, meta ? scrub(meta) : ''),
};

module.exports = logger;
