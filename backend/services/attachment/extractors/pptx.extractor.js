/**
 * Extractor PPTX para Tempest
 * Contrato de salida: { name, type, content, truncated, original, meta }
 *
 * v1 — orden por número de slide, notas del presentador ON por defecto
 * v2 (futuro) — orden real vía ppt/presentation.xml
 */

const path = require('path');
const unzipper = require('unzipper');

// ─── Helpers XML ──────────────────────────────────────────────────────────────

/**
 * Extrae todos los textos de nodos <a:t> de un fragmento XML.
 * Cubre texto normal, runs partidos y celdas de tabla.
 */
function collectTextNodes(xml) {
  const matches = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
  return matches.map(m => m[1].trim()).filter(Boolean);
}

/**
 * Intenta formatear tablas (<a:tbl>) como texto estructurado con |.
 * Si falla, devuelve null para que el llamador use collectTextNodes como fallback.
 */
function extractTables(xml) {
  const tableMatches = [...xml.matchAll(/<a:tbl>([\s\S]*?)<\/a:tbl>/g)];
  if (tableMatches.length === 0) return null;

  const rows = [];

  for (const tableMatch of tableMatches) {
    const tableXml = tableMatch[1];
    const rowMatches = [...tableXml.matchAll(/<a:tr>([\s\S]*?)<\/a:tr>/g)];

    for (const rowMatch of rowMatches) {
      const cellMatches = [...rowMatch[1].matchAll(/<a:tc>([\s\S]*?)<\/a:tc>/g)];
      const cells = cellMatches.map(cell => {
        const texts = collectTextNodes(cell[1]);
        return texts.join(' ').trim();
      });
      if (cells.some(c => c.length > 0)) {
        rows.push('| ' + cells.join(' | ') + ' |');
      }
    }
  }

  return rows.length > 0 ? rows.join('\n') : null;
}

/**
 * Extrae texto legible de un XML de diapositiva o notas.
 * Prioriza tablas formateadas; el resto como texto plano.
 */
function extractTextFromXml(xml) {
  const parts = [];

  // Texto fuera de tablas
  // Eliminar bloques de tabla del XML para no duplicar texto
  const xmlWithoutTables = xml.replace(/<a:tbl>[\s\S]*?<\/a:tbl>/g, '');
  const plainTexts = collectTextNodes(xmlWithoutTables);
  if (plainTexts.length > 0) {
    parts.push(plainTexts.join(' '));
  }

  // Tablas formateadas
  const tableText = extractTables(xml);
  if (tableText) {
    parts.push(tableText);
  }

  return parts.join('\n').trim();
}

// ─── Validación ZIP ───────────────────────────────────────────────────────────

const fs = require('fs');

function isValidZip(filePath) {
  try {
    const buf = Buffer.alloc(4);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    // Magic bytes ZIP: PK (0x50 0x4B)
    return buf[0] === 0x50 && buf[1] === 0x4B;
  } catch {
    return false;
  }
}

// ─── Extractor principal ──────────────────────────────────────────────────────

/**
 * @param {object} file        Objeto multer { originalname, path, size, mimetype }
 * @param {object} options
 * @param {boolean} [options.includeNotes=true]  Incluir notas del presentador
 * @param {Function} truncateFn  Función truncateDocument de attachment.service.js
 * @returns {{ name, type, content, truncated, original, meta }}
 */
async function extractPptx(file, options, truncateFn) {
  const name = file.originalname;
  const { includeNotes = true } = options || {};

  // Validación magic bytes
  if (!isValidZip(file.path)) {
    return {
      name,
      type: 'pptx',
      content: `[Error: el archivo "${name}" no es un ZIP/PPTX válido.]`,
      truncated: false,
      original: 0,
      meta: { slides: 0, hasNotes: false }
    };
  }

  try {
    const zip = await unzipper.Open.file(file.path);

    // ── Recopilar slides ──────────────────────────────────────────────────────
    const slideEntries = zip.files
      .filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f.path))
      .sort((a, b) => {
        const n = p => parseInt(p.match(/slide(\d+)/)[1]);
        return n(a.path) - n(b.path);
      });

    // ── Recopilar notas ───────────────────────────────────────────────────────
    const notesMap = {};
    if (includeNotes) {
      const notesEntries = zip.files
        .filter(f => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(f.path));

      for (const entry of notesEntries) {
        const num = parseInt(entry.path.match(/notesSlide(\d+)/)[1]);
        notesMap[num] = entry;
      }
    }

    if (slideEntries.length === 0) {
      return {
        name,
        type: 'pptx',
        content: '[Sin diapositivas legibles en el archivo PPTX.]',
        truncated: false,
        original: 0,
        meta: { slides: 0, hasNotes: false }
      };
    }

    // ── Procesar cada slide ───────────────────────────────────────────────────
    const slideBlocks = [];
    let hasNotes = false;

    for (const entry of slideEntries) {
      const slideNum = parseInt(entry.path.match(/slide(\d+)/)[1]);

      try {
        const buffer = await entry.buffer();
        const xml = buffer.toString('utf-8');
        const slideText = extractTextFromXml(xml);

        const block = [`### Diapositiva ${slideNum}`];

        if (slideText) {
          block.push(slideText);
        } else {
          block.push('[Sin texto en esta diapositiva]');
        }

        // Notas del presentador
        if (includeNotes && notesMap[slideNum]) {
          try {
            const notesBuf = await notesMap[slideNum].buffer();
            const notesXml = notesBuf.toString('utf-8');
            const notesText = extractTextFromXml(notesXml);

            // Las notas de PPTX incluyen el texto del slide repetido; filtrar duplicados
            const slideLines = new Set((slideText || '').split('\n').map(l => l.trim()).filter(Boolean));
            const filteredNotes = (notesText || '')
              .split('\n')
              .map(l => l.trim())
              .filter(l => l && !slideLines.has(l))
              .join('\n');

            if (filteredNotes) {
              block.push(`#### Notas`);
              block.push(filteredNotes);
              hasNotes = true;
            }
          } catch {
            // Si las notas de esta slide fallan, continuar sin ellas
          }
        }

        slideBlocks.push(block.join('\n'));

      } catch (slideErr) {
        // Si una slide falla, registrar y continuar
        slideBlocks.push(`### Diapositiva ${slideNum}\n[Error al leer esta diapositiva: ${slideErr.message}]`);
      }
    }

    const raw = slideBlocks.join('\n\n');
    const { text, truncated, original } = truncateFn(raw);

    return {
      name,
      type: 'pptx',
      content: text,
      truncated: truncated || false,
      original: original || raw.length,
      meta: {
        slides: slideEntries.length,
        hasNotes
      }
    };

  } catch (err) {
    return {
      name,
      type: 'pptx',
      content: `[Error al procesar el archivo PPTX "${name}": ${err.message}]`,
      truncated: false,
      original: 0,
      meta: { slides: 0, hasNotes: false }
    };
  }
}

module.exports = { extractPptx };