const HARDWARE_TOKEN_PROFILES = {
  laptop: {
    default:             { normal: 500, code: 900,  continue: 900  },
    'qwen2.5-3b-q4':    { normal: 500, code: 900,  continue: 900  },
    'qwen2.5-3b-q5':    { normal: 600, code: 1000, continue: 1000 },
    'llama-3.2-3b-q4':  { normal: 600, code: 1000, continue: 1000 }
  },
  desktop: {
    default:             { normal: 400,  code: 800,  continue: 800  },
    'hermes-q4':         { normal: 400,  code: 700,  continue: 700  },
    'hermes-q5':         { normal: 500,  code: 800,  continue: 800  },
    'hermes-q6':         { normal: 600,  code: 900,  continue: 900  }
  }
};

function isCodeRequest(message) {
  return /archivo|archivos|genera|crea|código|codigo|función|funcion|proyecto|html|css|javascript|js|node|express|backend|frontend/i
    .test(String(message || ''));
}

function getMaxTokens(model, message, mode = 'general', hardwareProfile = 'laptop') {
  const selectedHardware = HARDWARE_TOKEN_PROFILES[hardwareProfile] ? hardwareProfile : 'laptop';
  const selectedModel = model || 'hermes-q4';
  const hardwareConfig = HARDWARE_TOKEN_PROFILES[selectedHardware];
  const modelConfig = hardwareConfig[selectedModel] || hardwareConfig.default;

  if (mode === 'continue') return modelConfig.continue;
  if (mode === 'coder') return modelConfig.code;
  if (mode === 'explain') return modelConfig.normal;
  // general o legacy: fallback al regex anterior
  if (isCodeRequest(message)) return modelConfig.code;
  return modelConfig.normal;
}

module.exports = {
  HARDWARE_TOKEN_PROFILES,
  isCodeRequest,
  getMaxTokens
};