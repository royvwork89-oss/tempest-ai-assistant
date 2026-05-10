const { sendToLocalAI, streamToLocalAI, generateTitleFromText } = require('../services/localai.service');
const memory = require('../services/memory.service');
const {
  buildAttachmentContext,
  getAttachmentNames,
  cleanupFiles
} = require('../services/attachment.service');

function buildMemoryOptions(req) {
  return {
    userId: req.body?.userId || req.query?.userId || memory.DEFAULT_USER_ID,
    projectId: req.body?.projectId || req.query?.projectId || memory.DEFAULT_PROJECT_ID,
    chatId: req.body?.chatId || req.query?.chatId || memory.DEFAULT_CHAT_ID
  };
}

function isExplanationRequest(message) {
  const text = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const triggers = [
    'explicame', 'explica', 'que es', 'que son', 'como funciona',
    'como funcionan', 'cuentame', 'describeme', 'describe',
    'en que consiste', 'para que sirve', 'para que sirven',
    'que significa', 'defineme', 'define '
  ];
  return triggers.some(t => text.includes(t));
}

async function chat(req, res) {
  const files = req.files || [];

  try {
    const rawMessage = req.body?.message || '';

    if ((!rawMessage || !rawMessage.trim()) && files.length === 0) {
      return res.status(400).json({ ok: false, error: 'El mensaje está vacío' });
    }

    let config = req.body?.config || {};
    if (typeof config === 'string') {
      try { config = JSON.parse(config); } catch { config = {}; }
    }

    const rawTrimmed = rawMessage.trim();
    const userMessage = rawTrimmed
      ? (isExplanationRequest(rawTrimmed) && files.length === 0
        ? `Responde SOLO con texto explicativo, sin código. ${rawTrimmed}`
        : rawTrimmed)
      : 'Analiza los archivos adjuntos.';
    const memoryOptions = buildMemoryOptions(req);

    memory.detectUserData(userMessage, memoryOptions);

    const attachmentContext = await buildAttachmentContext(files);
    const attachmentNames = getAttachmentNames(files);

    const finalMessage = attachmentContext
      ? `${userMessage}\n\n${attachmentContext}`
      : userMessage;

    memory.addChatHistoryMessage('user', finalMessage, memoryOptions);

    if (attachmentContext) {
      memory.addMessage('user', attachmentContext, memoryOptions);
    }

    const streamOptions = {
      ...memoryOptions,
      primaryModel: config.primaryModel || 'hermes-q4',
      hardwareProfile: config.hardwareProfile || 'laptop'
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullReply = '';

    for await (const token of streamToLocalAI(finalMessage, streamOptions)) {
      if (token) {
        const safe = JSON.stringify(token);
        res.write(`data: ${safe}\n\n`);
      }
    }

    res.write(`data: [DONE] ${JSON.stringify({ attachments: attachmentNames })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error en chat.controller:', error);
    if (res.headersSent) {
      res.write(`data: [ERROR] ${error.message}\n\n`);
      res.end();
    } else {
      res.status(500).json({ ok: false, error: 'Error interno del servidor' });
    }

  } finally {
    cleanupFiles(files);
  }
}

function getChatHistory(req, res) {
  try {
    const history = memory.getChatHistory(buildMemoryOptions(req));
    return res.json({ ok: true, history });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).json({ ok: false, error: 'Error interno al obtener historial' });
  }
}

function listChats(req, res) {
  const chats = memory.listChats(buildMemoryOptions(req));
  res.json({ ok: true, chats });
}

function createChat(req, res) {
  const { chatId } = req.body;
  memory.createChat(chatId, buildMemoryOptions(req));
  res.json({ ok: true });
}

function deleteChat(req, res) {
  const { chatId } = req.body;
  memory.deleteChat(chatId, buildMemoryOptions(req));
  res.json({ ok: true });
}

function listProjects(req, res) {
  const projects = memory.listProjects(buildMemoryOptions(req));
  res.json({ ok: true, projects });
}

function createProject(req, res) {
  const { projectId } = req.body;
  memory.createProject(projectId, buildMemoryOptions(req));
  res.json({ ok: true });
}

function deleteProject(req, res) {
  const { projectId } = req.body;
  memory.deleteProject(projectId, buildMemoryOptions(req));
  res.json({ ok: true });
}

function renameChat(req, res) {
  try {
    const { oldChatId, newChatId } = req.body;
    if (!oldChatId || !newChatId) {
      return res.status(400).json({ ok: false, error: 'Faltan oldChatId o newChatId' });
    }
    memory.renameChat(oldChatId, newChatId, buildMemoryOptions(req));
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error al renombrar chat:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Error al renombrar chat' });
  }
}

function renameProject(req, res) {
  try {
    const { oldProjectId, newProjectId } = req.body;
    if (!oldProjectId || !newProjectId) {
      return res.status(400).json({ ok: false, error: 'Faltan oldProjectId o newProjectId' });
    }
    memory.renameProject(oldProjectId, newProjectId, buildMemoryOptions(req));
    return res.json({ ok: true });
  } catch (error) {
    console.error('Error al renombrar proyecto:', error);
    return res.status(500).json({ ok: false, error: error.message || 'Error al renombrar proyecto' });
  }
}

async function generateTitle(req, res) {
  try {
    const { text, type } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ ok: false, error: 'Texto vacío' });
    }
    const title = await generateTitleFromText(text, type || 'chat');
    return res.json({ ok: true, title });
  } catch (error) {
    console.error('Error generando título:', error);
    return res.status(500).json({ ok: false, error: 'Error generando título' });
  }
}

module.exports = {
  chat,
  getChatHistory,
  listChats,
  createChat,
  deleteChat,
  listProjects,
  createProject,
  deleteProject,
  renameChat,
  renameProject,
  generateTitle
};