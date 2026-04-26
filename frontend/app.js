import { sendChatMessage, transcribeAudio } from './api.js';
import { addMessage } from './ui.js';

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const typing = document.getElementById('typing');

const menuTrigger = document.getElementById('menuTrigger');
const smartMenuPanel = document.getElementById('smartMenuPanel');

const menuViewRoot = document.getElementById('menuViewRoot');
const menuViewLocal = document.getElementById('menuViewLocal');
const menuViewServices = document.getElementById('menuViewServices');
const menuViewOpenAI = document.getElementById('menuViewOpenAI');
const menuViewGoogle = document.getElementById('menuViewGoogle');

const toolMenuBtn = document.getElementById('toolMenuBtn');
const toolMenuPanel = document.getElementById('toolMenuPanel');


let primaryModel = 'hermes-q4';

const assistantsState = {
  openai: {
    enabled: false,
    model: null
  },
  google: {
    enabled: false,
    model: null
  }
};

function showMenuView(viewName) {
  [
    menuViewRoot,
    menuViewLocal,
    menuViewServices,
    menuViewOpenAI,
    menuViewGoogle
  ].forEach(view => view.classList.add('hidden'));

  if (viewName === 'root') menuViewRoot.classList.remove('hidden');
  if (viewName === 'local') menuViewLocal.classList.remove('hidden');
  if (viewName === 'services') menuViewServices.classList.remove('hidden');
  if (viewName === 'openai') menuViewOpenAI.classList.remove('hidden');
  if (viewName === 'google') menuViewGoogle.classList.remove('hidden');
}

function getLabel(model) {
  const labels = {
    'hermes-q4': 'Hermes Q4',
    'hermes-q5': 'Hermes Q5',
    'hermes-q6': 'Hermes Q6',
    'qwen_qwen3.5-0.8b': 'Qwen 0.8B',
    'mistral-7b': 'Mistral 7B',
    'auto': 'Automático',
    'gpt-4o-mini': 'GPT-4o-mini',
    'gpt-4.1-mini': 'GPT-4.1-mini',
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-2.5-pro': 'Gemini 2.5 Pro'
  };

  return labels[model] || model;
}

function updateMenuTriggerLabel() {
  let label = `modelo: ${getLabel(primaryModel)}`;

  const activeServices = [];

  if (assistantsState.openai.enabled) {
    activeServices.push('OpenAI');
  }

  if (assistantsState.google.enabled) {
    activeServices.push('Google');
  }

  if (activeServices.length > 0) {
    label += ' + ' + activeServices.join(' + ');
  }

  menuTrigger.textContent = label;
}

function refreshLocalActiveState() {
  document.querySelectorAll('.local-model').forEach(btn => {
    btn.classList.remove('active');

    if (btn.dataset.model === primaryModel) {
      btn.classList.add('active');
    }
  });
}

function refreshServiceActiveState() {
  document.querySelectorAll('.service-entry').forEach(btn => {
    const service = btn.dataset.service;
    btn.classList.remove('selected-support');

    if (assistantsState[service].enabled) {
      btn.classList.add('selected-support');
    }
  });

  document.querySelectorAll('.service-model').forEach(btn => {
    const service = btn.dataset.service;
    const model = btn.dataset.model;

    btn.classList.remove('active');

    if (
      assistantsState[service].enabled &&
      assistantsState[service].model === model
    ) {
      btn.classList.add('active');
    }
  });
}

menuTrigger.addEventListener('click', () => {
  smartMenuPanel.classList.toggle('hidden');
  showMenuView('root');
});

document.querySelectorAll('[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    showMenuView(btn.dataset.view);
  });
});

document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => {
    showMenuView(btn.dataset.back);
  });
});

document.querySelectorAll('.local-model').forEach(btn => {
  btn.addEventListener('click', () => {
    primaryModel = btn.dataset.model;
    updateMenuTriggerLabel();
    refreshLocalActiveState();
    smartMenuPanel.classList.add('hidden');
  });
});

document.querySelectorAll('.service-entry').forEach(btn => {
  btn.addEventListener('click', () => {
    const service = btn.dataset.service;

    if (service === 'openai') showMenuView('openai');
    if (service === 'google') showMenuView('google');
  });
});

document.querySelectorAll('.service-model').forEach(btn => {
  btn.addEventListener('click', () => {
    const service = btn.dataset.service;
    const model = btn.dataset.model;

    if (
      assistantsState[service].enabled &&
      assistantsState[service].model === model
    ) {
      assistantsState[service].enabled = false;
      assistantsState[service].model = null;
    } else {
      assistantsState[service].enabled = true;
      assistantsState[service].model = model;
    }

    refreshServiceActiveState();
    updateMenuTriggerLabel();
    smartMenuPanel.classList.add('hidden');
  });
});

const transcriptionBtn = document.getElementById('transcriptionBtn');
const transcriptionModal = document.getElementById('transcriptionModal');
const transcriptionAudioInput = document.getElementById('transcriptionAudioInput');
const transcriptionMode = document.getElementById('transcriptionMode');
const transcriptionFormat = document.getElementById('transcriptionFormat');
const cancelTranscriptionBtn = document.getElementById('cancelTranscriptionBtn');
const processTranscriptionBtn = document.getElementById('processTranscriptionBtn');

function getAssistants() {
  return [
    {
      provider: 'openai',
      enabled: assistantsState.openai.enabled,
      model: assistantsState.openai.model
    },
    {
      provider: 'google',
      enabled: assistantsState.google.enabled,
      model: assistantsState.google.model
    }
  ];
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  const config = {
    primaryModel,
    assistants: getAssistants()
  };

  addMessage(chatBox, 'Tú', message);
  userInput.value = '';
  typing.textContent = 'Tempest está pensando...';
  sendBtn.disabled = true;
  userInput.disabled = true;

  try {
    const data = await sendChatMessage(message, config);

    if (data.ok) {
      addMessage(chatBox, 'Tempest', data.reply);
    } else {
      addMessage(chatBox, 'Tempest', 'Ocurrió un error: ' + (data.error || 'Desconocido'));
    }
  } catch (error) {
    addMessage(chatBox, 'Tempest', 'No pude conectar con el backend.');
    console.error(error);
  } finally {
    typing.textContent = '';
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }
}

sendBtn.addEventListener('click', sendMessage);

toolMenuBtn.addEventListener('click', () => {
  toolMenuPanel.classList.toggle('hidden');
});

transcriptionBtn.addEventListener('click', () => {
  toolMenuPanel.classList.add('hidden');
  transcriptionModal.classList.remove('hidden');
});

cancelTranscriptionBtn.addEventListener('click', () => {
  transcriptionModal.classList.add('hidden');
});

processTranscriptionBtn.addEventListener('click', async () => {
  const file = transcriptionAudioInput.files[0];

  if (!file) {
    alert('Selecciona un audio');
    return;
  }

  transcriptionModal.classList.add('hidden');

  typing.textContent = 'Transcribiendo audio...';
  sendBtn.disabled = true;
  transcriptionBtn.disabled = true;
  userInput.disabled = true;

  try {
    const data = await transcribeAudio(file, {
      mode: transcriptionMode.value,
      format: transcriptionFormat.value
    });

    if (!data.ok) {
      addMessage(chatBox, 'Tempest', 'Error al transcribir audio');
      return;
    }

    const fileUrl = data.transcription.fileUrl;

    const finalUrl = `${window.location.origin}${fileUrl}`;

    addMessage(
      chatBox,
      'Tempest',
      `Transcripción lista.

Abrir archivo:
${finalUrl}

Ubicación en Windows:
${data.transcription.filePath}

¿Quieres que analice la transcripción?`
    );

  } catch (error) {
    console.error(error);
    addMessage(chatBox, 'Tempest', 'Error procesando audio');
  } finally {
    typing.textContent = '';
    sendBtn.disabled = false;
    transcriptionBtn.disabled = false;
    userInput.disabled = false;
    transcriptionAudioInput.value = '';
    userInput.focus();
  }
});

userInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

updateMenuTriggerLabel();
showMenuView('root');
refreshLocalActiveState();
refreshServiceActiveState();

addMessage(
  chatBox,
  'Tempest',
  'Hola, soy Tempest, una inteligencia artificial local de asistencia en español. ¿En qué puedo ayudarte hoy?'
);