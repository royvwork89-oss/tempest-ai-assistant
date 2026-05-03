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
- Sidebar con chats independientes y proyectos.
- Menú de modelos locales y servicios externos.
- Menú de herramientas con transcripción de audio.
- Modales para transcripción, eliminación y creación de proyectos.
- Estado activo del chat mediante `chatState.js`.
- Comunicación HTTP con el backend mediante `fetch`.
- Renderizado de respuestas con acciones por mensaje.
- Botones de copiar para consultas y respuestas.
- Modo selección para eliminación múltiple de chats independientes.
- Input multilínea autoexpandible preparado para adjuntos.
- Selección automática de modelo según tipo de consulta.
- Perfiles de hardware configurables (laptop / desktop).

### Backend

- API REST con Express.
- Controladores para chat y transcripción.
- Servicios separados para LocalAI, memoria y transcripción.
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

Para cambiar de perfil, editar en `frontend/app.js`:

```js
const HARDWARE_PROFILE = 'laptop'; // o 'desktop'
```

---

## 🤖 Selección automática de modelo

El modo automático en el frontend analiza el mensaje del usuario y elige el modelo más adecuado:

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

Tempest organiza la información en tres niveles:

```text
Usuario
└── Proyecto
    └── Chat
```

### Reglas principales

- Cada usuario tiene su propia memoria global.
- Cada proyecto tiene su propia memoria de proyecto.
- Cada chat tiene su propio historial y memoria de trabajo.
- Un chat no puede leer el historial de otro chat.
- Un chat dentro de proyecto puede acceder a:
  - su propia memoria de chat
  - la memoria del proyecto
  - la memoria global del usuario
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
│   │               │       └── chat-name.json
│   │               └── project-name/
│   │                   ├── projectMemory.json
│   │                   └── chats/
│   │                       └── chat-name.json
│   ├── outputs/
│   │   └── transcriptions/
│   ├── routes/
│   │   ├── chat.routes.js
│   │   └── transcription.routes.js
│   ├── services/
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
Selección de modelo (manual o automático)
↓
api.js → POST /chat
↓
routes/chat.routes.js
↓
controllers/chat.controller.js
↓
services/localai.service.js
  ↓ Respuestas rápidas sin IA (hora, saludo, memoria controlada)
  ↓ Construcción de historial y system prompt
  ↓ Fetch a LocalAI con AbortController (timeout 120s)
  ↓ Detección de respuesta incompleta
  ↓ Regeneración si es necesario
↓
services/memory.service.js
↓
Respuesta guardada en memoria
↓
Frontend renderiza mensaje
```

---

## 🧭 Sidebar y organización visual

```text
+ Nuevo Chat
chat independiente
chat independiente

+ Nuevo Proyecto
▸ proyecto cerrado
▾ proyecto abierto
   + Nuevo chat
   chat del proyecto
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

### Componentes

- `routes/transcription.routes.js`
- `controllers/transcription.controller.js`
- `services/transcription.service.js`
- `uploads/audio/`
- `uploads/chunks/`
- `outputs/transcriptions/`

### Funcionalidad

- Carga de audio desde frontend.
- División del audio en fragmentos con ffmpeg.
- Transcripción con Whisper vía LocalAI.
- Generación de archivos TXT, PDF y DOCX.
- Limpieza automática de archivos temporales.

---

## ⚙️ Principios arquitectónicos

- Separación de responsabilidades.
- Backend modular.
- Frontend organizado por módulos.
- Persistencia simple y depurable.
- Preparado para migrar a base de datos.
- Preparado para sistema multiusuario real.
- Orquestación de comportamiento de IA en backend.
- Corrección automática de fallos del modelo.
- Sistema de recuperación de respuestas incompletas.
- Separación entre generación y validación de contenido IA.
- Perfiles de hardware para adaptar el sistema a diferentes equipos.
