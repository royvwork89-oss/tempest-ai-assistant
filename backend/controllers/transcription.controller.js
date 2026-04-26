const { processAudioTranscription } = require('../services/transcription.service');

async function transcribeAudio(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: 'No se recibió ningún archivo de audio'
      });
    }

    const transcription = await processAudioTranscription(req.file.path, {
      mode: req.body.mode || 'plain',
      format: req.body.format || 'txt'
    });

    return res.json({
      ok: true,
      transcription
    });
  } catch (error) {
    console.error('Error al transcribir audio:', error);

    return res.status(500).json({
      ok: false,
      error: 'Error al transcribir el audio'
    });
  }
}

module.exports = {
  transcribeAudio
};