const memory = require('../memory.service');

function normalizeQuestion(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function formatList(items) {
  if (!Array.isArray(items) || items.length === 0) return '';
  return items.filter(Boolean).map(item => `- ${item}`).join('\n');
}

function getCurrentTimeAnswer(message) {
  const question = normalizeQuestion(message);
  const asksTime =
    question.includes('que hora es') ||
    question.includes('dime la hora') ||
    question.includes('hora actual') ||
    question.includes('dame la hora') ||
    question.includes('que hora');

  if (!asksTime) return null;

  const now = new Date();
  const time = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return `Son las ${time}.`;
}

function buildProfileAnswer(profile) {
  const parts = [];
  if (profile.name) parts.push(`Te llamas ${profile.name}.`);
  if (profile.birthPlace) parts.push(`Eres de ${profile.birthPlace}.`);
  if (profile.nationality) parts.push(`Tu nacionalidad es ${profile.nationality}.`);
  if (profile.currentProject) parts.push(`Actualmente trabajas en: ${profile.currentProject}.`);
  if (Array.isArray(profile.likes) && profile.likes.length > 0)
    parts.push(`Te gusta:\n${formatList(profile.likes)}`);
  if (Array.isArray(profile.goals) && profile.goals.length > 0)
    parts.push(`Tus objetivos son:\n${formatList(profile.goals)}`);
  if (Array.isArray(profile.preferences) && profile.preferences.length > 0)
    parts.push(`Tus preferencias son:\n${formatList(profile.preferences)}`);
  return parts.length > 0 ? parts.join('\n\n') : 'No tengo suficiente información sobre ti todavía.';
}

function getControlledMemoryAnswer(message, fullMemory) {
  const question = normalizeQuestion(message);
  const profile = fullMemory.profile || {};
  const projectMemory = fullMemory.projectMemory || {};

  if (question.includes('que sabes de mi') || question.includes('que sabes sobre mi'))
    return buildProfileAnswer(profile);

  if (question.includes('como me llamo') || question.includes('cual es mi nombre'))
    return profile.name ? `Te llamas ${profile.name}.` : 'Aún no tengo guardado tu nombre.';

  if (question.includes('de donde soy') || question.includes('donde naci'))
    return profile.birthPlace ? `Eres de ${profile.birthPlace}.` : 'Aún no tengo guardado tu lugar de origen.';

  if (question.includes('que me gusta') || question.includes('cuales son mis gustos'))
    return Array.isArray(profile.likes) && profile.likes.length > 0
      ? `Te gusta:\n${formatList(profile.likes)}`
      : 'Aún no tengo información sobre tus gustos.';

  if (question.includes('que quiero') || question.includes('cuales son mis objetivos'))
    return Array.isArray(profile.goals) && profile.goals.length > 0
      ? `Tus objetivos son:\n${formatList(profile.goals)}`
      : 'Aún no tengo información sobre tus objetivos.';

  if (question.includes('en que trabajo') || question.includes('en que estoy trabajando')) {
    if (profile.currentProject) return `Actualmente trabajas en: ${profile.currentProject}.`;
    if (Array.isArray(projectMemory.currentTasks) && projectMemory.currentTasks.length > 0)
      return `Actualmente tienes estas tareas:\n${formatList(projectMemory.currentTasks)}`;
    return 'Aún no tengo información sobre tu trabajo actual.';
  }

  if (question.includes('como prefiero') || question.includes('mis preferencias'))
    return Array.isArray(profile.preferences) && profile.preferences.length > 0
      ? `Tus preferencias son:\n${formatList(profile.preferences)}`
      : 'Aún no tengo información sobre tus preferencias.';

  if (question.includes('que sabes de tempest') || question.includes('que es tempest')) {
    const parts = [];
    if (projectMemory.name) parts.push(`Proyecto: ${projectMemory.name}`);
    if (Array.isArray(projectMemory.facts) && projectMemory.facts.length > 0)
      parts.push(`Datos:\n${formatList(projectMemory.facts)}`);
    if (Array.isArray(projectMemory.currentTasks) && projectMemory.currentTasks.length > 0)
      parts.push(`Tareas:\n${formatList(projectMemory.currentTasks)}`);
    if (projectMemory.summary) parts.push(`Resumen:\n${projectMemory.summary}`);
    return parts.length > 0 ? parts.join('\n\n') : 'Aún no tengo memoria suficiente sobre Tempest.';
  }

  return null;
}

module.exports = {
  getCurrentTimeAnswer,
  getControlledMemoryAnswer
};