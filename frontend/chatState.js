const chatState = {
  userId: 'local-user',
  projectId: 'general',
  chatId: null,
  mode: 'landing'
};

export function getChatState() {
  return { ...chatState };
}

export function setActiveChat({ projectId, chatId, mode = 'chat' }) {
  chatState.projectId = projectId || 'general';
  chatState.chatId = chatId || null;
  chatState.mode = mode;
}

export function getMemoryPayload() {
  return {
    userId: chatState.userId,
    projectId: chatState.projectId,
    chatId: chatState.chatId || 'default'
  };
}

export function getMemoryQuery() {
  const params = new URLSearchParams({
    userId: chatState.userId,
    projectId: chatState.projectId,
    chatId: chatState.chatId || 'default'
  });

  return params.toString();
}