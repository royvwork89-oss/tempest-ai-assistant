import { getMemoryPayload, getMemoryQuery } from './chatState.js';

export async function sendChatMessage(message, config) {
  const response = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      ...config,
      ...getMemoryPayload()
    })
  });

  if (!response.ok) {
    throw new Error('Error en la API');
  }

  return response.json();
}

export async function getChatHistory() {
  const response = await fetch(`/chat/history?${getMemoryQuery()}`);

  if (!response.ok) {
    throw new Error('Error obteniendo historial');
  }

  return response.json();
}

export async function listChats(projectId = 'tempest') {
  const response = await fetch(`/chats?projectId=${encodeURIComponent(projectId)}`);
  return response.json();
}

export async function createChat(chatId, projectId = 'tempest') {
  const response = await fetch('/chat/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId,
      projectId
    })
  });

  return response.json();
}

export async function deleteChat(chatId, projectId = 'tempest') {
  const response = await fetch('/chat/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId,
      projectId
    })
  });

  return response.json();
}

export async function renameChat(oldChatId, newChatId, projectId = 'general') {
  const response = await fetch('/chat/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      oldChatId,
      newChatId,
      projectId
    })
  });

  return response.json();
}

export async function renameProject(oldProjectId, newProjectId) {
  const response = await fetch('/project/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      oldProjectId,
      newProjectId
    })
  });

  return response.json();
}

export async function listProjects() {
  const response = await fetch('/projects');
  return response.json();
}

export async function createProject(projectId) {
  const response = await fetch('/project/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId })
  });

  return response.json();
}

export async function deleteProject(projectId) {
  const response = await fetch('/project/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId })
  });

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

export async function generateTitle(text, type = 'chat') {
  const response = await fetch('/title/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, type })
  });

  return response.json();
}