# 🚀 Tempest AI Assistant

Tempest es un asistente local de IA construido con Node.js, Express, LocalAI y frontend web. Permite conversar con modelos locales, organizar chats por proyectos, mantener memoria persistente, transcribir audio a texto y analizar archivos adjuntos.

---

## 🧠 Características principales

### 💬 Chat con IA local

- Comunicación con modelos vía LocalAI.
- Interfaz tipo ChatGPT.
- Chats independientes.
- Chats agrupados por proyecto.
- Historial persistente por chat.

### 📎 Archivos adjuntos

- Soporte para múltiples archivos por mensaje (hasta 8, máx 10MB cada uno).
- Drag & drop sobre el chat o el área de input.
- Preview visual con chips (imagen, nombre, botón de eliminar).
- Extracción de texto e inyección al contexto de LocalAI.
- Tipos soportados:
  - **Texto/código**: TXT, MD, HTML, CSS, JS, TS, JSX, TSX, JSON, YAML, XML, CSV, PY, JAVA, C, CPP, H, CS, PHP, RB, GO, RS, SH, BASH, ENV, INI, TOML, SQL
  - **Documentos**: PDF (pdf2json), DOCX (mammoth), XLSX (xlsx)
  - **Imágenes**: PNG, JPG, GIF, WEBP (placeholder con metadata)
- Truncado inteligente diferenciado:
  - Código: 60% cabecera + 30% final con aviso de truncado
  - Documentos: 65% inicio + 25% final con aviso de truncado
- Limpieza automática de temporales en doble capa:
  - Capa A: inmediata en `finally` tras cada petición
  - Capa B: job escoba cada 6h borra archivos con más de 24h

### 🧠 Sistema de memoria

- Memoria global de usuario.
- Memoria por proyecto.
- Memoria individual por chat.
- Separación de contexto para evitar mezcla de conversaciones.
- Persistencia en archivos JSON.

### 📁 Organización por proyectos

Tempest permite organizar conversaciones en:

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

- Menú de tres puntos con opciones Renombrar / Eliminar.
- Modal de confirmación propio.

### 🎙️ Transcripción de audio

- Procesamiento con ffmpeg + Whisper vía LocalAI.
- División automática en fragmentos.
- Exportación a TXT, PDF y DOCX.

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
│   ├── attachment.service.js       ← extracción de texto de adjuntos
│   ├── localai.service.js
│   ├── localai/
│   │   ├── memory.answers.js
│   │   ├── response.validator.js
│   │   └── token.profiles.js
│   ├── memory.service.js
│   └── transcription.service.js
├── uploads/
│   ├── attachments/                ← archivos temporales de adjuntos
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

---

## 🚀 Cómo ejecutar el proyecto

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Ejecutar LocalAI

```text
http://localhost:8080
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

Versión actual: **v0.4.1**

Tempest cuenta con:

- Chat local funcional con memoria por usuario/proyecto/chat
- Sidebar con proyectos y chats
- Renombrar/eliminar chats y proyectos
- Generación automática de títulos de chat
- Transcripción de audio con exportación TXT/PDF/DOCX
- Renderizado de bloques de código estilo terminal
- Botón para copiar código dentro de bloques
- Input multilínea con `Shift + Enter`
- Textarea autoexpandible con límite de altura
- Modo selección para eliminar múltiples chats independientes
- Botones de acción por mensaje (copiar, editar*, compartir*, reintentar*)
- **Adjuntos funcionales**: PDF, DOCX, XLSX, TXT, código, imágenes
- **Modelos Q4, Q5 y Q6 funcionando**
- **Historial de conversación corregido** (sin duplicados)

*preparado para futuro

---

## 🔮 Próximos pasos

**Para v1.0:**
- Modal propio para renombrar (reemplazar `prompt()` nativo)
- Validación de nombres para caracteres inválidos
- Manejo de errores visual

**Integración de modelos:**
- Configurar Qwen2.5-Coder-14B para trabajo de código rutinario
- Integrar Claude API y OpenAI API para problemas complejos
- Modo híbrido: LocalAI para trabajo del día a día, API externa cuando el modelo local no alcanza

**Post v1.0:**
- Función de voz al chat (hablar → texto → consulta)
- Stream de audio en vivo con Faster-Whisper
- Implementar lectura de PPTX
- LibreOffice headless para mejor extracción de documentos
- Añadir resumen automático por chat/proyecto
- Migrar persistencia a base de datos
- Añadir login real
- Convertir en app desktop con Electron

---

## 👨‍💻 Autor

**Rogelio Peña López**

Backend Developer enfocado en Node.js, IA local, automatización y sistemas conversacionales.