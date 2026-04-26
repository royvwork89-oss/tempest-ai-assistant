function cleanReply(text) {
  return text
    .replace(/<\|im_end\|>/g, '')
    .replace(/<\|eot_id\|>/g, '')
    .replace(/<\|end_of_text\|>/g, '')
    .replace(/<\|begin_of_text\|>/g, '')
    .replace(/<\|im_start\|>/g, '')
    .replace(/^assistant\s*/i, '')
    .replace(/^:+/g, '')
    .trim();
}

module.exports = cleanReply;