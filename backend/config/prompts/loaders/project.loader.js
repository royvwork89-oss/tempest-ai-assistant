const fs = require('fs');
const path = require('path');

const USERS_DIR = path.join(__dirname, '../../../data/users');

/**
 * Carga el prompt de proyecto si existe.
 * @param {string} userId
 * @param {string} projectId
 * @returns {string}
 */
function loadProjectPrompt(userId, projectId) {
  if (!userId || !projectId) return '';

  const promptPath = path.join(
    USERS_DIR,
    userId,
    'projects',
    projectId,
    'project.system.txt'
  );

  try {
    if (!fs.existsSync(promptPath)) return '';
    return fs.readFileSync(promptPath, 'utf-8').trim();
  } catch (err) {
    console.error(`[project.loader] No se pudo leer project.system.txt para ${projectId}:`, err.message);
    return '';
  }
}

module.exports = { loadProjectPrompt };