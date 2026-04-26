export async function sendChatMessage(message, config) {
  const response = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      ...config
    })
  });

  if (!response.ok) {
    throw new Error('Error en la API');
  }

  return response.json();
}

export async function transcribeAudio(audioFile, options = {}) {
  const formData = new FormData();

  formData.append('audio', audioFile);
  formData.append('mode', options.mode || 'plain');
  formData.append('format', options.format || 'txt');

  const response = await fetch('/transcribe', {
    method: 'POST',
    body: formData
  });

  return response.json();
}