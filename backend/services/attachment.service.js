const fs = require('fs');
const path = require('path');

const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.json',
  '.js',
  '.css',
  '.html',
  '.py',
  '.ts'
]);

const MAX_FILE_CHARS = 8000;
const MAX_TOTAL_CHARS = 24000;

function safeReadTextFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error('No se pudo leer archivo adjunto:', error);
    return '';
  }
}

function buildAttachmentContext(files = []) {
  if (!Array.isArray(files) || files.length === 0) return '';

  let totalChars = 0;

  const blocks = files.map((file, index) => {
    const originalName = file.originalname || `archivo-${index + 1}`;
    const ext = path.extname(originalName).toLowerCase();
    const sizeKb = Math.round((file.size || 0) / 1024);

    if (!TEXT_EXTENSIONS.has(ext)) {
      return [
        `Archivo ${index + 1}: ${originalName}`,
        `Tipo: ${file.mimetype || 'desconocido'}`,
        `Tamaño: ${sizeKb} KB`,
        `Nota: este archivo fue recibido, pero Tempest todavía no puede leer su contenido directamente.`
      ].join('\n');
    }

    let content = safeReadTextFile(file.path);

    if (!content.trim()) {
      return [
        `Archivo ${index + 1}: ${originalName}`,
        'Nota: el archivo parece estar vacío o no se pudo leer.'
      ].join('\n');
    }

    content = content.slice(0, MAX_FILE_CHARS);

    const remaining = MAX_TOTAL_CHARS - totalChars;
    if (remaining <= 0) {
      return [
        `Archivo ${index + 1}: ${originalName}`,
        'Nota: no se agregó contenido porque se alcanzó el límite total de texto adjunto.'
      ].join('\n');
    }

    content = content.slice(0, remaining);
    totalChars += content.length;

    return [
      `Archivo ${index + 1}: ${originalName}`,
      `Extensión: ${ext}`,
      'Contenido:',
      '```',
      content,
      '```'
    ].join('\n');
  });

  return [
    'CONTEXTO DE ARCHIVOS ADJUNTOS:',
    'El usuario adjuntó los siguientes archivos. Úsalos como contexto para responder.',
    '',
    blocks.join('\n\n---\n\n')
  ].join('\n');
}

module.exports = {
  buildAttachmentContext
};