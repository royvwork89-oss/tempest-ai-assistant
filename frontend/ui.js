export function addMessage(chatBox, sender, text) {
  const row = document.createElement('div');
  row.className = `message-row ${sender === 'Tú' ? 'user' : 'bot'}`;

  const bubble = document.createElement('div');
  bubble.className = `message ${sender === 'Tú' ? 'user' : 'bot'}`;

  const label = document.createElement('div');
  label.className = 'message-label';
  label.textContent = sender;

  const content = document.createElement('div');
  content.className = 'message-content';

  renderMixedContent(content, text);

  const actions = renderMessageActions(sender, text);

  bubble.appendChild(label);
  bubble.appendChild(content);
  bubble.appendChild(actions);

  row.appendChild(bubble);
  chatBox.appendChild(row);

  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
}

function renderMessageActions(sender, text) {
  const actions = document.createElement('div');
  actions.className = 'message-actions';

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copiar';
  copyBtn.className = 'message-action-btn';

  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(String(text || ''));

      copyBtn.textContent = 'Copiado ✓';

      setTimeout(() => {
        copyBtn.textContent = 'Copiar';
      }, 1500);
    } catch (error) {
      copyBtn.textContent = 'Error';
      console.error('No se pudo copiar el mensaje:', error);
    }
  };

  actions.appendChild(copyBtn);

  if (sender === 'Tú') {
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.className = 'message-action-btn disabled-action';
    editBtn.disabled = true;

    actions.appendChild(editBtn);
  } else {
    const shareBtn = document.createElement('button');
    shareBtn.textContent = 'Compartir';
    shareBtn.className = 'message-action-btn disabled-action';
    shareBtn.disabled = true;

    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Intentarlo nuevamente';
    retryBtn.className = 'message-action-btn disabled-action';
    retryBtn.disabled = true;

    actions.appendChild(shareBtn);
    actions.appendChild(retryBtn);
  }

  return actions;
}

function renderMixedContent(container, text) {
  const lines = String(text || '').split('\n');

  let normalText = [];
  let codeLines = [];
  let insideCode = false;
  let language = 'código';
  let insideFileBlock = false;
  let fileBlockName = '';
  let fileBlockLines = [];

  function flushText() {
    const value = normalText.join('\n').trim();
    if (value) container.appendChild(renderText(value));
    normalText = [];
  }

  function flushCode() {
    const value = codeLines.join('\n').trim();
    if (!value) { codeLines = []; language = 'código'; return; }
    const segments = value.split(/(?=^(?:Archivo:\s*.+|[\w./\\-]+\.(js|ts|jsx|tsx|py|json|yaml|yml|css|html|sh|env|sql|md):)$)/m);
    if (segments.length > 1) {
      segments.forEach(segment => {
        const trimmed = segment.trim();
        if (!trimmed) return;
        const match = trimmed.match(/^Archivo:\s*(.+)\n([\s\S]*)$/);
        if (match) {
          const fileName = match[1].trim();
          const code = match[2].trim();
          const ext = fileName.split('.').pop().toLowerCase();
          container.appendChild(renderCodeBlock(code, ext || fileName));
        } else {
          container.appendChild(renderCodeBlock(trimmed, language));
        }
      });
    } else {
      container.appendChild(renderCodeBlock(value, language));
    }
    codeLines = [];
    language = 'código';
  }

  function flushFileBlock() {
    const value = fileBlockLines.join('\n').trim();
    if (value) {
      const ext = fileBlockName.split('.').pop().toLowerCase();
      container.appendChild(renderCodeBlock(value, ext || fileBlockName));
    }
    fileBlockLines = [];
    fileBlockName = '';
    insideFileBlock = false;
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Detectar inicio de bloque con backticks
    if (trimmed.startsWith('```')) {
      if (!insideCode) {
        if (insideFileBlock) flushFileBlock();
        flushText();
        insideCode = true;
        language = trimmed.replace(/```/g, '').trim() || 'código';
      } else {
        insideCode = false;
        flushCode();
      }
      continue;
    }

    if (insideCode) {
      codeLines.push(line);
      continue;
    }

    // Detectar "Archivo: nombre.ext" en texto plano
    const fileMatch = trimmed.match(/^Archivo:\s*(.+)$/);
    if (fileMatch) {
      flushText();
      if (insideFileBlock) flushFileBlock();
      insideFileBlock = true;
      fileBlockName = fileMatch[1].trim();
      continue;
    }

    if (insideFileBlock) {
      fileBlockLines.push(line);
    } else {
      normalText.push(line);
    }
  }

  if (insideCode) flushCode();
  if (insideFileBlock) flushFileBlock();
  flushText();
}

function renderText(text) {
  const container = document.createElement('div');
  container.className = 'normal-text';

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  parts.forEach(part => {
    if (part.match(urlRegex)) {
      const link = document.createElement('a');
      link.href = part;
      link.textContent = part;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      container.appendChild(link);
    } else {
      container.appendChild(document.createTextNode(part));
    }
  });

  return container;
}

function renderCodeBlock(code, language) {
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';

  const header = document.createElement('div');
  header.className = 'code-header';

  const lang = document.createElement('span');
  lang.textContent = language.toUpperCase();

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copiar';
  copyBtn.className = 'copy-btn';

  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(code);

      copyBtn.textContent = 'Copiado ✓';

      setTimeout(() => {
        copyBtn.textContent = 'Copiar';
      }, 1500);
    } catch (error) {
      copyBtn.textContent = 'Error';
      console.error('No se pudo copiar el código:', error);
    }
  };

  header.appendChild(lang);
  header.appendChild(copyBtn);

  const pre = document.createElement('pre');
  const codeEl = document.createElement('code');

  codeEl.textContent = code;
  pre.appendChild(codeEl);

  wrapper.appendChild(header);
  wrapper.appendChild(pre);

  return wrapper;
}

export function addDocumentCard(chatBox, documentData) {
  const row = document.createElement('div');
  row.className = 'message-row bot';

  const bubble = document.createElement('div');
  bubble.className = 'message bot';

  const label = document.createElement('div');
  label.className = 'message-label';
  label.textContent = 'Tempest';

  const card = document.createElement('div');
  card.className = 'document-card';

  const title = document.createElement('h3');
  title.textContent = '📄 Documento generado';

  const info = document.createElement('p');
  info.textContent = `${documentData.title || 'Documento'} · ${String(documentData.format || '').toUpperCase()}`;

  const preview = document.createElement('div');
  preview.className = 'document-preview';

  const previewText = String(documentData.previewText || '').trim();

  preview.textContent = previewText.length > 700
    ? previewText.slice(0, 700) + '...'
    : previewText;

  const actions = document.createElement('div');
  actions.className = 'document-actions';

  const viewBtn = document.createElement('a');
  viewBtn.textContent = 'Ver documento';
  viewBtn.className = 'document-btn';
  viewBtn.href = documentData.fileUrl;
  viewBtn.target = '_blank';
  viewBtn.rel = 'noopener noreferrer';

const downloadBtn = document.createElement('a');
downloadBtn.textContent = 'Descargar';
downloadBtn.className = 'document-btn primary';
downloadBtn.href = documentData.downloadUrl || documentData.fileUrl;
downloadBtn.target = '_blank';
downloadBtn.rel = 'noopener noreferrer';

if (documentData.filename) {
  downloadBtn.setAttribute('download', documentData.filename);
}

  actions.appendChild(viewBtn);
  actions.appendChild(downloadBtn);

  card.appendChild(title);
  card.appendChild(info);

  if (previewText) {
    card.appendChild(preview);
  }

  card.appendChild(actions);

  bubble.appendChild(label);
  bubble.appendChild(card);
  row.appendChild(bubble);
  chatBox.appendChild(row);

  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
}

/**
 * Crea la burbuja del bot vacía y devuelve una referencia
 * para ir escribiendo tokens en ella.
 * Retorna { row, rawEl } donde rawEl es el <pre> que recibe texto plano.
 */
export function createStreamingBubble(chatBox) {
  const row = document.createElement('div');
  row.className = 'message-row bot';

  const bubble = document.createElement('div');
  bubble.className = 'message bot';

  const label = document.createElement('div');
  label.className = 'message-label';
  label.textContent = 'Tempest';

  // Área de texto plano que crece con cada token
  const rawEl = document.createElement('pre');
  rawEl.className = 'streaming-raw';
  rawEl.style.cssText = [
    'white-space: pre-wrap',
    'word-break: break-word',
    'font-family: inherit',
    'margin: 0',
    'min-height: 1.2em'
  ].join(';');

  bubble.appendChild(label);
  bubble.appendChild(rawEl);
  row.appendChild(bubble);
  chatBox.appendChild(row);

  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });

  return { row, bubble, rawEl };
}

/**
 * Cuando el stream termina, reemplaza el <pre> de texto plano
 * por el renderizado final con bloques de código y acciones.
 */
export function finalizeStreamingBubble(bubble, rawEl, fullText) {
  const cleanText = fullText.replace(/<\|im_end\|>|<\|end_of_text\|>|<\|begin_of_text\|>|<\|eot_id\|>|<\|im_start\|>/g, '').trim();
  bubble.removeChild(rawEl);

  const content = document.createElement('div');
  content.className = 'message-content';
renderMixedContent(content, cleanText);

  const actions = renderMessageActions('Tempest', cleanText);

  bubble.appendChild(content);
  bubble.appendChild(actions);
}