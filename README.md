# 🚀 Tempest AI Assistant

Tempest es un asistente local de IA construido con Node.js, Express, LocalAI y frontend web. Permite conversar con modelos locales, organizar chats por proyectos, mantener memoria persistente, transcribir audio a texto y analizar archivos adjuntos.

---

## 🧠 Características principales

### 💬 Chat con IA local

- Comunicación con modelos vía LocalAI.
- Interfaz tipo ChatGPT.
- **Streaming de respuesta** — el texto aparece palabra por palabra mientras el modelo genera.
- Chats independientes.
- Chats agrupados por proyecto.
- Historial persistente por chat.
- **Router de modos automático** — detecta si el mensaje es `coder`, `explain` o `general` y ajusta instrucciones y tokens.

### 🤖 Router de modos

- `coder/strict` — código puro: implementaciones, endpoints, archivos.
- `coder/hybrid` — explicación breve + código: cuando el usuario pide ambas cosas.
- `explain` — texto explicativo sin código: conceptos, definiciones, análisis de documentos.
- `general` — conversación normal.
- Detección automática por heurística (triggers + tipo de adjunto).
- Override manual desde el frontend via `config.mode`.
- Log en consola: `[MODE ROUTER] mode=coder variant=hybrid reason="..."`.

### 📎 Archivos adjuntos

- Soporte para múltiples archivos por mensaje (hasta 8, máx 10MB cada uno).
- Drag & drop sobre el chat o el área de input.
- Preview visual con chips (imagen, nombre, botón de eliminar).
- Extracción de texto e inyección al contexto de LocalAI.
- Tipos soportados:
  - **Texto/código**: TXT, MD, HTML, CSS, JS, TS, JSX, TSX, JSON, YAML, XML, CSV, PY, JAVA, C, CPP, H, CS, PHP, RB, GO, RS, SH, BASH, ENV, INI, TOML, SQL
  - **Documentos**: PDF (pdf2json), DOCX (mammoth), XLSX (xlsx)
  - **Imágenes**: PNG, JPG, GIF, WEBP (placeholder con metadata)
- Truncado inteligente diferenciado por tipo.
- Limpieza automática de temporales en doble capa.

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
- Generador de títulos optimizado: más rápido, limpia bloque de adjuntos, maneja mensajes solo con archivos.
- Los proyectos se nombran manualmente al crearlos.
- Cada chat/proyecto puede renombrarse desde un modal visual propio.
- Validación de nombres: sin caracteres inválidos, mínimo 2 caracteres, máximo 60.

### 🗑️ Eliminación segura

- Menú de tres puntos con opciones Renombrar / Eliminar.
- Modal de confirmación propio.
- Modo selección para eliminar múltiples chats independientes.

### 🎙️ Transcripción de audio

- Procesamiento con ffmpeg + Whisper vía LocalAI.
- División automática en fragmentos.
- Exportación a TXT, PDF y DOCX.

### 🖥️ Renderizado de código

- Bloques de código estilo terminal con etiqueta de lenguaje y botón de copiar (ícono SVG).
- Separación automática de múltiples archivos en bloques individuales.
- Detección de formatos: triple backtick y patrones `Archivo: nombre.ext` en texto plano.

### 💬 Acciones por mensaje

- Íconos SVG estilo Claude/ChatGPT — sin texto, solo símbolos.
- Aparecen al hacer hover sobre el mensaje.
- `user-select: none` — al seleccionar texto del chat los botones no se incluyen en la selección.
- Acciones: copiar, editar (futuro), compartir (futuro), reintentar (futuro).

### ⌨️ Área de entrada

- Textarea autoexpandible con límite de altura.
- Input multilínea con `Shift + Enter`.
- Botón `+` fijo a la izquierda (menú de herramientas).
- Botón enviar (ícono avión de papel) fijo a la derecha.
- Barra de botones siempre visible debajo del textarea, sin importar el tamaño del texto.

---

## 🏗️ Arquitectura

```text
backend/
├── config/systemPrompt.js
├── controllers/chat.controller.js
├── controllers/transcription.controller.js
├── routes/chat.routes.js
├── routes/transcription.routes.js
├── services/
│   ├── attachment.service.js
│   ├── localai.service.js
│   ├── memory.service.js
│   ├── mode.router.js          ← NUEVO
│   ├── transcription.service.js
│   └── localai/
│       ├── memory.answers.js
│       ├── response.validator.js
│       └── token.profiles.js
├── utils/cleanReply.js
└── server.js

frontend/
├── modules/models.js
├── modules/sidebar.js
├── modules/attachments.js
├── app.js
├── api.js
├── chatState.js
├── ui.js
├── index.html
└── styles.css
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

- Node.js + Express
- LocalAI + modelos GGUF (Q4, Q5, Q6)
- Whisper vía LocalAI
- ffmpeg
- JavaScript vanilla
- pdf2json, mammoth, xlsx
- PDFKit, docx
- SSE (Server-Sent Events) para streaming

---

## 🚀 Cómo ejecutar el proyecto

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Ejecutar LocalAI

```text
cd docker
docker-compose up
```

### 3. Ejecutar backend

```bash
node server.js
```

### 4. Abrir frontend

```text
http://localhost:3005
```

---

## ⚠️ Requisitos

- Node.js
- ffmpeg instalado y en PATH
- Docker/LocalAI funcionando
- Modelo de chat configurado (Q4, Q5 o Q6)
- Modelo Whisper configurado para transcripción

---

## 🧠 Estado del proyecto

Versión actual: **v1.1.0**

Tempest cuenta con:

- Chat local funcional con memoria por usuario/proyecto/chat
- **Streaming de respuesta** — texto aparece palabra por palabra
- **Router de modos automático** — `coder/strict`, `coder/hybrid`, `explain`, `general`
- Sidebar con proyectos y chats
- Modal propio para renombrar con validación inline
- Validación de nombres para caracteres inválidos
- Eliminar chats y proyectos con modal de confirmación
- Generación automática de títulos de chat
- Renombrado de chat cuando el primer mensaje es solo archivo adjunto
- Transcripción de audio con exportación TXT/PDF/DOCX
- Renderizado de bloques de código estilo terminal
- Separación automática de múltiples archivos en bloques individuales
- Botones de acción por mensaje con **íconos SVG** (sin texto)
- Acciones visibles solo al hacer hover, sin interferir con selección de texto
- Botón enviar con **ícono de avión de papel** dentro del área de entrada
- Barra de herramientas fija debajo del textarea (+ a la izquierda, enviar a la derecha)
- Adjuntos funcionales: PDF, DOCX, XLSX, TXT, código, imágenes
- Modelos Q4, Q5 y Q6 funcionando
- Historial de conversación sin duplicados

---

## 👨‍💻 Autor

**Rogelio Peña López**

Backend Developer enfocado en Node.js, IA local, automatización y sistemas conversacionales.