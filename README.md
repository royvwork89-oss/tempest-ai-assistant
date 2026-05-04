# 🚀 Tempest AI Assistant

Tempest es un asistente local de IA construido con Node.js, Express, LocalAI y frontend web. Permite conversar con modelos locales, organizar chats por proyectos, mantener memoria persistente, adjuntar archivos como contexto, generar documentos descargables y transcribir audio a TXT, PDF o DOCX.

---

## 🧠 Características principales

### 💬 Chat con IA local

- Comunicación con modelos vía LocalAI.
- Interfaz tipo ChatGPT.
- Chats independientes.
- Chats agrupados por proyecto.
- Historial persistente por chat.
- Respuestas renderizadas en burbujas de conversación.
- Acciones por mensaje.

### 🧠 Selección de modelos locales

- Selector dinámico de modelos desde el frontend.
- Soporte para múltiples perfiles de hardware: laptop / desktop.
- 3 modelos por perfil de hardware: rápido, equilibrado, inteligente.
- Modo automático que elige el modelo según el tipo de consulta.
- Integración con LocalAI mediante nombres reales de modelo.
- Los documentos usan el modelo seleccionado en la interfaz.
- La transcripción usa Whisper fijo, no el modelo de chat.

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
- Las transcripciones también pueden activar renombrado automático cuando inician un chat nuevo.

### 🗑️ Eliminación segura

- Cada chat/proyecto tiene menú de tres puntos.
- La eliminación usa modal de confirmación propio.
- Existe modo de selección para eliminar múltiples chats independientes.

### 📎 Adjuntos en chat

Tempest permite adjuntar archivos desde el menú de herramientas o arrastrarlos al área del chat/input.

Archivos involucrados:

```text
frontend/modules/attachments.js
backend/services/attachment.service.js
backend/routes/chat.routes.js
backend/controllers/chat.controller.js
```

Formatos leídos como texto:

```text
.txt
.md
.json
.js
.css
.html
.py
.ts
```

Los archivos de texto/código son procesados por el backend y enviados como contexto a LocalAI.

Los archivos adjuntos se almacenan temporalmente en:

```text
backend/uploads/attachments/
```

Archivos no textuales como imágenes o PDF pueden adjuntarse, pero su lectura avanzada queda pendiente.

### 📄 Generación de documentos

Tempest permite generar archivos descargables desde una instrucción del usuario.

Formatos soportados:

```text
TXT
PDF
DOCX
```

Endpoint principal:

```text
POST /document/generate
```

Endpoints de acceso:

```text
GET /documents/:filename
GET /documents/download/:filename
```

Archivos involucrados:

```text
backend/controllers/document.controller.js
backend/routes/document.routes.js
backend/services/document.service.js
frontend/api.js
frontend/ui.js
frontend/app.js
```

Salida generada en:

```text
backend/outputs/documents/
```

El frontend renderiza los documentos mediante una tarjeta visual con:

```text
Ver documento
Descargar
```

Los documentos generados son temporales y se eliminan automáticamente después de 24 horas.

El modelo usado para generar documentos es el modelo seleccionado en la interfaz. Si no se recibe modelo desde el frontend, se usa fallback por perfil de hardware:

```text
desktop → hermes-q5
laptop  → qwen2.5-3b-q4
```

### 🎙️ Transcripción de audio

Tempest permite transcribir audio mediante Whisper vía LocalAI.

Endpoint principal:

```text
POST /transcribe
```

Archivos involucrados:

```text
backend/controllers/transcription.controller.js
backend/routes/transcription.routes.js
backend/services/transcription.service.js
frontend/api.js
frontend/app.js
frontend/ui.js
```

Modelo usado:

```text
ggml-whisper-base.bin
```

Modos de transcripción:

```text
plain       → texto corrido
timestamps  → texto con divisiones de tiempo
```

Formatos de salida:

```text
TXT
PDF
DOCX
```

Carpetas usadas durante el proceso:

```text
backend/uploads/audio/
backend/uploads/chunks/
backend/outputs/transcriptions/
```

Flujo implementado:

```text
audio → chunks → Whisper → texto final → TXT/PDF/DOCX → tarjeta descargable
```

El frontend muestra mensajes visuales durante el proceso:

```text
🎙️ Estoy transcribiendo el audio.
✅ Transcripción finalizada. Ya generé el documento.
```

Al finalizar, se renderiza una tarjeta con:

```text
Ver documento
Descargar
```

Después del proceso, el backend elimina automáticamente:

```text
backend/uploads/audio/
backend/uploads/chunks/
```

La transcripción también activa el renombrado automático del chat cuando se inicia desde una conversación nueva.

### 🤖 Modelos por tipo de tarea

```text
Chat normal    → modelo seleccionado en la interfaz
Documentos     → modelo seleccionado en la interfaz
Transcripción  → modelo Whisper fijo
```

La transcripción no usa modelos de chat porque Qwen, Hermes y Llama son modelos de texto. Para audio se usa Whisper.

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
│   ├── document.controller.js
│   └── transcription.controller.js
├── data/
│   └── users/
│       └── local-user/
│           ├── profile.json
│           └── projects/
│               ├── general/
│               │   ├── projectMemory.json
│               │   └── chats/
│               └── project-name/
│                   ├── projectMemory.json
│                   └── chats/
├── outputs/
│   ├── documents/
│   └── transcriptions/
├── routes/
│   ├── chat.routes.js
│   ├── document.routes.js
│   └── transcription.routes.js
├── services/
│   ├── localai/
│   │   ├── memory.answers.js
│   │   ├── response.validator.js
│   │   └── token.profiles.js
│   ├── attachment.service.js
│   ├── document.service.js
│   ├── localai.service.js
│   ├── memory.service.js
│   └── transcription.service.js
├── uploads/
│   ├── attachments/
│   ├── audio/
│   └── chunks/
├── utils/
│   └── cleanReply.js
└── server.js

frontend/
├── modules/
│   ├── attachments.js
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

POST /document/generate
GET  /documents/:filename
GET  /documents/download/:filename
```

---

## ⚙️ Tecnologías utilizadas

- Node.js
- Express
- LocalAI
- GGUF models
- Whisper
- ffmpeg
- JavaScript
- HTML/CSS
- Docker
- PDFKit
- docx
- multer
- FormData

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

**Archivo:** `frontend/modules/models.js`

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
- Modelo Whisper disponible para transcripción

---

## 🧠 Estado del proyecto

Versión actual: **v0.3.9**

Tempest ya cuenta con:

- Chat local funcional.
- Memoria por usuario/proyecto/chat.
- Sidebar con proyectos y chats.
- Renombrar/eliminar chats y proyectos.
- Generación automática de títulos de chat.
- Renombrado automático tras transcripción.
- Transcripción de audio con exportación TXT/PDF/DOCX.
- Mensajes visuales de inicio y finalización de transcripción.
- Tarjetas descargables para documentos y transcripciones.
- Generación de documentos TXT/PDF/DOCX.
- Adjuntos en chat.
- Drag & drop de archivos.
- Lectura de archivos de texto/código como contexto.
- Renderizado de bloques de código estilo terminal.
- Botón para copiar código generado dentro de bloques.
- Input multilínea con `Shift + Enter`.
- Textarea autoexpandible con límite de altura.
- Modo selección para eliminar múltiples chats independientes.
- Botones de acción por mensaje.
- 6 modelos configurados: 3 laptop + 3 desktop.
- Selección automática de modelo según tipo de consulta.
- Perfiles de tokens por modelo y hardware.
- Timeouts con AbortController para peticiones a LocalAI.
- YAMLs con templates correctos para todos los modelos.
- Docker-compose con soporte NVIDIA.
- Módulos backend separados en `services/localai/`.
- Módulos frontend separados en `frontend/modules/`.

---

## 🔮 Próximos pasos

- Generar título de chat en background sin bloquear la conversación.
- Leer PDF como texto.
- Añadir soporte de visión para imágenes.
- Añadir resaltado de sintaxis para bloques de código.
- Mejorar formato visual de PDF.
- Mejorar formato visual de DOCX.
- Permitir crear documentos desde una respuesta previa.
- Detectar instrucciones de documentos como “2 páginas”, “con portada” o “formato profesional”.
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

Este proyecto forma parte de mi portafolio como desarrollador backend y demuestra integración de IA local, arquitectura modular, memoria persistente, organización multi-contexto, adjuntos, generación de documentos y transcripción local con Whisper.