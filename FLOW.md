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

1. Usuario selecciona modo "Automático" en el menú.
2. Al enviar mensaje, el frontend analiza el texto.
3. Si contiene palabras clave complejas (código, arquitectura, explica, paso a paso) → modelo inteligente.
4. Si contiene palabras medias (ejemplo, comparar, recomienda, cómo) → modelo equilibrado.
5. Si es conversación simple → modelo rápido.
6. El modelo seleccionado se muestra en el botón del menú.
7. Se envía al backend como `primaryModel`.

---

## 🤖 Flujo con control de respuesta IA

1. Backend recibe respuesta del modelo.
2. Se limpia el contenido (`cleanReply`).
3. Se analiza si la respuesta está incompleta (`looksLikeCutReply`).
4. Si está incompleta:
   - se elimina el bloque corrupto (`removeIncompleteFileBlock`)
   - se solicita regeneración del archivo faltante con nuevo AbortController
5. Se recibe nueva respuesta.
6. Se unen ambas respuestas de forma limpia.
7. Se entrega resultado final completo al frontend.

---

## ⏱️ Flujo de timeout

1. Se crea un AbortController antes del fetch a LocalAI.
2. Se inicia un timer de 120 segundos.
3. Si LocalAI responde antes → se cancela el timer.
4. Si LocalAI no responde en 120 segundos → se aborta la petición.
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

- **Saludos simples** (`hola`, `buenas`, `hey`) → respuesta hardcodeada con nombre del usuario.
- **Hora actual** (`qué hora es`, `dame la hora`) → el servidor calcula y devuelve la hora.
- **Consultas de memoria** (`qué sabes de mí`, `qué me gusta`) → se lee el perfil JSON directamente.

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

## 🎙️ Flujo de transcripción de audio

1. Usuario abre menú de herramientas (+).
2. Selecciona `Transcripción`.
3. Selecciona audio.
4. Elige modo y formato.
5. Frontend envía `POST /transcribe`.
6. Backend guarda audio temporal.
7. ffmpeg divide en fragmentos.
8. LocalAI Whisper transcribe fragmentos.
9. Backend une resultados.
10. Se genera archivo TXT/PDF/DOCX.
11. Se devuelve URL pública.
12. Frontend muestra ruta y link.

---

## ⚠️ Manejo de errores

- Mensaje vacío.
- Error de conexión con backend.
- Timeout de LocalAI (120 segundos).
- Error de LocalAI (modelo no disponible).
- Error de archivo no seleccionado.
- Error en transcripción.
- Nombre de chat/proyecto repetido.
