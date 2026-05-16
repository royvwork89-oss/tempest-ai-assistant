// v1: stub. v2: implementar con containment check y realpath.

async function provide({ items, settings }) {
  // source="fs" desactivado en v1 (web)
  // En v2 (Electron): leer por absPath con validación de roots.
  return [];
}

/**
 * Validación de seguridad para v2 — containment check.
 * Bloquea path traversal (../../etc).
 */
function isPathSafe(absPath, root) {
  const realRoot = require('path').resolve(root);
  const realFile = require('path').resolve(absPath);
  return realFile.startsWith(realRoot + require('path').sep) || realFile === realRoot;
}

module.exports = { provide, isPathSafe };