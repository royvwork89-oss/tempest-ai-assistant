# Flujo del Sistema - Tempest

## 💬 Flujo normal de chat

1. Usuario escribe mensaje.
2. Frontend valida que no esté vacío.
3. Si el modo es automático, se detecta el tipo de consulta y se elige el modelo.
4. Si no hay chat activo, se crea uno en el contexto correcto.
5. Frontend envía `POST /chat` incluyendo modelo seleccionado y perfil de hardware.
6. Backend recibe mensaje, modelo y perfil de hardware.
7. Backend verifica si la respuesta puede darse sin llamar a LocalAI.
8. Si requiere IA, construye el historial y llama a LocalAI con timeout.
9. LocalAI genera respuesta.
10. Backend guarda mensaje y respuesta.
11. Frontend renderiza respuesta.

---

## 🤖 Flujo de selección automática de modelo

1. Usuario selecciona modo `Automático` en el menú.
2. Al enviar mensaje, el frontend analiza el texto.
3. Si contiene palabras clave complejas como código, arquitectura, explicación detallada o paso a paso, se elige modelo inteligente.
4. Si contiene palabras medias como ejemplo, comparar, recomienda o cómo hacer algo, se elige modelo equilibrado.
5. Si es conversación simple, se elige modelo rápido.
6. El modelo seleccionado se muestra en el botón del menú cuando el modo dev está activo.
7. Se envía al backend como `primaryModel`.

---

## 🤖 Flujo con control de respuesta IA

1. Backend recibe respuesta del modelo.
2. Se limpia el contenido con `cleanReply`.
3. Se analiza si la respuesta está incompleta con `looksLikeCutReply`.
4. Si está incompleta:
   - se elimina el bloque corrupto con `removeIncompleteFileBlock`
   - se solicita regeneración del archivo faltante con nuevo AbortController
5. Se recibe nueva respuesta.
6. Se unen ambas respuestas de forma limpia.
7. Se entrega resultado final completo al frontend.

---

## ⏱️ Flujo de timeout

1. Se crea un AbortController antes del fetch a LocalAI.
2. Se inicia un timer de 120 segundos.
3. Si LocalAI responde antes, se cancela el timer.
4. Si LocalAI no responde en 120 segundos, se aborta la petición.
5. El error se propaga al controlador y se devuelve error 500 al frontend.

---

## 🧠 Flujo con memoria

1. Frontend envía:
   - `userId`
   - `projectId`
   - `chatId`
2. Backend localiza:
   - memoria global del usuario
   - memoria de proyecto
   - memoria del chat
3. Se construye contexto.
4. Se consulta LocalAI.
5. Se actualiza `chatHistory`.

---

## 💬 Flujo de respuestas sin IA

Algunas respuestas se generan sin llamar a LocalAI:

- saludos simples como `hola`, `buenas`, `hey`
- hora actual
- consultas explícitas de memoria como `qué sabes de mí`, `qué me gusta`

Esto hace que esas respuestas sean instantáneas y no dependan de que LocalAI esté cargado.

---

## 🆕 Flujo de nuevo chat sin proyecto

1. Usuario presiona `+ Nuevo Chat`.
2. Se muestra pantalla inicial.
3. No se crea chat todavía.
4. Usuario escribe primer mensaje.
5. Se crea chat dentro de `general`.
6. Se envía el mensaje.
7. La IA genera un título corto.
8. El chat se renombra automáticamente.
9. El sidebar se actualiza.

---

## 📁 Flujo de nuevo proyecto

1. Usuario presiona `+ Nuevo Proyecto`.
2. Se abre modal para escribir nombre.
3. Usuario confirma.
4. Se crea carpeta del proyecto.
5. Se muestra pantalla inicial.
6. Usuario escribe el primer mensaje.
7. Se crea un chat dentro del proyecto.
8. La IA genera el nombre del chat.
9. El sidebar muestra proyecto y chat.

---

## 📂 Flujo de nuevo chat dentro de proyecto

1. Usuario expande proyecto.
2. Presiona `+ Nuevo chat` dentro del proyecto.
3. Se muestra pantalla inicial.
4. Usuario escribe primer mensaje.
5. Se crea chat dentro de ese proyecto.
6. La IA genera el título del chat.
7. El sidebar se actualiza.

---

## ✏️ Flujo de renombrar

1. Usuario abre menú de tres puntos.
2. Selecciona `Renombrar`.
3. Escribe nuevo nombre.
4. Frontend llama a `/chat/rename` o `/project/rename`.
5. Backend renombra archivo o carpeta.
6. Sidebar se actualiza.

---

## 🗑️ Flujo de eliminar

1. Usuario abre menú de tres puntos.
2. Selecciona `Eliminar`.
3. Se abre modal de confirmación.
4. Usuario confirma.
5. Frontend llama a `/chat/delete` o `/project/delete`.
6. Backend elimina archivo o carpeta.
7. UI vuelve a pantalla inicial.
8. Sidebar se actualiza.

---

## 📎 Flujo de adjuntos

1. Usuario abre el menú de herramientas.
2. Selecciona `Añadir archivo`.
3. Frontend abre `fileInput`.
4. Usuario selecciona uno o varios archivos.
5. `frontend/modules/attachments.js` guarda los archivos en memoria local del frontend.
6. Se muestran chips/previews en el input.
7. Al enviar mensaje, `frontend/api.js` usa `FormData`.
8. Backend recibe archivos con `multer`.
9. `backend/services/attachment.service.js` lee archivos de texto/código soportados.
10. El contenido se agrega como contexto al mensaje enviado a LocalAI.
11. La respuesta se renderiza en el chat.
12. El frontend limpia los adjuntos visuales.

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

---

## 📄 Flujo de generación de documentos

1. Usuario escribe una instrucción como:
   - `Crea un documento PDF sobre LocalAI`
   - `Hazme un documento Word sobre Tempest`
   - `Imprime como TXT una explicación corta`
2. `frontend/app.js` detecta la intención con `detectDocumentRequest()`.
3. Se identifica el formato:
   - `txt`
   - `pdf`
   - `docx`
4. Frontend llama a `generateDocument()` en `frontend/api.js`.
5. `api.js` envía `POST /document/generate`.
6. Backend genera el contenido con LocalAI.
7. `backend/services/document.service.js` normaliza y limpia el contenido.
8. Se crea el archivo en `backend/outputs/documents/`.
9. Backend responde con:
   - `fileUrl`
   - `downloadUrl`
   - `filename`
   - `previewText`
10. Frontend muestra `addDocumentCard()`.
11. Usuario puede abrir o descargar el documento.

---

## 🎙️ Flujo de transcripción de audio

1. Usuario abre menú de herramientas `+`.
2. Selecciona `Transcripción`.
3. Se abre el modal de transcripción.
4. Usuario selecciona archivo de audio.
5. Usuario elige tipo de texto:
   - texto corrido
   - con divisiones de tiempo
6. Usuario elige formato de salida:
   - TXT
   - PDF
   - DOCX
7. Frontend crea chat si no existe.
8. Frontend muestra mensaje:
   `🎙️ Estoy transcribiendo el audio.`
9. Frontend envía `POST /transcribe`.
10. Backend guarda audio temporal en `backend/uploads/audio/`.
11. Backend divide audio en chunks usando ffmpeg.
12. Chunks se guardan temporalmente en `backend/uploads/chunks/`.
13. Backend transcribe fragmentos usando Whisper vía LocalAI.
14. Backend une la transcripción.
15. Backend genera archivo final en:
   `backend/outputs/transcriptions/`
16. Backend elimina:
   - audio original
   - chunks temporales
17. Frontend muestra mensaje:
   `✅ Transcripción finalizada. Ya generé el documento.`
18. Frontend muestra tarjeta descargable.
19. Si el chat era nuevo, se renombra automáticamente usando IA.

---

## ⚠️ Manejo de errores

- Mensaje vacío.
- Error de conexión con backend.
- Timeout de LocalAI.
- Error de LocalAI.
- Modelo no disponible.
- Archivo no seleccionado.
- Error en carga de adjuntos.
- Error en generación de documentos.
- Error en transcripción.
- Nombre de chat/proyecto repetido.