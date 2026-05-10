# Arquitectura - Tempest

## 🧩 Visión general

Tempest es un asistente local de IA con arquitectura cliente-servidor, frontend web, backend Node.js/Express, motor LocalAI y persistencia basada en archivos JSON.

```text
Usuario → Frontend → Backend → Modo Router → Memoria/Servicios → LocalAI → Backend (SSE) → Frontend
```

---

## 🔧 Componentes principales

### Frontend

- Interfaz de chat tipo ChatGPT.
- Sidebar con chats independientes y proyectos.
- Menú de modelos locales (Q4/Q5/Q6) y servicios externos.
- Menú de herramientas con transcripción y adjuntos.
- Chips visuales de archivos adjuntos con drag & drop.
- Modales para transcripción, eliminación, creación de proyectos y renombrado.
- Estado activo del chat mediante `chatState.js`.
- Comunicación HTTP con el backend mediante `fetch` / `FormData`.
- **Streaming de respuesta** — `createStreamingBubble` crea burbuja vacía, `finalizeStreamingBubble` renderiza el resultado final con limpieza de stop tokens.
- Renderizado de respuestas con acciones por mensaje.
- **Botones de acción con íconos SVG** — visibles al hover, sin interferir con selección de texto.
- Separación automática de múltiples archivos en bloques individuales.
- Modo selección para eliminación múltiple de chats independientes.
- Input multilínea autoexpandible.
- **Área de entrada con flexbox** — textarea arriba, barra de herramientas fija abajo (+ izquierda, enviar derecha).
- **Botón enviar con ícono de avión de papel** dentro del área de entrada.
- Validación de nombres de chats y proyectos.

### Backend

- API REST con Express.
- Controladores para chat y transcripción.
- **Streaming SSE** en `chat.controller.js` — usa `Content-Type: text/event-stream` y reenvía tokens con `res.write()`.
- **Router de modos** en `services/mode.router.js` — detecta `coder/strict`, `coder/hybrid`, `explain`, `general`.
- Servicios separados para LocalAI, memoria, transcripción y adjuntos.
- Persistencia por archivos JSON.
- Endpoints para crear, listar, renombrar y eliminar chats/proyectos.
- Endpoint para generación automática de títulos.
- multer para recepción de archivos (hasta 8, máx 10MB cada uno).
- Job escoba para limpieza de temporales cada 6h.

### Motor IA

- LocalAI ejecutando modelos GGUF para chat (Q4, Q5, Q6) con `stream: true`.
- `streamToLocalAI` — AsyncGenerator que hace `yield` de cada token recibido.
- Modelo Whisper vía LocalAI para transcripción de audio.
- Generación auxiliar de títulos cortos para chats (sin stream, `max_tokens: 12`).

---

## 🎯 Router de modos

```text
chat.controller.js
↓ detectMode({ rawMessage, files, configMode })
↓
services/mode.router.js
↓ { mode, variant, reason }
↓
chat.controller.js
↓ buildPrefixedMessage(rawMessage, mode, variant)
↓ streamOptions.mode = mode
↓
localai.service.js
↓ getMaxTokens(model, message, options.mode, hardwareProfile)
```

### Modos
| Modo | Variant | Comportamiento |
|------|---------|----------------|
| `coder` | `strict` | Solo código, tokens máximos |
| `coder` | `hybrid` | Explicación breve + código |
| `explain` | `null` | Solo texto, tokens normales |
| `general` | `null` | Sin modificación |

---

## 🧠 Sistema multi-contexto

```text
Usuario
└── Proyecto
    └── Chat
```

- Cada chat tiene su propio historial y memoria de trabajo.
- Un chat no puede leer el historial de otro chat.
- Un chat dentro de proyecto accede a su memoria + memoria del proyecto + perfil global.
- Un chat sin proyecto pertenece al proyecto especial `general`.

---

## 📎 Sistema de adjuntos

### Flujo

```text
frontend/modules/attachments.js  ← chips visuales, drag & drop
↓
frontend/api.js  ← FormData cuando hay archivos, JSON cuando no
↓
backend/routes/chat.routes.js  ← multer recibe hasta 8 archivos en uploads/attachments/
↓
backend/controllers/chat.controller.js  ← detectMode, buildAttachmentContext
↓
backend/services/attachment.service.js  ← extracción de texto por tipo
↓
prompt inyectado a LocalAI como bloque --- ARCHIVOS ADJUNTOS ---
```

### Extracción por tipo

| Tipo | Librería | Observaciones |
|------|----------|---------------|
| PDF | pdf2json | pdf-parse y pdfjs-dist descartados por bugs de exports |
| DOCX | mammoth | extracción de texto plano |
| XLSX | xlsx | conversión por hoja a CSV etiquetado |
| TXT/código | fs.readFile | truncado inteligente preservando cabecera e imports |
| Imágenes | — | placeholder con metadata, sin análisis visual |

---

## 🌊 Sistema de streaming

### Flujo completo

```text
frontend/app.js
↓ createStreamingBubble(chatBox) → { bubble, rawEl }
↓
api.js → fetch POST /chat
↓ ReadableStream reader
↓ onToken(token) → rawEl.textContent += token
↓
backend/controllers/chat.controller.js
↓ detectMode → mode/variant/reason
↓ buildPrefixedMessage → userMessage
↓ res.setHeader('Content-Type', 'text/event-stream')
↓ for await (token of streamToLocalAI(...))
↓ res.write(`data: ${JSON.stringify(token)}\n\n`)
↓
services/localai.service.js → streamToLocalAI (async generator)
↓ fetch LocalAI con stream: true
↓ getMaxTokens con options.mode
↓ ReadableStream → yield token
↓
LocalAI genera tokens individuales
↓
res.write('data: [DONE] {...}\n\n') → res.end()
↓
frontend: finalizeStreamingBubble(bubble, rawEl, fullText)
↓ limpia stop tokens con regex /<\|...\|>/g
↓ renderMixedContent → bloques de código, links, acciones
```

---

## 📦 Estructura real del proyecto

```text
Tempest/
├── backend/
│   ├── config/
│   │   └── systemPrompt.js
│   ├── controllers/
│   │   ├── chat.controller.js
│   │   └── transcription.controller.js
│   ├── data/
│   │   └── users/
│   │       └── local-user/
│   │           ├── profile.json
│   │           └── projects/
│   │               ├── general/
│   │               │   ├── projectMemory.json
│   │               │   └── chats/
│   │               └── project-name/
│   │                   ├── projectMemory.json
│   │                   └── chats/
│   ├── outputs/
│   │   └── transcriptions/
│   ├── routes/
│   │   ├── chat.routes.js
│   │   └── transcription.routes.js
│   ├── services/
│   │   ├── attachment.service.js
│   │   ├── localai.service.js
│   │   ├── localai/
│   │   │   ├── memory.answers.js
│   │   │   ├── response.validator.js
│   │   │   └── token.profiles.js
│   │   ├── memory.service.js
│   │   ├── mode.router.js          ← NUEVO
│   │   └── transcription.service.js
│   ├── uploads/
│   │   ├── attachments/
│   │   ├── audio/
│   │   └── chunks/
│   ├── utils/
│   │   └── cleanReply.js
│   └── server.js
│
├── frontend/
│   ├── modules/
│   │   ├── attachments.js
│   │   ├── models.js
│   │   └── sidebar.js
│   ├── index.html
│   ├── app.js
│   ├── api.js
│   ├── chatState.js
│   ├── ui.js
│   └── styles.css
│
├── docker/
│   └── docker-compose.yml
│
└── models-localai/
    ├── hermes-q4.yaml
    ├── hermes-q5.yaml
    └── hermes-q6.yaml
```

---

## 🤖 Modelos GGUF soportados

| Perfil | Modelo | Uso |
|--------|--------|-----|
| Q4 | hermes-q4 | rápido, menor calidad |
| Q5 | hermes-q5 | equilibrado |
| Q6 | hermes-q6 | mayor calidad |

---

## 🧾 Endpoints principales

```text
POST /chat
GET  /chat/history
GET  /chats
POST /chat/create
POST /chat/delete
POST /chat/rename
GET  /projects
POST /project/create
POST /project/delete
POST /project/rename
POST /title/generate
POST /transcribe
```

---

## ⚙️ Principios arquitectónicos

- Separación de responsabilidades.
- Backend modular.
- Frontend organizado por módulos.
- Persistencia simple y depurable.
- Streaming nativo con SSE sin dependencias externas.
- Preparado para migrar a base de datos.
- Preparado para sistema multiusuario real.