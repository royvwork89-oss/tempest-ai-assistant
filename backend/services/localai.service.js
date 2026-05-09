const cleanReply = require('../utils/cleanReply');
const memory = require('./memory.service');
const { getCurrentTimeAnswer, getControlledMemoryAnswer, buildSystemPrompt } = require('./localai/memory.answers');
const { looksLikeCutReply, removeIncompleteFileBlock } = require('./localai/response.validator');
const { getMaxTokens } = require('./localai/token.profiles');

const DEFAULT_MEMORY_OPTIONS = {
  userId: memory.DEFAULT_USER_ID,
  projectId: memory.DEFAULT_PROJECT_ID,
  chatId: memory.DEFAULT_CHAT_ID
};

async function sendToLocalAI(message, options = DEFAULT_MEMORY_OPTIONS) {
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
  if (lowerMessage === 'hola' || lowerMessage === 'buenas' || lowerMessage === 'hey') {
    const name = fullMemory.profile?.name || 'Rogelio';
    const greeting = `Hola ${name}, ¿en qué puedo ayudarte?`;
    memory.addChatHistoryMessage('assistant', greeting, options);
    return greeting;
  }

  const chatHistory = memory.getChatHistory(options)
    .filter(msg => msg.content && msg.content.trim() !== '')
    .slice(-7, -1)
    .map(msg => ({ role: msg.role, content: msg.content }));

  const messages = [
    { role: 'system', content: buildSystemPrompt(fullMemory) },
    ...chatHistory,
    { role: 'user', content: message }
  ];

  console.log('HISTORIAL ENVIADO A LOCALAI:', messages);
  console.log('MODELO USADO:', options);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);

  const response = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
    method: 'POST',
    signal: controller.signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.primaryModel || 'hermes-q4',
      stream: false,
      temperature: 0,
      max_tokens: getMaxTokens(options.primaryModel, message, 'normal', options.hardwareProfile || 'laptop'),
      messages
    })
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error LocalAI: ${errorText}`);
  }

  const data = await response.json();
  console.log('RESPUESTA LOCALAI:', data);

  let reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || 'Sin respuesta';
  reply = cleanReply(reply);

  if (!reply) reply = 'No pude generar una respuesta válida.';

  if (looksLikeCutReply(reply)) {
    reply = removeIncompleteFileBlock(reply);

    const continueController = new AbortController();
    const continueTimeoutId = setTimeout(() => continueController.abort(), 300000);

    const continueResponse = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
      method: 'POST',
      signal: continueController.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.primaryModel || 'hermes-q4',
        stream: false,
        temperature: 0,
        max_tokens: getMaxTokens(options.primaryModel, message, 'continue', options.hardwareProfile || 'laptop'),
        messages: [
          ...messages,
          { role: 'assistant', content: reply },
          { role: 'user', content: 'Tu respuesta anterior quedó cortada. NO repitas los archivos completos que ya entregaste. Regenera COMPLETO el archivo que quedó incompleto y después continúa con los archivos faltantes. Usa bloques separados.' }
        ]
      })
    });

    clearTimeout(continueTimeoutId);

    if (continueResponse.ok) {
      const continueData = await continueResponse.json();
      const continueReply = cleanReply(continueData?.choices?.[0]?.message?.content || '');
      if (continueReply) reply = reply + '\n\n' + continueReply;
    }
  }

  memory.addChatHistoryMessage('assistant', reply, options);
  return reply;
}

function cleanGeneratedTitle(rawTitle, sourceText = '') {
  const genericMessages = ['hola', 'buenas', 'hey', 'ola', 'hello', 'hi', 'qué tal', 'que tal'];
  const normalizedSource = String(sourceText || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  if (!normalizedSource || genericMessages.includes(normalizedSource) || normalizedSource.length < 5)
    return 'Saludo inicial';

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
    .replace(/["'`´""'']/g, '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/[{}[\]();]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  title = title.split(' ').filter(word => word.length > 1).slice(0, 5).join(' ').trim();

  if (!title || title.length < 3) return 'Nueva conversación';
  return title.charAt(0).toUpperCase() + title.slice(1);
}

async function generateTitleFromText(text, type = 'chat', model = 'hermes-q4') {
  // Recortar el bloque de adjuntos para no confundir al modelo
  const cleanedText = String(text || '')
    .replace(/---\s*ARCHIVOS ADJUNTOS\s*---[\s\S]*/i, '')
    .trim()
    .slice(0, 300); // suficiente contexto, sin desperdiciar tokens

  if (!cleanedText) return 'Nueva conversación';

  try {
    const response = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        temperature: 0,
        max_tokens: 12,
        messages: [
          {
            role: 'system',
            content: 'Eres un generador de títulos. Responde ÚNICAMENTE con 2 a 4 palabras en español que resuman el mensaje. Sin comillas. Sin puntos. Sin explicación. Solo las palabras del título.'
          },
          {
            role: 'user',
            content: cleanedText
          }
        ]
      })
    });

    if (!response.ok) return cleanGeneratedTitle('', cleanedText);

    const data = await response.json();
    const rawTitle = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
    return cleanGeneratedTitle(rawTitle, cleanedText);
  } catch (error) {
    console.error('Error en generateTitleFromText:', error);
    return cleanGeneratedTitle('', cleanedText);
  }
}

module.exports = {
  sendToLocalAI,
  generateTitleFromText
};