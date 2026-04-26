const fs = require('fs');
const path = require('path');

const memoryFilePath = path.join(__dirname, '../data/memory.json');
const MAX_WORKING_MEMORY = 5;

function getInitialMemory() {
  return {
    profile: {},
    workingMemory: [],
    summary: ''
  };
}

function ensureMemoryFile() {
  if (!fs.existsSync(memoryFilePath)) {
    fs.writeFileSync(
      memoryFilePath,
      JSON.stringify(getInitialMemory(), null, 2),
      'utf-8'
    );
  }
}

function loadMemory() {
  try {
    ensureMemoryFile();

    const rawData = fs.readFileSync(memoryFilePath, 'utf-8');
    const parsed = JSON.parse(rawData);

    return {
      profile: parsed.profile || {},
      workingMemory: Array.isArray(parsed.workingMemory)
        ? parsed.workingMemory
        : [],
      summary: parsed.summary || ''
    };
  } catch (error) {
    console.error('Error al cargar memory.json:', error);
    return getInitialMemory();
  }
}

function saveMemory(memory) {
  try {
    fs.writeFileSync(memoryFilePath, JSON.stringify(memory, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error al guardar memory.json:', error);
  }
}



function isImportantMessage(content) {
  const text = content.toLowerCase();

return (
  text.includes('me llamo') ||
  text.includes('mi nombre') ||
  text.includes('soy de') ||
  text.includes('nací en') ||
  text.includes('naci en') ||
  text.includes('mi nacionalidad es') ||

  // edad (más preciso)
  (text.includes('tengo') && text.includes('años')) ||

  // intereses
  text.includes('me gusta') ||

  // objetivos
  text.includes('quiero aprender') ||

  // contexto actual
  text.includes('estoy trabajando en') ||

  // preferencias
  text.includes('prefiero')
);
}

function isGarbage(text) {
  const cleanText = text.toLowerCase();

  return (
    cleanText.includes('://') ||
    cleanText.length < 5
  );
}

function buildSummary(memory) {
  const messages = memory.workingMemory;

  if (!messages.length) return memory.summary || '';

  const userMessages = messages
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content);

  const lastMessages = userMessages.slice(-5).join('. ');

  // NO encadenar infinitamente
  return `Datos del usuario: ${lastMessages}`;
}

function addMessage(role, content) {
  const memory = loadMemory();
  const text = content.toLowerCase();

  // guardar solo mensajes importantes del usuario
  if (role === 'user' && isImportantMessage(content)) {
    memory.workingMemory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
  }

  // guardar solo respuestas útiles del assistant
  if (role === 'assistant') {
    if (text.length < 10) return;
    if (isGarbage(content)) return;
    if (text.includes('es un placer conocerte')) return;
    if (text.includes('como ia')) return;
    if (text.includes('puedo ayudarte')) return;
    if (text.includes('estoy aquí para ayudarte')) return;
    if (content.length > 150) return;

    memory.workingMemory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
  }

  if (memory.workingMemory.length >= MAX_WORKING_MEMORY) {
  memory.summary = buildSummary(memory);
  memory.workingMemory = [];
  }

  saveMemory(memory);
}

function getWorkingMemory() {
  const memory = loadMemory();
  return memory.workingMemory;
}

function clearWorkingMemory() {
  const memory = loadMemory();
  memory.workingMemory = [];
  saveMemory(memory);
}

function updateProfile(newData) {
  const memory = loadMemory();

  memory.profile = {
    ...memory.profile,
    ...newData
  };

  saveMemory(memory);
  return memory.profile;
}

function updateSummary(newSummary) {
  const memory = loadMemory();
  memory.summary = newSummary;
  saveMemory(memory);
  return memory.summary;
}

function getFullMemory() {
  return loadMemory();
}

function getUserData() {
  const memory = loadMemory();
  return memory.profile;
}

function getHistory() {
  const memory = loadMemory();

  return memory.workingMemory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

function detectUserData(message) {
  const text = message.trim();
  const lowerText = text.toLowerCase();

  const isTestOrExample =
    lowerText.includes('ejemplo') ||
    lowerText.includes('por ejemplo') ||
    lowerText.includes('supongamos') ||
    lowerText.includes('imagina que') ||
    lowerText.includes('para pruebas') ||
    lowerText.includes('de prueba') ||
    lowerText.includes('usa el nombre') ||
    lowerText.includes('ponle el nombre');

  if (isTestOrExample) {
    return;
  }

  const namePatterns = [
    /me llamo\s+([a-záéíóúñ]+)/i,
    /mi nombre es\s+([a-záéíóúñ]+)/i,
  ];

  const birthPlacePatterns = [
    /nac[ií]\s+en\s+([a-záéíóúñ\s]+)/i,
    /soy\s+de\s+([a-záéíóúñ\s]+)/i
  ];

  const nationalityPatterns = [
    /mi nacionalidad es\s+([a-záéíóúñ\s]+)/i,
    /soy\s+(mexicano|mexicana|español|española|argentino|argentina|colombiano|colombiana|chileno|chilena|peruano|peruana)/i
  ];

  const memory = loadMemory();

  for (const pattern of namePatterns) {
    const match = text.match(pattern);

    if (match && match[1]) {
      const extractedName =
        match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();

      if (
        memory.profile.name &&
        memory.profile.name !== extractedName
      ) {
        const previousNames = Array.isArray(memory.profile.previousNames)
          ? memory.profile.previousNames
          : [];

        if (!previousNames.includes(memory.profile.name)) {
          previousNames.push(memory.profile.name);
        }

        memory.profile.previousNames = previousNames;
      }

      memory.profile.name = extractedName;
      saveMemory(memory);
      break;
    }
  }

  for (const pattern of birthPlacePatterns) {
    const match = text.match(pattern);

    if (match && match[1]) {
      const extractedBirthPlace = match[1]
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

      memory.profile.birthPlace = extractedBirthPlace;
      saveMemory(memory);
      break;
    }
  }

  for (const pattern of nationalityPatterns) {
    const match = text.match(pattern);

    if (match && match[1]) {
      const extractedNationality =
        match[1].trim().charAt(0).toUpperCase() +
        match[1].trim().slice(1).toLowerCase();

      memory.profile.nationality = extractedNationality;
      saveMemory(memory);
      break;
    }
  }
}

module.exports = {
  loadMemory,
  saveMemory,
  addMessage,
  getWorkingMemory,
  updateProfile,
  updateSummary,
  clearWorkingMemory,
  getFullMemory,
  detectUserData,
  getUserData,
  getHistory
};