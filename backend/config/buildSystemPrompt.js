const { loadGlobalPrompt }   = require('./prompts/loaders/global.loader');
const { loadModePrompt }     = require('./prompts/loaders/mode.loader');
const { loadProjectPrompt }  = require('./prompts/loaders/project.loader');
const { buildPrompt }        = require('./prompts/loaders/prompt.builder');

function buildSystemPrompt({ fullMemory = {}, mode = 'general', variant = null, userId, projectId }) {
  const profile       = fullMemory.profile       || {};
  const projectMemory = fullMemory.projectMemory || {};

  const globalPrompt  = loadGlobalPrompt();
  const projectPrompt = loadProjectPrompt(userId, projectId);
  const modePrompt    = loadModePrompt(mode, variant);
  const memoryBlock   = buildMemoryBlock(profile, projectMemory);

  // TEMPORAL
  console.log('[buildSystemPrompt] global:', globalPrompt.slice(0, 50));
  console.log('[buildSystemPrompt] mode:', mode, '| modePrompt:', modePrompt.slice(0, 50));
  console.log('[buildSystemPrompt] project:', projectPrompt ? 'SÍ' : 'vacío');

  return buildPrompt({ globalPrompt, projectPrompt, modePrompt, memoryBlock });
}

function buildMemoryBlock(profile, projectMemory) {
  const hasProfile = Object.keys(profile).length > 0;
  const hasProject = Object.keys(projectMemory).length > 0;

  if (!hasProfile && !hasProject) return '';

  const lines = ['CONTEXTO DE MEMORIA (solo para consultas explícitas):'];

  if (hasProfile) {
    lines.push(`\nPERFIL DEL USUARIO:\n${JSON.stringify(profile, null, 2)}`);
  }

  if (hasProject) {
    lines.push(`\nMEMORIA DEL PROYECTO:\n${JSON.stringify(projectMemory, null, 2)}`);
  }

  return lines.join('\n');
}

module.exports = { buildSystemPrompt };