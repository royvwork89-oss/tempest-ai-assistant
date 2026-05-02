const { sendToLocalAI, generateTitleFromText } = require('../services/localai.service');
const memory = require('../services/memory.service');

function buildMemoryOptions(req) {
  return {
    userId: req.body?.userId || req.query?.userId || memory.DEFAULT_USER_ID,
    projectId: req.body?.projectId || req.query?.projectId || memory.DEFAULT_PROJECT_ID,
    chatId: req.body?.chatId || req.query?.chatId || memory.DEFAULT_CHAT_ID
  };
}

async function chat(req, res) {
  try {
    const { message, config = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'El mensaje está vacío'
      });
    }

    const memoryOptions = buildMemoryOptions(req);

    const reply = await sendToLocalAI(message, {
      ...memoryOptions,
      primaryModel: config.primaryModel || 'hermes-q4'
    });

    return res.json({
      ok: true,
      reply
    });

  } catch (error) {
    console.error('Error en chat.controller:', error);

    return res.status(500).json({
      ok: false,
      error: 'Error interno del servidor'
    });
  }
}

function getChatHistory(req, res) {
  try {
    const history = memory.getChatHistory(buildMemoryOptions(req));

    return res.json({
      ok: true,
      history
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);

    return res.status(500).json({
      ok: false,
      error: 'Error interno al obtener historial'
    });
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
      return res.status(400).json({
        ok: false,
        error: 'Faltan oldChatId o newChatId'
      });
    }

    memory.renameChat(oldChatId, newChatId, buildMemoryOptions(req));

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error al renombrar chat:', error);

    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al renombrar chat'
    });
  }
}

function renameProject(req, res) {
  try {
    const { oldProjectId, newProjectId } = req.body;

    if (!oldProjectId || !newProjectId) {
      return res.status(400).json({
        ok: false,
        error: 'Faltan oldProjectId o newProjectId'
      });
    }

    memory.renameProject(oldProjectId, newProjectId, buildMemoryOptions(req));

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error al renombrar proyecto:', error);

    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al renombrar proyecto'
    });
  }
}

async function generateTitle(req, res) {
  try {
    const { text, type } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'Texto vacío'
      });
    }

    const title = await generateTitleFromText(text, type || 'chat');

    return res.json({
      ok: true,
      title
    });
  } catch (error) {
    console.error('Error generando título:', error);

    return res.status(500).json({
      ok: false,
      error: 'Error generando título'
    });
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