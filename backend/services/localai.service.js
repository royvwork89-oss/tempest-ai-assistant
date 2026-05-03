const cleanReply = require('../utils/cleanReply');
const memory = require('./memory.service');

const DEFAULT_MEMORY_OPTIONS = {
  userId: memory.DEFAULT_USER_ID,
  projectId: memory.DEFAULT_PROJECT_ID,
  chatId: memory.DEFAULT_CHAT_ID
};

function normalizeQuestion(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function formatList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '';
  }

  return items
    .filter(Boolean)
    .map(item => `- ${item}`)
    .join('\n');
}

function getCurrentTimeAnswer(message) {
  const question = normalizeQuestion(message);

  const asksTime =
    question.includes('que hora es') ||
    question.includes('dime la hora') ||
    question.includes('hora actual') ||
    question.includes('dame la hora') ||   // ← AGREGA ESTA
    question.includes('que hora');         // ← OPCIONAL (más flexible)

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

  if (profile.name) {
    parts.push(`Te llamas ${profile.name}.`);
  }

  if (profile.birthPlace) {
    parts.push(`Eres de ${profile.birthPlace}.`);
  }

  if (profile.nationality) {
    parts.push(`Tu nacionalidad es ${profile.nationality}.`);
  }

  if (profile.currentProject) {
    parts.push(`Actualmente trabajas en: ${profile.currentProject}.`);
  }

  if (Array.isArray(profile.likes) && profile.likes.length > 0) {
    parts.push(`Te gusta:\n${formatList(profile.likes)}`);
  }

  if (Array.isArray(profile.goals) && profile.goals.length > 0) {
    parts.push(`Tus objetivos son:\n${formatList(profile.goals)}`);
  }

  if (Array.isArray(profile.preferences) && profile.preferences.length > 0) {
    parts.push(`Tus preferencias son:\n${formatList(profile.preferences)}`);
  }

  return parts.length > 0
    ? parts.join('\n\n')
    : 'No tengo suficiente información sobre ti todavía.';
}

function getControlledMemoryAnswer(message, fullMemory) {
  const question = normalizeQuestion(message);
  const profile = fullMemory.profile || {};
  const projectMemory = fullMemory.projectMemory || {};

  if (
    question.includes('que sabes de mi') ||
    question.includes('que sabes sobre mi')
  ) {
    return buildProfileAnswer(profile);
  }

  if (
    question.includes('como me llamo') ||
    question.includes('cual es mi nombre')
  ) {
    return profile.name
      ? `Te llamas ${profile.name}.`
      : 'Aún no tengo guardado tu nombre.';
  }

  if (
    question.includes('de donde soy') ||
    question.includes('donde naci') ||
    question.includes('cual es mi lugar de nacimiento')
  ) {
    return profile.birthPlace
      ? `Eres de ${profile.birthPlace}.`
      : 'Aún no tengo guardado tu lugar de origen.';
  }

  if (
    question.includes('que me gusta') ||
    question.includes('cuales son mis gustos')
  ) {
    return Array.isArray(profile.likes) && profile.likes.length > 0
      ? `Te gusta:\n${formatList(profile.likes)}`
      : 'Aún no tengo información sobre tus gustos.';
  }

  if (
    question.includes('que quiero') ||
    question.includes('cuales son mis objetivos') ||
    question.includes('que objetivos tengo')
  ) {
    return Array.isArray(profile.goals) && profile.goals.length > 0
      ? `Tus objetivos son:\n${formatList(profile.goals)}`
      : 'Aún no tengo información sobre tus objetivos.';
  }

  if (
    question.includes('en que trabajo') ||
    question.includes('en que estoy trabajando') ||
    question.includes('cual es mi proyecto actual')
  ) {
    if (profile.currentProject) {
      return `Actualmente trabajas en: ${profile.currentProject}.`;
    }

    if (
      Array.isArray(projectMemory.currentTasks) &&
      projectMemory.currentTasks.length > 0
    ) {
      return `Actualmente tienes estas tareas del proyecto:\n${formatList(projectMemory.currentTasks)}`;
    }

    return 'Aún no tengo información sobre tu trabajo o proyecto actual.';
  }

  if (
    question.includes('como prefiero') ||
    question.includes('mis preferencias') ||
    question.includes('como quiero que respondas')
  ) {
    return Array.isArray(profile.preferences) && profile.preferences.length > 0
      ? `Tus preferencias son:\n${formatList(profile.preferences)}`
      : 'Aún no tengo información sobre tus preferencias.';
  }

  if (
    question.includes('que sabes de tempest') ||
    question.includes('que es tempest') ||
    question.includes('estado del proyecto tempest')
  ) {
    const parts = [];

    if (projectMemory.name) {
      parts.push(`Proyecto: ${projectMemory.name}`);
    }

    if (Array.isArray(projectMemory.facts) && projectMemory.facts.length > 0) {
      parts.push(`Datos del proyecto:\n${formatList(projectMemory.facts)}`);
    }

    if (Array.isArray(projectMemory.currentTasks) && projectMemory.currentTasks.length > 0) {
      parts.push(`Tareas actuales:\n${formatList(projectMemory.currentTasks)}`);
    }

    if (projectMemory.summary) {
      parts.push(`Resumen:\n${projectMemory.summary}`);
    }

    return parts.length > 0
      ? parts.join('\n\n')
      : 'Aún no tengo memoria suficiente sobre Tempest.';
  }

  return null;
}

function buildSystemPrompt(fullMemory) {
  const profile = fullMemory.profile || {};
  const projectMemory = fullMemory.projectMemory || {};

  return `
Eres Tempest, una IA local conversacional.

REGLAS PRINCIPALES:
- Responde en español.
- Responde natural, directo y útil.
- NO saludes en cada respuesta.
- NO digas "basado en lo que has compartido".
- NO digas "según tu memoria".
- NO digas "tus intereses incluyen" salvo que el usuario pregunte explícitamente por sus gustos.
- NO recites listas del perfil en conversación normal.
- NO conviertas cada dato nuevo del usuario en un resumen de memoria.

CUANDO EL USUARIO COMPARTE UN GUSTO:
Ejemplo: "me gusta la ciencia ficción"
Respuesta correcta:
- Entra al tema.
- Pregunta algo interesante.
- Recomienda ideas, obras o caminos relacionados.
- Puedes sonar curioso o creativo.

Respuesta incorrecta:
- "Basado en lo que has compartido..."
- "Tus intereses incluyen..."
- "También te gusta X, Y y Z..."

CUANDO USAR MEMORIA:
- Usa profile SOLO si el usuario pregunta explícitamente:
  "¿Qué sabes de mí?"
  "¿Qué me gusta?"
  "¿Qué quiero?"
  "¿En qué trabajo?"
  "¿Cómo prefiero que respondas?"

CUANDO NO USAR MEMORIA:
- Si el usuario solo conversa.
- Si el usuario comparte un gusto nuevo.
- Si el usuario pide opinión, ideas, explicación o recomendaciones.

ESTILO:
- Conversa como copiloto inteligente.
- Si el tema da para más, invita a profundizar.
- Puedes recomendar 2 o 3 ejemplos.
- Máximo 4 párrafos cortos.

REGLAS DE CÓDIGO (MUY IMPORTANTE):

- Si el usuario pide código, SIEMPRE responde con bloques separados.
- Cada archivo debe ir en su propio bloque.
- Escribe siempre: Archivo: nombre-del-archivo.ext antes de cada uno.
- Nunca mezcles archivos.
- Nunca cortes código.
- Entrega TODOS los archivos solicitados.

PRIORIDAD:

Si el usuario pide varios archivos:
- entrega TODOS aunque sean simples
- NO te detengas después del primero
- es mejor entregar archivos básicos completos que uno solo perfecto

ACLARACIÓN CRÍTICA:
- Cuando el usuario pide archivos (HTML, CSS, JS, Node, etc),
  NO estás creando archivos reales en su sistema.
- SOLO estás mostrando ejemplos de código.
- SIEMPRE puedes generar código sin pedir más información.
- NO digas que no puedes generar archivos.
- NO pidas contexto adicional para ejemplos básicos.
- Asume que el usuario quiere un ejemplo funcional simple

PROFILE DEL USUARIO, SOLO PARA CONSULTAS EXPLÍCITAS DE MEMORIA:
${JSON.stringify(profile, null, 2)}

MEMORIA DEL PROYECTO, SOLO SI EL USUARIO PREGUNTA POR TEMPEST:
${JSON.stringify(projectMemory, null, 2)}
`;
}

function countCodeFences(text) {
  return (String(text || '').match(/```/g) || []).length;
}

function findLastFileHeadingBefore(text, index) {
  const lines = String(text || '').split('\n');
  let position = 0;
  let lastHeadingPosition = -1;

  for (const line of lines) {
    const trimmed = line.trim();

    const isFileHeading =
      trimmed.toLowerCase().startsWith('archivo:') ||
      /^\d+\.\s+.+/.test(trimmed);

    if (isFileHeading && position <= index) {
      lastHeadingPosition = position;
    }

    position += line.length + 1;
  }

  return lastHeadingPosition >= 0 ? lastHeadingPosition : index;
}

function removeIncompleteFileBlock(text) {
  const value = String(text || '');
  const fenceCount = countCodeFences(value);

  if (fenceCount % 2 === 0) {
    return value.trim();
  }

  const lastFenceIndex = value.lastIndexOf('```');
  const cutIndex = findLastFileHeadingBefore(value, lastFenceIndex);

  return value.slice(0, cutIndex).trim();
}

const HARDWARE_TOKEN_PROFILES = {
  laptop: {
    default:             { normal: 500, code: 900,  continue: 900  },
    'qwen2.5-3b-q4':    { normal: 500, code: 900,  continue: 900  },
    'qwen2.5-3b-q5':    { normal: 600, code: 1000, continue: 1000 },
    'llama-3.2-3b-q4':  { normal: 600, code: 1000, continue: 1000 }
  },
  desktop: {
    default:             { normal: 1000, code: 1800, continue: 1800 },
    'hermes-q4':         { normal: 1000, code: 1700, continue: 1700 },
    'hermes-q5':         { normal: 1200, code: 1900, continue: 1900 },
    'hermes-q6':         { normal: 1400, code: 2200, continue: 2200 }
  }
};

function isCodeRequest(message) {
  return /archivo|archivos|genera|crea|código|codigo|función|funcion|proyecto|html|css|javascript|js|node|express|backend|frontend/i
    .test(String(message || ''));
}

function getMaxTokens(model, message, mode = 'normal', hardwareProfile = 'laptop') {
  const selectedHardware = HARDWARE_TOKEN_PROFILES[hardwareProfile]
    ? hardwareProfile
    : 'laptop';

  const selectedModel = model || 'hermes-q4';
  const hardwareConfig = HARDWARE_TOKEN_PROFILES[selectedHardware];
  const modelConfig = hardwareConfig[selectedModel] || hardwareConfig.default;

  if (mode === 'continue') return modelConfig.continue;
  if (isCodeRequest(message)) return modelConfig.code;

  return modelConfig.normal;
}

function looksLikeCutReply(text) {
  const value = String(text || '').trim();

  if (value.length < 300) {
    return false;
  }

  const hasOpenCodeBlock = countCodeFences(value) % 2 !== 0;

  const endsLikeBrokenCode =
    /=\s*$/.test(value) ||
    /\{\s*$/.test(value) ||
    /\(\s*$/.test(value) ||
    /,\s*$/.test(value) ||
    /const\s+\w+\s*=\s*$/.test(value) ||
    /let\s+\w+\s*=\s*$/.test(value);

  return hasOpenCodeBlock || endsLikeBrokenCode;
}



async function sendToLocalAI(message, options = DEFAULT_MEMORY_OPTIONS) {
  console.log('OPTIONS RECIBIDO:', options);
  memory.detectUserData(message, options);
  memory.addMessage('user', message, options);
  memory.addChatHistoryMessage('user', message, options);

  const fullMemory = memory.getFullMemory(options);

  const timeAnswer = getCurrentTimeAnswer(message);

  if (timeAnswer) {
    memory.addChatHistoryMessage('assistant', timeAnswer, options);
    return timeAnswer;
  }

  const controlledAnswer = getControlledMemoryAnswer(message, fullMemory);

  if (controlledAnswer) {
    memory.addChatHistoryMessage('assistant', controlledAnswer, options);
    return controlledAnswer;
  }

  const lowerMessage = message.toLowerCase().trim();

  if (
    lowerMessage === 'hola' ||
    lowerMessage === 'buenas' ||
    lowerMessage === 'hey'
  ) {
    const name = fullMemory.profile?.name || 'Rogelio';
    const greeting = `Hola ${name}, ¿en qué puedo ayudarte?`;

    memory.addChatHistoryMessage('assistant', greeting, options);
    return greeting;
  }


  const history = memory.getHistory(options)
    .slice(-4)
    .filter(msg => {
      const text = msg.content.toLowerCase();

      if (
        msg.role === 'user' &&
        (
          text.includes('me gusta') ||
          text.includes('quiero') ||
          text.includes('estoy trabajando')
        )
      ) {
        return false;
      }

      if (
        msg.role === 'assistant' &&
        (
          text.includes('no tengo memoria') ||
          text.includes('basado en lo que') ||
          text.trim() === ''
        )
      ) {
        return false;
      }

      return true;
    });

  const messages = [
    {
      role: 'system',
      content: buildSystemPrompt(fullMemory)
    },
    ...history,
    {
      role: 'user',
      content: message
    }
  ];

  console.log('HISTORIAL ENVIADO A LOCALAI:', messages);

  console.log('MODELO USADO:', options);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  const response = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.primaryModel || 'hermes-q4',
      stream: false,
      temperature: 0,
      max_tokens: getMaxTokens(
        options.primaryModel,
        message,
        'normal',
        options.hardwareProfile || 'laptop'
      ),
      messages
    })
  });

if (!response.ok) {
  const errorText = await response.text();
  throw new Error(`Error LocalAI: ${errorText}`);
}

const data = await response.json();
console.log('RESPUESTA LOCALAI:', data);
clearTimeout(timeoutId);

let reply =
  data?.choices?.[0]?.message?.content ||
  data?.choices?.[0]?.text ||
  'Sin respuesta';

reply = cleanReply(reply);

const isCut = looksLikeCutReply(reply);

if (isCut) {
  console.log('⚠️ Respuesta incompleta, regenerando archivo cortado...');

  const safeReply = removeIncompleteFileBlock(reply);

const continueController = new AbortController();
  const continueTimeoutId = setTimeout(() => continueController.abort(), 120000);

  const continueResponse = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
    method: 'POST',
    signal: continueController.signal,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.primaryModel || 'hermes-q4',
      stream: false,
      temperature: 0,
      max_tokens: getMaxTokens(
        options.primaryModel,
        message,
        'continue',
        options.hardwareProfile || 'laptop'
      ),
      messages: [
        ...messages,
        {
          role: 'assistant',
          content: reply
        },
        {
          role: 'user',
          content: 'Tu respuesta anterior quedó cortada. NO repitas los archivos completos que ya entregaste. Regenera COMPLETO el archivo que quedó incompleto y después continúa con los archivos faltantes. Usa bloques separados.'
        }
      ]
    })
  });
  clearTimeout(continueTimeoutId);

  if (continueResponse.ok) {
    const continueData = await continueResponse.json();

    let extra =
      continueData?.choices?.[0]?.message?.content ||
      continueData?.choices?.[0]?.text ||
      '';

    extra = cleanReply(extra);

    reply = [safeReply, extra].filter(Boolean).join('\n\n').trim();
  }
}

if (!reply) {
  reply = 'No pude generar una respuesta válida.';
}

memory.addChatHistoryMessage('assistant', reply, options);

return reply;
}

function cleanGeneratedTitle(rawTitle, sourceText = '') {
  const genericMessages = [
    'hola',
    'buenas',
    'hey',
    'ola',
    'hello',
    'hi',
    'qué tal',
    'que tal'
  ];

  const normalizedSource = String(sourceText || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (
    !normalizedSource ||
    genericMessages.includes(normalizedSource) ||
    normalizedSource.length < 5
  ) {
    return 'Saludo inicial';
  }

  let title = String(rawTitle || '')
    .replace(/<\|.*?\|>/g, ' ')
    .replace(/end_of_text/gi, ' ')
    .replace(/begin_of_text/gi, ' ')
    .replace(/tool_call/gi, ' ')
    .replace(/tool/gi, ' ')
    .replace(/assistant/gi, ' ')
    .replace(/user/gi, ' ')
    .replace(/chat/gi, ' ')
    .replace(/texto base/gi, ' ')
    .replace(/título/gi, ' ')
    .replace(/titulo/gi, ' ')
    .replace(/respuesta/gi, ' ')
    .replace(/["'`´“”‘’]/g, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/[{}[\]();]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  title = title
    .split(' ')
    .filter(word => word.length > 1)
    .slice(0, 5)
    .join(' ')
    .trim();

  if (!title || title.length < 3) {
    return 'Nueva conversación';
  }

  return title.charAt(0).toUpperCase() + title.slice(1);
}

async function generateTitleFromText(text, type = 'chat', model = 'hermes-q4') {
  const normalizedText = String(text || '').trim();

  const prompt = `
Eres un generador de nombres para chats.

Responde SOLO con un título en español.
Máximo 5 palabras.
Sin comillas.
Sin signos raros.
Sin explicación.
Sin etiquetas.
Sin tokens.
No escribas "Texto base".
No escribas "Chat".
No escribas saludos como "Hola" si el mensaje solo es un saludo.

Si el mensaje es muy genérico, responde:
Nueva conversación

Mensaje:
${normalizedText}

Título:
`.trim();

  try {
    const response = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        stream: false,
        temperature: 0,
        max_tokens: 20,
        messages: [
          {
            role: 'system',
            content: 'Responde únicamente con un título corto en español. No agregues explicación.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      return cleanGeneratedTitle('', normalizedText);
    }

    const data = await response.json();

    const rawTitle =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      '';

    return cleanGeneratedTitle(rawTitle, normalizedText);
  } catch (error) {
    console.error('Error en generateTitleFromText:', error);
    return cleanGeneratedTitle('', normalizedText);
  }
}

module.exports =
{
  sendToLocalAI,
  generateTitleFromText
};