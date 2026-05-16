const TRUNCATION_NOTE = '\n[... contenido truncado por límite de contexto ...]';

/**
 * Dado un array de bloques { label, title, content, alwaysInclude, includeWhenMentioned, priority }
 * y las reglas del proyecto, devuelve los bloques que caben en el presupuesto.
 *
 * Orden de prioridad:
 *   1. alwaysInclude: true
 *   2. includeWhenMentioned: true  (y el nombre aparece en userMessage)
 *   3. resto (si hay espacio)
 */
function budget(blocks, rules, userMessage = '') {
  const {
    maxFilesPerRequest = 6,
    maxCharsTotal = 18000,
  } = rules;

  const mention = (block) => {
    if (!userMessage) return false;
    const msg = userMessage.toLowerCase();
    return (
      msg.includes(block.name?.toLowerCase()) ||
      msg.includes(block.relPath?.toLowerCase())
    );
  };

  const always   = blocks.filter(b => b.alwaysInclude);
  const mentioned = blocks.filter(b => !b.alwaysInclude && b.includeWhenMentioned && mention(b));
  const rest     = blocks.filter(b => !b.alwaysInclude && !(b.includeWhenMentioned && mention(b)));

  const ordered = [...always, ...mentioned, ...rest];

  const selected = [];
  let usedChars = 0;
  let usedFiles = 0;

  for (const block of ordered) {
    if (usedFiles >= maxFilesPerRequest) break;
    if (usedChars >= maxCharsTotal) break;

    const remaining = maxCharsTotal - usedChars;
    let content = block.content;

    if (content.length > remaining) {
      if (remaining < 200) break; // demasiado poco espacio
      content = content.slice(0, remaining - TRUNCATION_NOTE.length) + TRUNCATION_NOTE;
    }

    selected.push({ ...block, content });
    usedChars += content.length;
    usedFiles++;
  }

  return selected;
}

module.exports = { budget };

