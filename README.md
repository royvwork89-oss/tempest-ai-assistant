# 🚀 Tempest AI Assistant

Asistente local inteligente construido con Node.js, capaz de mantener conversaciones, recordar información del usuario y transcribir audio a texto con exportación a múltiples formatos.

---

## 🧠 Características principales

### 💬 Chat con IA local
- Comunicación con modelos vía LocalAI
- Respuestas rápidas y controladas
- Arquitectura modular

### 🧠 Sistema de memoria
- Memoria persistente (`memory.json`)
- Detección automática de datos importantes
- Uso de contexto en respuestas

### 🎙️ Transcripción de audio
- Procesamiento con **ffmpeg + Whisper (LocalAI)**
- División automática en fragmentos
- Soporte para audios largos

### 📄 Exportación de archivos
- TXT (texto limpio)
- TXT con timestamps
- PDF
- DOCX (Word)

---

## 🧰 Herramientas integradas

- Sistema de herramientas (+)
- Modal de transcripción configurable
- Preparado para futuras funciones:
  - Análisis de archivos
  - Generación de contenido
  - Automatización

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
│   └── memory.json
├── outputs/
│   └── transcriptions/
├── routes/
│   ├── chat.routes.js
│   └── transcription.routes.js
├── services/
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
├── index.html
├── app.js
├── api.js
├── ui.js
└── styles.css
```

---

## ⚙️ Tecnologías utilizadas

- Node.js
- Express
- LocalAI
- Whisper
- ffmpeg
- JavaScript
- PDFKit
- docx

---

## 🚀 Cómo ejecutar el proyecto

### 1. Clonar repositorio

```bash
git clone https://github.com/royvwork89-oss/tempest-ai-assistant.git
cd tempest-ai-assistant
```

### 2. Instalar dependencias

```bash
cd backend
npm install
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
- ffmpeg instalado y disponible en PATH
- LocalAI ejecutándose en:

```text
http://localhost:8080
```

---

## 🧠 Estado del proyecto

Versión actual: **v0.3.0**

El proyecto está en desarrollo activo.

---

## 📌 Roadmap

Ver tareas pendientes en:

```text
ROADMAP.md
```

---

## 🔮 Futuro

- Mejora del sistema de memoria
- Análisis automático de transcripciones
- Sistema de plugins/herramientas
- App desktop con Electron
- App móvil

---

## 👨‍💻 Autor

**Rogelio Peña López**

Backend Developer enfocado en Node.js, IA local y automatización.

---

## ⭐ Nota

Este proyecto forma parte de mi portafolio como desarrollador backend.