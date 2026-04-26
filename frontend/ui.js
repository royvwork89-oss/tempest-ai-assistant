export function addMessage(chatBox, sender, text) {
  const row = document.createElement('div');
  row.className = `message-row ${sender === 'Tú' ? 'user' : 'bot'}`;

  const bubble = document.createElement('div');
  bubble.className = `message ${sender === 'Tú' ? 'user' : 'bot'}`;

  const label = document.createElement('div');
  label.className = 'message-label';
  label.textContent = sender;

  const content = document.createElement('div');
  const urlRegex = /(https?:\/\/[^\s]+)/g;
const parts = text.split(urlRegex);

parts.forEach(part => {
  if (urlRegex.test(part)) {
    const link = document.createElement('a');
    link.href = part;
    link.textContent = part;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    content.appendChild(link);
  } else {
    content.appendChild(document.createTextNode(part));
  }
});

  bubble.appendChild(label);
  bubble.appendChild(content);
  row.appendChild(bubble);
  chatBox.appendChild(row);

  chatBox.scrollTo({
  top: chatBox.scrollHeight,
  behavior: 'smooth'
});
}