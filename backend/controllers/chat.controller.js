const { sendToLocalAI } = require('../services/localai.service');

async function chat(req, res) {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'El mensaje está vacío'
      });
    }

    const reply = await sendToLocalAI(message);

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

module.exports = {
  chat
};