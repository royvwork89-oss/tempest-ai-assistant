const fs = require('fs');
const path = require('path');

const GLOBAL_PROMPT_PATH = path.join(__dirname, '../global.system.txt');

/**
 * Carga el prompt global base.
 * @returns {string}
 */
function loadGlobalPrompt() {
  try {
    return fs.readFileSync(GLOBAL_PROMPT_PATH, 'utf-8').trim();
  } catch (err) {
    console.error('[global.loader] No se pudo leer global.system.txt:', err.message);
    return 'Eres Tempest, una IA local. Responde en español.';
  }
}

module.exports = { loadGlobalPrompt };