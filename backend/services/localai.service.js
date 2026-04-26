const cleanReply = require('../utils/cleanReply');
const memory = require('./memory.service');

async function sendToLocalAI(message) {
  // detectar datos del usuario
  memory.detectUserData(message);

  // guardar mensaje del usuario
  memory.addMessage('user', message);


const fullMemory = memory.getFullMemory();
  // obtener memoria completa
const lowerMessage = message.toLowerCase();

function getCleanSummary(summary) {
  let clean = summary.replace('Datos del usuario: ', '');

  const parts = clean.split('.').map(s => s.trim()).filter(Boolean);
  const uniqueParts = [...new Set(parts)];

  return uniqueParts
    .map(p =>
      p
        .replace(/quiero/g, 'quieres')
        .replace(/estoy/g, 'estás')
    )
    .join(', ') + '.';
}

// 🧠 RESPUESTAS CONTROLADAS POR BACKEND

if (lowerMessage.includes('qué sabes de mí') || lowerMessage.includes('que sabes de mi')) {
  return fullMemory.summary ? getCleanSummary(fullMemory.summary) : 'No tengo suficiente información aún.';
}

if (lowerMessage.includes('qué me gusta') || lowerMessage.includes('que me gusta')) {
  return fullMemory.summary?.includes('me gusta')
    ? getCleanSummary(fullMemory.summary)
    : 'Aún no tengo información sobre tus gustos.';
}

if (lowerMessage.includes('qué quiero') || lowerMessage.includes('que quiero')) {
  return fullMemory.summary?.includes('quiero')
    ? getCleanSummary(fullMemory.summary)
    : 'Aún no tengo información sobre tus objetivos.';
}

if (lowerMessage.includes('en qué trabajo') || lowerMessage.includes('en que trabajo')) {
  return fullMemory.summary?.includes('trabajando')
    ? getCleanSummary(fullMemory.summary)
    : 'No tengo información sobre tu trabajo.';
}


if (
  lowerMessage === 'hola' ||
  lowerMessage === 'buenas' ||
  lowerMessage === 'hey'
) {
  return `Hola Rogelio, ¿en qué puedo ayudarte?`;
}

const dynamicSystemPrompt = `
Eres Tempest, una IA local con memoria activa.

REGLAS OBLIGATORIAS:

- NO saludes en cada respuesta
- NO repitas frases como "es un placer conocerte"
- NO reinicies la conversación
- NO actúes como si fuera la primera vez

- Responde directo y corto (máx 2 líneas)
- Usa SIEMPRE la memoria del usuario cuando exista

- El summary contiene la VERDAD del usuario.
- Cuando exista información en el summary, DEBES usarla obligatoriamente.
- NO puedes ignorarla bajo ninguna circunstancia.

- Si el usuario pregunta cosas como:
  - "¿Qué sabes de mí?"
  - "¿Qué me gusta?"
  - "¿Qué quiero?"
  - "¿En qué estoy trabajando?"
  - "¿Cómo prefiero que respondas?"

- En esos casos:
  - Responde directamente usando el summary.
  - NO des explicaciones.
  - NO hagas preguntas.
  - NO cambies de tema.

- Si el usuario saluda o conversa normalmente, responde de forma natural.
- Solo di "No tengo suficiente información aún." cuando el usuario pregunte explícitamente por datos de memoria que no existen.

- Si el usuario dio una preferencia, respétala siempre.

PROHIBIDO:
- respuestas largas
- ignorar memoria
- inventar datos
`;

  const profileContext = `
Información importante del usuario:
- Nombre: ${fullMemory.profile?.name || 'Desconocido'}
- Lugar de nacimiento: ${fullMemory.profile?.birthPlace || 'Desconocido'}
- Nacionalidad: ${fullMemory.profile?.nationality || 'Desconocido'}

Usa SIEMPRE esta información como la fuente principal de verdad.
Si hay conflicto con el historial, IGNORA el historial.
`;

  const summaryContext = `
Resumen acumulado de la conversación:
${fullMemory.summary || 'Sin resumen todavía.'}
`;

  const messages = [
    {
      role: 'system',
      content: dynamicSystemPrompt + '\n' + profileContext + '\n' + summaryContext
    },
    ...memory.getHistory().filter(msg => {
      const text = msg.content.toLowerCase();

      // eliminar mensajes viejos de identidad del usuario
      if (
        msg.role === 'user' &&
        (text.includes('me llamo') || text.includes('mi nombre es'))
      ) {
        return false;
      }

      // eliminar respuestas malas del assistant
      if (
          msg.role === 'assistant' &&
          (
            text.includes('no tengo memoria') ||
            text.includes('no tengo suficiente información') ||
            text.trim() === '//' ||
            text.trim() === ''
          )
        ) {
          return false;
        }

      return true;
    })
  ];

  console.log('HISTORIAL ENVIADO A LOCALAI:', messages);

  const response = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'hermes-q4',
      stream: false,
      temperature: 0,
      max_tokens: 120,
      messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error LocalAI: ${errorText}`);
  }

  const data = await response.json();
  console.log('RESPUESTA LOCALAI:', data);

  let reply =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    'Sin respuesta';

  reply = cleanReply(reply);

  if (!reply) {
    reply = 'Hola, ¿en qué puedo ayudarte?';
  }

  // guardar respuesta válida
  memory.addMessage('assistant', reply);

  return reply;
}

module.exports = { sendToLocalAI };