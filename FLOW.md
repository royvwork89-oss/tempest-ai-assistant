# Flujo del Sistema - Tempest

## 💬 Flujo normal de chat

1. Usuario escribe mensaje.
2. Frontend valida que no esté vacío.
3. Si no hay chat activo, se crea uno en el contexto correcto.
4. Frontend envía `POST /chat`.
5. Backend detecta si el mensaje es una solicitud de explicación.
6. Backend recibe mensaje y memoria activa.
7. Backend envía contexto a LocalAI.
8. LocalAI genera respuesta.
9. Backend guarda mensaje y respuesta.
10. Frontend renderiza respuesta (separando archivos en bloques individuales si aplica).

---

## 📎 Flujo de chat con archivos adjuntos

1. Usuario adjunta archivos (botón + o drag & drop).
2. Frontend muestra chips visuales de los archivos.
3. Al enviar, `api.js` construye un `FormData` con el mensaje y los archivos.
4. Backend recibe la petición via multer, guarda temporales en `uploads/attachments/`.
5. `attachment.service.js` valida cada archivo (mimetype + extensión + magic bytes para PDF).
6. Se extrae texto según tipo: pdf2json / mammoth / xlsx / fs.readFile / placeholder imagen.
7. El texto se trunca inteligentemente según tipo (código o documento).
8. Se construye el bloque `--- ARCHIVOS ADJUNTOS ---` y se inyecta al prompt.
9. `chatHistory` guarda el mensaje completo con el bloque de adjuntos.
10. LocalAI recibe el contexto completo y responde.
11. Bloque `finally`: `cleanupFiles` elimina los temporales (Capa A).
12. Frontend renderiza la respuesta.

---

## 🧠 Flujo con memoria

1. Frontend envía `userId`, `projectId` y `chatId`.
2. Backend localiza memoria global, de proyecto y de chat.
3. Se construye contexto.
4. Se consulta LocalAI.
5. Se actualiza `chatHistory`.

---

## 🆕 Flujo de nuevo chat sin proyecto

1. Usuario presiona `+ Nuevo Chat`.
2. Se muestra pantalla inicial.
3. No se crea chat todavía.
4. Usuario escribe primer mensaje (o adjunta archivos sin texto).
5. Se crea chat dentro de `general`.
6. Se envía el mensaje.
7. La IA genera un título corto basado en el mensaje o en los nombres de archivos adjuntos.
8. El chat se renombra automáticamente.
9. El sidebar muestra el nuevo nombre.

---

## 📁 Flujo de nuevo proyecto

1. Usuario presiona `+ Nuevo Proyecto`.
2. Se abre modal para escribir nombre.
3. Se valida el nombre (caracteres inválidos, longitud).
4. Usuario confirma.
5. Se crea carpeta del proyecto.
6. Se muestra pantalla inicial.
7. Usuario escribe el primer mensaje.
8. Se crea un chat dentro del proyecto.
9. La IA genera el nombre del chat.
10. El sidebar muestra proyecto y chat.

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
3. Se abre modal propio con el nombre actual pre-cargado.
4. Usuario escribe nuevo nombre.
5. Se valida el nombre (caracteres inválidos, longitud mínima/máxima).
6. Si hay error, se muestra en rojo sin cerrar el modal.
7. Si es válido, Frontend llama a `/chat/rename` o `/project/rename`.
8. Backend renombra archivo o carpeta.
9. Sidebar se actualiza.

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

## 🧹 Flujo de limpieza de temporales

**Capa A — inmediata:**
- Tras cada request en `chat.controller.js`, el bloque `finally` llama a `cleanupFiles`.
- Borra todos los archivos subidos en esa petición.

**Capa B — job escoba:**
- `server.js` ejecuta `setInterval` cada 6 horas.
- Recorre `uploads/attachments/` y elimina archivos con más de 24h de antigüedad.
- Actúa como red de seguridad si la Capa A falla.

---

## 🧠 Flujo de detección de intención

1. `chat.controller.js` recibe el mensaje del usuario.
2. `isExplanationRequest()` normaliza el texto y busca palabras clave: "explícame", "qué es", "cómo funciona", "cuéntame", etc.
3. Si detecta solicitud de explicación y no hay archivos adjuntos → prefija el mensaje con `"Responde SOLO con texto explicativo, sin código."`.
4. Si no detecta explicación → envía el mensaje sin modificar.
5. El model responde acorde a la instrucción recibida.

---

## ⚠️ Manejo de errores

- Mensaje vacío.
- Error de conexión con backend.
- Error de LocalAI.
- Error de archivo no seleccionado.
- Error en transcripción.
- Nombre de chat/proyecto con caracteres inválidos (mostrado inline en modal).
- Nombre demasiado corto o largo.
- Archivo con mimetype o extensión no permitida.
- Error de extracción de texto (PDF corrupto, DOCX dañado, etc.).