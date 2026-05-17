'use strict';

/**
 * Devuelve el modelId de fallback absoluto para el hardware actual.
 * Se usa cuando el router falla completamente y no puede tomar decisión.
 * 
 * @param {string} hardware - 'desktop' | 'laptop'
 * @returns {{ model: string, provider: string, reason: string, confidence: string }}
 */
function getAbsoluteFallback(hardware = 'desktop') {
  const fallbacks = {
    desktop: 'hermes-q5',
    laptop:  'qwen2.5-3b-q4',
  };

  const model = fallbacks[hardware] ?? fallbacks.desktop;

  return {
    model,
    provider:    'localai',
    reason:      'fallback absoluto — error crítico en el router',
    confidence:  'LOW',
  };
}

/**
 * Determina si un error de LocalAI justifica un fallback a otro modelo.
 * Solo aplica para errores técnicos — nunca por calidad de respuesta.
 *
 * Errores que justifican fallback:
 *   - timeout de conexión
 *   - modelo no cargado (404, 503)
 *   - error de VRAM / out of memory
 *   - YAML inexistente
 *
 * @param {Error|Object} error - Error capturado en la llamada a LocalAI
 * @returns {boolean}
 */
function shouldFallback(error) {
  if (!error) return false;

  const message = (error.message || '').toLowerCase();
  const status  = error.status || error.statusCode || 0;

  const isTechnicalError =
    status === 404 ||
    status === 503 ||
    status === 500 ||
    message.includes('timeout') ||
    message.includes('econnrefused') ||
    message.includes('out of memory') ||
    message.includes('oom') ||
    message.includes('model not found') ||
    message.includes('no such file');

  return isTechnicalError;
}

module.exports = { getAbsoluteFallback, shouldFallback };