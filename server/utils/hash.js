const crypto = require('crypto');

// Used to detect unchanged resume/job content so we never re-run (and re-bill) an
// unchanged AI analysis — see rate-limit protection requirements.
function contentHash(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

module.exports = { contentHash };
