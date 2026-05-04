const path = require('path');
const { generateTitleFromText } = require('../services/localai.service');

const {
  buildDocumentPrompt,
  createDocumentFile,
  getDocumentPath,
  documentExists,
  normalizeFormat
} = require('../services/document.service');

function getFallbackDocumentModel(hardwareProfile = 'laptop') {
  if (hardwareProfile === 'desktop') return 'hermes-q5';
  return 'qwen2.5-3b-q4';
}

async function generateDocumentContent({ prompt, format, model }) {
  const documentPrompt = buildDocumentPrompt({
    prompt,
    format
  });

  const response = await fetch('http://127.0.0.1:8080/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      temperature: 0,
      max_tokens: 900,
      messages: [
        {
          role: 'system',
          content: [
            'Eres un redactor profesional de documentos en español.',
            'Escribe documentos claros, limpios y bien formateados.',
            'Usa ortografía correcta, acentos correctos y puntuación correcta.',
            'Usa párrafos separados con líneas en blanco.',
            'No repitas instrucciones.',
            'No copies literalmente la petición del usuario.',
            'No uses markdown.',
            'No uses bloques de código.',
            'No agregues palabras sueltas al final.',
            'Responde solo con el contenido final del documento.'
          ].join('\n')
        },
        {
          role: 'user',
          content: documentPrompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error LocalAI documento: ${errorText}`);
  }

  const data = await response.json();

  return data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
}

async function generateDocument(req, res) {
  try {
    const {
      prompt,
      format = 'txt',
      config = {}
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'La instrucción del documento está vacía'
      });
    }

    const finalFormat = normalizeFormat(format);

    const selectedModel =
      config.primaryModel ||
      getFallbackDocumentModel(config.hardwareProfile);

    console.log('MODELO DOCUMENTO USADO:', selectedModel);

    const content = await generateDocumentContent({
      prompt,
      format: finalFormat,
      model: selectedModel
    });

    const generatedTitle = await generateTitleFromText(
      prompt,
      'document',
      selectedModel
    );

    const documentFile = await createDocumentFile({
      title: generatedTitle || 'Documento Tempest',
      content,
      format: finalFormat
    });

    return res.json({
      ok: true,
      document: documentFile
    });

  } catch (error) {
    console.error('Error generando documento:', error);

    return res.status(500).json({
      ok: false,
      error: 'Error interno al generar documento'
    });
  }
}

function viewDocument(req, res) {
  try {
    const { filename } = req.params;

    if (!documentExists(filename)) {
      return res.status(404).send('Documento no encontrado');
    }

    const filePath = getDocumentPath(filename);
    const ext = path.extname(filename).toLowerCase();

    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      return res.sendFile(filePath);
    }

    if (ext === '.txt') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.sendFile(filePath);
    }

    if (ext === '.docx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      return res.sendFile(filePath);
    }

    return res.sendFile(filePath);

  } catch (error) {
    console.error('Error mostrando documento:', error);
    return res.status(500).send('Error mostrando documento');
  }
}

function downloadDocument(req, res) {
  try {
    const { filename } = req.params;

    if (!documentExists(filename)) {
      return res.status(404).send('Documento no encontrado');
    }

    const filePath = getDocumentPath(filename);

    return res.download(filePath, filename);

  } catch (error) {
    console.error('Error descargando documento:', error);
    return res.status(500).send('Error descargando documento');
  }
}

module.exports = {
  generateDocument,
  viewDocument,
  downloadDocument
};