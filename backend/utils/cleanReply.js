const { sanitizeModelOutput } = require('./sanitize');

/**
 * Wrapper legacy — mantiene compatibilidad con todo lo que ya importa cleanReply.
 * La lógica real vive en sanitize.js.
 */
function cleanReply(text) {
  return sanitizeModelOutput(text);
}

module.exports = cleanReply;