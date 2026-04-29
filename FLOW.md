# Flujo del Sistema - Tempest

## 💬 Flujo normal de chat

1. Usuario escribe mensaje.
2. Frontend valida que no esté vacío.
3. Si no hay chat activo, se crea uno en el contexto correcto.
4. Frontend envía `POST /chat`.
5. Backend recibe mensaje y memoria activa.
6. Backend envía contexto a LocalAI.
7. LocalAI genera respuesta.
8. Backend guarda mensaje y respuesta.
9. Frontend renderiza respuesta.

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
4. Frontend llama:
   - `/chat/rename`
   - `/project/rename`
5. Backend renombra archivo o carpeta.
6. Sidebar se actualiza.

---

## 🗑️ Flujo de eliminar

1. Usuario abre menú de tres puntos.
2. Selecciona `Eliminar`.
3. Se abre modal de confirmación.
4. Usuario confirma.
5. Frontend llama:
   - `/chat/delete`
   - `/project/delete`
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
- Error de LocalAI.
- Error de archivo no seleccionado.
- Error en transcripción.
- Nombre de chat/proyecto repetido.

