const crypto = require('crypto');

/**
 * Generate a SHA-256 fingerprint of a text payload.
 * Used as informal proof of authorship (timestamp + hash).
 */
const generateFingerprint = (content) => {
  const timestamp = new Date().toISOString();
  const payload = `${content}::${timestamp}`;
  return {
    fingerprint: crypto.createHash('sha256').update(payload).digest('hex'),
    fingerprintedAt: timestamp,
  };
};

module.exports = { generateFingerprint };
