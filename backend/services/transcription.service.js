const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const FormData = require('form-data');
const axios = require('axios');
const execFileAsync = promisify(execFile);
const LOCALAI_TRANSCRIPTION_URL = 'http://localhost:8080/v1/audio/transcriptions';
const TRANSCRIPTION_MODEL = 'ggml-whisper-base.bin';
const CHUNK_SECONDS = 60; // 1 minuto
const OVERLAP_SECONDS = 5;
const chunksBaseDir = path.join(__dirname, '../uploads/chunks');
const outputsDir = path.join(__dirname, '../outputs/transcriptions');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');

async function getAudioDuration(audioPath) {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    audioPath
  ]);

  return Number(stdout.trim());
}

async function createChunks(audioPath, sessionDir) {
  await fsp.mkdir(sessionDir, { recursive: true });

  const duration = await getAudioDuration(audioPath);
  const chunks = [];

  let start = 0;
  let index = 1;

  while (start < duration) {
    const outputPath = path.join(
      sessionDir,
      `chunk-${String(index).padStart(3, '0')}.wav`
    );

    const length = Math.min(CHUNK_SECONDS + OVERLAP_SECONDS, duration - start);

    await execFileAsync('ffmpeg', [
      '-y',
      '-ss', String(start),
      '-i', audioPath,
      '-t', String(length),
      '-vn',
      '-ac', '1',
      '-ar', '16000',
      '-c:a', 'pcm_s16le',
      outputPath
    ]);

    chunks.push(outputPath);

    start += CHUNK_SECONDS;
    index++;
  }

  return chunks;
}

async function transcribeChunk(chunkPath) {
  const form = new FormData();

  form.append('file', fs.createReadStream(chunkPath));
  form.append('model', TRANSCRIPTION_MODEL);

  const response = await axios.post(LOCALAI_TRANSCRIPTION_URL, form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 0
  });

  const data = response.data;

  if (typeof data === 'string') {
    return data;
  }

  return data.text || data.transcription || '';
}

function formatTimestamp(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hrs, mins, secs]
    .map(unit => String(unit).padStart(2, '0'))
    .join(':');
}

function mergeTranscriptionsWithTimestamps(parts) {
  return parts
    .map((text, index) => {
      const cleanText = text.trim();

      if (!cleanText) return '';

      const timestamp = formatTimestamp(index * CHUNK_SECONDS);
      return `[${timestamp}]\n${cleanText}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function mergeTranscriptionsPlain(parts) {
  const joinedText = parts
    .map(text => text.trim())
    .filter(Boolean)
    .join(' ');

  return cleanTranscriptText(joinedText);
}

function cleanTranscriptText(text) {
  return text
    // Limpia espacios raros
    .replace(/\s+/g, ' ')

    // Agrega espacio después de punto, coma, pregunta, exclamación si falta
    .replace(/([.,!?¿¡])(?=\S)/g, '$1 ')

    // Quita espacios antes de signos
    .replace(/\s+([.,!?;:])/g, '$1')

    // Separa párrafos después de cierre de oración
    .replace(/([.!?])\s+/g, '$1\n\n')

    // Limpieza final
    .trim();
}

async function createPdfFile(outputPath, text) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(18).text('Transcripción', { align: 'center' });
    doc.moveDown();

    doc.fontSize(11).text(text, {
      align: 'left',
      lineGap: 4
    });

    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function createWordFile(outputPath, text) {
  const paragraphs = text.split('\n').map(line =>
    new Paragraph({
      children: [
        new TextRun({
          text: line || ' ',
          size: 22
        })
      ]
    })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Transcripción',
                bold: true,
                size: 32
              })
            ]
          }),
          ...paragraphs
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  await fsp.writeFile(outputPath, buffer);
}

async function processAudioTranscription(audioPath, options = {}) {
  const mode = options.mode || 'plain';
  const format = options.format || 'txt';

  const sessionName = `session-${Date.now()}`;
  const sessionDir = path.join(chunksBaseDir, sessionName);

  try {
    await fsp.mkdir(outputsDir, { recursive: true });

    console.log('Dividiendo audio en fragmentos...');
    const chunks = await createChunks(audioPath, sessionDir);

    const transcriptions = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(`Transcribiendo fragmento ${i + 1} de ${chunks.length}...`);

      try {
        const text = await transcribeChunk(chunks[i]);

        const cleanText = Buffer
          .from(text, 'utf8')
          .toString('utf8')
          .trim();

        transcriptions.push(cleanText);
      } catch (err) {
        console.error(`Error en fragmento ${i + 1}, se omite...`);
        transcriptions.push('');
      }
    }

    const finalTextWithTimestamps = mergeTranscriptionsWithTimestamps(transcriptions);
    const finalTextPlain = mergeTranscriptionsPlain(transcriptions);

    const selectedText =
      mode === 'timestamps'
        ? finalTextWithTimestamps
        : finalTextPlain;

    const timestamp = Date.now();
    let outputPath;

    if (format === 'txt') {
      outputPath = path.join(
        outputsDir,
        `transcription-${timestamp}-${mode}.txt`
      );

      await fsp.writeFile(outputPath, selectedText, 'utf8');
    }

    if (format === 'pdf') {
      outputPath = path.join(
        outputsDir,
        `transcription-${timestamp}-${mode}.pdf`
      );

      await createPdfFile(outputPath, selectedText);
    }

    if (format === 'docx') {
      outputPath = path.join(
        outputsDir,
        `transcription-${timestamp}-${mode}.docx`
      );

      await createWordFile(outputPath, selectedText);
    }

    if (!outputPath) {
      throw new Error(`Formato no soportado: ${format}`);
    }

    function toPublicUrl(filePath) {
      const relative = filePath.split('outputs')[1].replace(/\\/g, '/');
      return `/outputs${relative}`;
    }

    console.log('Archivo de transcripción generado:', outputPath);

    return {
      fileUrl: toPublicUrl(outputPath),
      filePath: outputPath,
      mode,
      format,
      message: 'Transcripción finalizada correctamente.'
    };

  } catch (error) {
    console.error('Error en processAudioTranscription:', error.response?.data || error);
    throw error;
  } finally {
    await fsp.rm(audioPath, { force: true }).catch(() => { });
    await fsp.rm(sessionDir, { recursive: true, force: true }).catch(() => { });
  }
}

module.exports = {
  processAudioTranscription
};