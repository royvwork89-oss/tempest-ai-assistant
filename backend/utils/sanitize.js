/**
 * sanitize.js — Capa de post-procesado de salidas del modelo
 *
 * Función pura: recibe texto, devuelve texto.
 * Sin dependencias externas, sin logs, sin DOM.
 * Reutilizable en backend, tests, Electron, etc.
 */

// ─── Stop tokens de modelos Hermes / LLaMA ───────────────────────────────────

const STOP_TOKEN_REGEX = /<\|im_end\|>|<\|end_of_text\|>|<\|begin_of_text\|>|<\|eot_id\|>|<\|im_start\|>/g;

// ─── Prefijos internos que el backend inyecta al modelo ──────────────────────
// Solo se eliminan si aparecen al final del texto (el modelo los repite)

const INTERNAL_INSTRUCTION_PATTERNS = [
  /Responde SOLO con texto explicativo,?\s*sin bloques de código\.?\s*/gi,
  /Explica brevemente en texto y luego entrega el código organizado por archivos\.?\s*/gi,
  /Analiza los archivos adjuntos\.?\s*/gi
];

// ─── Basura típica del modelo ─────────────────────────────────────────────────

const MODEL_NOISE_REGEX = [
  /^assistant\s*/i,   // algunos modelos prefijan su respuesta con "assistant"
  /^:+/               // dos puntos al inicio
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Elimina prefijos internos solo si aparecen al final del texto.
 * Evita falsos positivos en medio de respuestas legítimas.
 */
function stripTrailingInstructions(text) {
  let result = text;
  for (const pattern of INTERNAL_INSTRUCTION_PATTERNS) {
    const checkFrom = Math.max(0, result.length - Math.max(300, Math.floor(result.length * 0.2)));
    const tail = result.slice(checkFrom);
    const cleaned = tail.replace(pattern, '').trimEnd();
    if (cleaned !== tail) {
      result = result.slice(0, checkFrom) + cleaned;
    }
  }
  return result;
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * @param {string} text  Texto crudo del modelo
 * @param {object} [options]
 * @param {boolean} [options.stripStopTokens=true]
 * @param {boolean} [options.stripInternalInstructions=true]
 * @param {boolean} [options.stripModelNoise=true]
 * @param {boolean} [options.normalizeWhitespace=true]
 * @returns {string}
 */
function sanitizeModelOutput(text, options = {}) {
  const {
    stripStopTokens = true,
    stripInternalInstructions = true,
    stripModelNoise = true,
    normalizeWhitespace = true
  } = options;

  let result = String(text || '');

  if (stripStopTokens) {
    result = result.replace(STOP_TOKEN_REGEX, '');
  }

  if (stripModelNoise) {
    for (const pattern of MODEL_NOISE_REGEX) {
      result = result.replace(pattern, '');
    }
  }

  if (stripInternalInstructions) {
    result = stripTrailingInstructions(result);
  }

  if (normalizeWhitespace) {
    result = result.trim();
  }

  return result;
}

module.exports = { sanitizeModelOutput };