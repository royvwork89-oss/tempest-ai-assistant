# Arquitectura - Tempest

## 🧩 Visión general

Tempest es un asistente local de IA con arquitectura cliente-servidor, frontend web, backend Node.js/Express, motor LocalAI y persistencia basada en archivos JSON.

```text
Usuario → Frontend → Backend → Memoria/Servicios → LocalAI → Backend → Frontend
```

El sistema maneja conversaciones organizadas por usuario, proyectos y chats independientes, con selección dinámica de modelos según el hardware disponible y el tipo de consulta.

---

## 🔧 Componentes principales

### Frontend

- Interfaz de chat tipo ChatGPT.
- Sidebar con chats independientes y proyectos — `modules/sidebar.js`
- Menú de modelos locales y servicios externos — `modules/models.js`
- Menú de herramientas con transcripción de audio.
- Modales para transcripción, eliminación y creación de proyectos.
- Estado activo del chat mediante `chatState.js`.
- Comunicación HTTP con el backend mediante `api.js`.
- Renderizado de respuestas con acciones por mensaje — `ui.js`
- Selección automática de modelo según tipo de consulta.
- Perfiles de hardware configurables (laptop / desktop).

### Backend

- API REST con Express.
- Controladores para chat y transcripción.
- Servicios separados para LocalAI, memoria y transcripción.
- Módulos internos de LocalAI en `services/localai/`.
- Persistencia por archivos JSON.
- Endpoints para crear, listar, renombrar y eliminar chats/proyectos.
- Endpoint para generación automática de títulos.
- Timeouts con AbortController para peticiones a LocalAI.
- Perfiles de tokens por modelo y hardware.

### Motor IA

- LocalAI ejecutando modelos GGUF para chat.
- Modelo Whisper vía LocalAI para transcripción de audio.
- Generación auxiliar de títulos cortos para chats.
- 6 modelos configurados con YAMLs y templates correctos.

### Docker

- LocalAI en contenedor Docker con soporte NVIDIA.
- Volumen montado desde `models-localai/` hacia `/models` en el contenedor.
- Variables de entorno para habilitar GPU.

---

## 🖥️ Perfiles de hardware y modelos

```text
Laptop (RTX 4050)
├── Rápido:      qwen2.5-3b-q4
├── Equilibrado: qwen2.5-3b-q5
└── Inteligente: llama-3.2-3b-q4

Desktop (RTX 4070)
├── Rápido:      hermes-q4
├── Equilibrado: hermes-q5
└── Inteligente: hermes-q6
```

Para cambiar de perfil, editar en `frontend/modules/models.js` línea 1:

```js
export const HARDWARE_PROFILE = 'laptop'; // o 'desktop'
```

---

## 🤖 Selección automática de modelo

```text
Mensaje complejo (código, arquitectura, explicación detallada)
→ modelo inteligente

Mensaje medio (ejemplos, comparaciones, cómo hacer algo)
→ modelo equilibrado

Mensaje simple (conversación, preguntas cortas)
→ modelo rápido
```

---

## 🧠 Sistema multi-contexto

```text
Usuario
└── Proyecto
    └── Chat
```

- Cada usuario tiene su propia memoria global.
- Cada proyecto tiene su propia memoria de proyecto.
- Cada chat tiene su propio historial y memoria de trabajo.
- Un chat no puede leer el historial de otro chat.
- Un chat sin proyecto pertenece al proyecto especial `general`.

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
│   │   ├── localai/
│   │   │   ├── memory.answers.js
│   │   │   ├── response.validator.js
│   │   │   └── token.profiles.js
│   │   ├── localai.service.js
│   │   ├── memory.service.js
│   │   └── transcription.service.js
│   ├── uploads/
│   │   ├── audio/
│   │   └── chunks/
│   ├── utils/
│   │   └── cleanReply.js
│   └── server.js
│
├── frontend/
│   ├── modules/
│   │   ├── models.js
│   │   └── sidebar.js
│   ├── index.html
│   ├── app.js
│   ├── api.js
│   ├── chatState.js
│   ├── ui.js
│   └── styles.css
│
├── models-localai/
│   ├── hermes-q4.yaml
│   ├── hermes-q5.yaml
│   ├── hermes-q6.yaml
│   ├── llama-3.2-3b-q4.yaml
│   ├── qwen2.5-3b-q4.yaml
│   ├── qwen2.5-3b-q5.yaml
│   └── [archivos .gguf]
│
└── docker/
    └── docker-compose.yml
```

---

## 🔄 Flujo interno de chat

```text
frontend/app.js
↓
modules/models.js → selección de modelo (manual o automático)
↓
api.js → POST /chat
↓
routes/chat.routes.js
↓
controllers/chat.controller.js
↓
services/localai.service.js
  ↓ localai/memory.answers.js → respuestas sin IA
  ↓ Construcción de historial y system prompt
  ↓ Fetch a LocalAI con AbortController (timeout 120s)
  ↓ localai/response.validator.js → detección de cortes
  ↓ Regeneración si es necesario
↓
services/memory.service.js → guarda en JSON
↓
Frontend renderiza mensaje
```

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

## 🎙️ Sistema de transcripción de audio

- `routes/transcription.routes.js`
- `controllers/transcription.controller.js`
- `services/transcription.service.js`
- División con ffmpeg → transcripción con Whisper → exportación TXT/PDF/DOCX

---

## ⚙️ Principios arquitectónicos

- Separación de responsabilidades.
- Backend modular con subcarpetas por dominio.
- Frontend organizado por módulos en carpeta `modules/`.
- Persistencia simple y depurable en JSON.
- Preparado para migrar a base de datos.
- Preparado para sistema multiusuario real.
- Orquestación de comportamiento de IA en backend.
- Corrección automática de fallos del modelo.
- Perfiles de hardware para adaptar el sistema a diferentes equipos.