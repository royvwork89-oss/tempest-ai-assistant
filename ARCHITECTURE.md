# Arquitectura - Tempest

## 🧩 Visión general

El sistema sigue una arquitectura cliente-servidor:

Usuario → Frontend → Backend → Motor IA → Backend → Frontend

---

## 🔧 Componentes

### Frontend

* Interfaz de usuario
* Manejo de eventos
* Renderizado de mensajes
* Comunicación con backend vía HTTP (fetch)

### Backend

* API REST (/chat)
* Validación de entrada
* Orquestación de servicios
* Comunicación con LocalAI
* Manejo de memoria

### Motor IA

* Modelo de lenguaje ejecutado localmente (LocalAI)
* Generación de respuestas

---

## ⚙️ Principios

* Separación de responsabilidades
* Bajo acoplamiento
* Escalabilidad
* Modularidad

---

## 📦 Estructura del proyecto (Mapa real)

```md
```text
Tempest/
├── backend/
│   ├── config/
│   │   └── systemPrompt.js                 # Prompt base del sistema
│   ├── controllers/
│   │   ├── chat.controller.js              # Maneja la lógica de /chat
│   │   └── transcription.controller.js     # Maneja la lógica de /transcribe
│   ├── data/
│   │   └── memory.json                     # Memoria persistente
│   ├── outputs/
│   │   └── transcriptions/                 # Archivos generados: TXT, PDF, DOCX
│   ├── routes/
│   │   ├── chat.routes.js                  # Define endpoint /chat
│   │   └── transcription.routes.js         # Define endpoint /transcribe
│   ├── services/
│   │   ├── localai.service.js              # Comunicación con LocalAI para chat
│   │   ├── memory.service.js               # Gestión de memoria
│   │   └── transcription.service.js        # Transcripción, chunks, PDF/DOCX
│   ├── uploads/
│   │   ├── audio/                          # Audios temporales subidos
│   │   └── chunks/                         # Fragmentos temporales generados por ffmpeg
│   ├── utils/
│   │   └── cleanReply.js                   # Limpieza de respuestas
│   └── server.js                           # Punto de entrada del backend
│
├── frontend/
│   ├── index.html                          # UI principal, menú + y modal
│   ├── app.js                              # Lógica del chat y herramientas
│   ├── api.js                              # Conexión con /chat y /transcribe
│   ├── ui.js                               # Renderizado de mensajes y links
│   └── styles.css                          # Estilos
│
└── docker/
```

---

## 🔄 Flujo interno entre archivos

El flujo real del mensaje dentro del backend es:

```text
Frontend (app.js)
   ↓
POST /chat
   ↓
routes/chat.routes.js
   ↓
controllers/chat.controller.js
   ↓
services/localai.service.js
   ↓
services/memory.service.js
   ↓
LocalAI (modelo)
   ↓
Respuesta
   ↓
Frontend
```

---

## 🧠 Responsabilidad por módulo

### routes/

Define endpoints y conecta con controladores.

### controllers/

* Recibe request
* Valida datos
* Llama servicios
* Devuelve respuesta

### services/

Contienen la lógica principal del sistema:

* localai.service → habla con la IA
* memory.service → gestiona memoria

### config/

Configuraciones globales como el prompt del sistema.

### data/

Persistencia en JSON (memoria e historial).

### utils/

Funciones auxiliares (ej. limpieza de texto).

---

## 📌 Estado actual de la arquitectura

El sistema está en una fase modular inicial con:

* arquitectura clara separada por capas
* memoria básica persistente
* integración funcional con LocalAI
* frontend conectado correctamente al backend

Preparado para evolucionar hacia:

* múltiples modelos
* memoria avanzada (resumen, embeddings)
* base de datos real (MongoDB, PostgreSQL)
* autenticación de usuarios
* sistema multiusuario

---

## 🎙️ Sistema de Transcripción de Audio

Se ha integrado un nuevo módulo para procesamiento de audio y generación de archivos.

### Componentes involucrados

- routes/transcription.routes.js → endpoint `/transcribe`
- controllers/transcription.controller.js → manejo de request
- services/transcription.service.js → lógica principal
- outputs/transcriptions/ → almacenamiento de archivos generados

### Funcionalidad

- División de audio en fragmentos (ffmpeg)
- Transcripción usando modelo Whisper (LocalAI)
Generación de archivos basada en selección del usuario:
- TXT (plano o timestamps)
- PDF (plano o timestamps)
- DOCX (plano o timestamps)

### Integración frontend

- Modal de transcripción
- Menú de herramientas (+)
- Selección de tipo de texto y formato

### Dependencias del sistema de transcripción

- ffmpeg → procesamiento de audio
- LocalAI (Whisper) → transcripción
- pdfkit → generación de PDF
- docx → generación de archivos Word