# 🚀 Tempest AI Assistant

Tempest es un asistente local de IA construido con Node.js, Express, LocalAI y frontend web. Permite conversar con modelos locales, organizar chats por proyectos, mantener memoria persistente y transcribir audio a texto con exportación a TXT, PDF y DOCX.

---

## 🧠 Características principales

### 💬 Chat con IA local

- Comunicación con modelos vía LocalAI.
- Interfaz tipo ChatGPT.
- Chats independientes.
- Chats agrupados por proyecto.
- Historial persistente por chat.

### 🧠 Selección de modelos locales

- Selector dinámico de modelos desde el frontend.
- Soporte para múltiples perfiles de hardware (laptop / desktop).
- 3 modelos por perfil de hardware: rápido, equilibrado, inteligente.
- Modo automático que elige el modelo según el tipo de consulta.
- Integración con LocalAI mediante nombres reales de modelo.

### 🖥️ Perfiles de hardware

**Laptop (RTX 4050):**
- Rápido: `qwen2.5-3b-q4`
- Equilibrado: `qwen2.5-3b-q5`
- Inteligente: `llama-3.2-3b-q4`

**Desktop (RTX 4070):**
- Rápido: `hermes-q4`
- Equilibrado: `hermes-q5`
- Inteligente: `hermes-q6`

### 🧠 Sistema de memoria

- Memoria global de usuario.
- Memoria por proyecto.
- Memoria individual por chat.
- Separación de contexto para evitar mezcla de conversaciones.
- Persistencia en archivos JSON.

### 📁 Organización por proyectos

```text
+ Nuevo Chat
chat independiente

+ Nuevo Proyecto
proyecto
└── chat del proyecto
```

### 🏷️ Renombrado inteligente

- La primera consulta genera automáticamente el nombre del chat usando IA.
- Los proyectos se nombran manualmente al crearlos.
- Cada chat/proyecto puede renombrarse desde el menú lateral.

### 🗑️ Eliminación segura

- Cada chat/proyecto tiene menú de tres puntos.
- La eliminación usa modal de confirmación propio.

### 🎙️ Transcripción de audio

- Procesamiento con ffmpeg + Whisper vía LocalAI.
- División automática en fragmentos.
- Exportación a TXT, PDF y DOCX.

### 🤖 Control avanzado de respuestas IA

- Detección automática de respuestas incompletas.
- Regeneración inteligente de archivos cortados.
- Soporte para generación de múltiples archivos en una sola petición.

### ⚙️ Selección automática de modelo

- Consultas complejas → modelo inteligente.
- Consultas medias → modelo equilibrado.
- Consultas simples → modelo rápido.

### 🔥 Gestión dinámica de tokens

- Ajuste automático de `max_tokens` según tipo de solicitud y hardware.
- Perfiles separados por modelo y perfil de hardware.

### ⏱️ Control de timeouts

- Timeout de 120 segundos por petición a LocalAI.
- AbortController para cancelar peticiones colgadas.

---

## 🏗️ Arquitectura

```text
backend/
├── config/
│   └── systemPrompt.js
├── controllers/
│   ├── chat.controller.js
│   └── transcription.controller.js
├── data/
│   └── users/
│       └── local-user/
│           ├── profile.json
│           └── projects/
│               └── project-name/
│                   ├── projectMemory.json
│                   └── chats/
├── outputs/
│   └── transcriptions/
├── routes/
│   ├── chat.routes.js
│   └── transcription.routes.js
├── services/
│   ├── localai/
│   │   ├── memory.answers.js
│   │   ├── response.validator.js
│   │   └── token.profiles.js
│   ├── localai.service.js
│   ├── memory.service.js
│   └── transcription.service.js
├── uploads/
│   ├── audio/
│   └── chunks/
├── utils/
│   └── cleanReply.js
└── server.js

frontend/
├── modules/
│   ├── models.js
│   └── sidebar.js
├── index.html
├── app.js
├── api.js
├── chatState.js
├── ui.js
└── styles.css

models-localai/
├── hermes-q4.yaml
├── hermes-q5.yaml
├── hermes-q6.yaml
├── llama-3.2-3b-q4.yaml
├── qwen2.5-3b-q4.yaml
└── qwen2.5-3b-q5.yaml

docker/
└── docker-compose.yml
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

## ⚙️ Tecnologías utilizadas

- Node.js, Express, LocalAI, GGUF models, Whisper, ffmpeg
- JavaScript, HTML/CSS, Docker, PDFKit, docx

---

## 🚀 Cómo ejecutar el proyecto

```bash
# 1. Instalar dependencias
cd backend && npm install

# 2. Iniciar LocalAI
cd docker && docker compose up -d

# 3. Iniciar backend
cd backend && node server.js

# 4. Abrir frontend en http://localhost:3005
```

### Cambiar perfil de hardware

**Archivo:** `frontend/modules/models.js` línea 1:

```js
export const HARDWARE_PROFILE = 'laptop'; // o 'desktop'
```

---

## ⚠️ Requisitos

- Node.js
- ffmpeg instalado y en PATH
- Docker con soporte NVIDIA
- Drivers NVIDIA actualizados
- Modelos GGUF descargados en `models-localai/`
- YAMLs de configuración por modelo en `models-localai/`

---

## 🧠 Estado del proyecto

Versión actual: **v0.3.6**

Tempest ya cuenta con:

- chat local funcional
- memoria por usuario/proyecto/chat
- sidebar con proyectos y chats
- renombrar/eliminar chats y proyectos
- generación automática de títulos de chat
- transcripción de audio y exportación TXT/PDF/DOCX
- renderizado de bloques de código estilo terminal
- botón para copiar código generado dentro de bloques
- input multilínea con `Shift + Enter`
- textarea autoexpandible con límite de altura
- modo selección para eliminar múltiples chats independientes
- botones de acción por mensaje
- 6 modelos configurados (3 laptop + 3 desktop)
- selección automática de modelo según tipo de consulta
- perfiles de tokens por modelo y hardware
- timeouts con AbortController para peticiones a LocalAI
- YAMLs con templates correctos para todos los modelos
- docker-compose con soporte NVIDIA
- módulos backend separados en `services/localai/`
- módulos frontend separados en `frontend/modules/`
- styles.css limpio sin reglas duplicadas

---

## 🔮 Próximos pasos

- Generar título de chat en background sin bloquear la conversación.
- Implementar subida y vista previa de archivos/imágenes.
- Añadir resaltado de sintaxis para bloques de código.
- Añadir resumen automático por chat/proyecto.
- Añadir búsqueda en historial.
- Migrar persistencia a base de datos.
- Añadir login real.
- Convertir en app desktop con Electron.

---

## 👨‍💻 Autor

**Rogelio Peña López**

Backend Developer enfocado en Node.js, IA local, automatización y sistemas conversacionales.

---

## ⭐ Nota

Este proyecto forma parte de mi portafolio como desarrollador backend y demuestra integración de IA local, arquitectura modular, memoria persistente y organización multi-contexto.