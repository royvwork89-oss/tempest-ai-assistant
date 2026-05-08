# Decisiones de Diseño - Tempest

Este documento registra las decisiones técnicas principales tomadas durante el desarrollo.

---

## 🧠 Uso de LocalAI como motor principal

### Decisión
Usar LocalAI como motor principal de inferencia.

### Razón
- Independencia de servicios externos, privacidad, ejecución local, sin costo por token, control sobre modelos GGUF.

### Impacto
- Más control, mayor complejidad técnica, menor potencia que modelos comerciales grandes.

---

## ⚙️ Backend en Node.js + Express

### Decisión
Construir el backend con Node.js y Express.

### Razón
- Simple de depurar, alineado con JavaScript del frontend, buena base para APIs REST, modularización clara.

### Impacto
- Desarrollo rápido, fácil expansión, buen proyecto de portafolio backend.

---

## 🧩 Arquitectura modular

### Decisión
Separar el backend en routes / controllers / services / utils / config.

### Impacto
- Código más profesional, cambios localizados, base preparada para crecer.

---

## 🧠 Memoria jerárquica

### Decisión
Separar memoria en tres niveles: Usuario → Proyecto → Chat.

### Razón
- Evitar mezclar conversaciones, permitir proyectos con múltiples chats, aislar historiales individuales.

### Impacto
- Mejor organización, experiencia parecida a ChatGPT, base para multiusuario real.

---

## 📁 Uso de JSON para persistencia inicial

### Decisión
Guardar memoria, proyectos y chats en archivos JSON.

### Razón
- Fácil de inspeccionar, rápido de implementar, ideal para MVP local.

### Impacto
- Depuración sencilla, futura migración necesaria a DB si crece.

---

## 💬 Chats independientes y chats por proyecto

### Decisión
Permitir dos tipos de conversación: chats sin proyecto en `general` y chats ligados a proyectos.

### Impacto
- Mejor UX, mejor organización, más lógica en frontend y memoria.

---

## 🏷️ Renombrado automático con IA

### Decisión
Usar la primera consulta para generar título automático del chat.

### Impacto
- Sidebar más útil, requiere endpoint `/title/generate`, depende de LocalAI.

---

## 🧾 Modal propio para confirmación

### Decisión
Usar un modal interno en lugar de `confirm()` del navegador.

### Impacto
- Interfaz más profesional, más código frontend.

---

## 🎙️ Transcripción local

### Decisión
Implementar transcripción con ffmpeg + LocalAI Whisper.

### Impacto
- Mayor privacidad, mayor carga técnica, requiere limpieza de temporales.

---

## 📎 Sistema de adjuntos con extracción de texto

### Decisión
Extraer texto de los archivos adjuntos en el backend e inyectarlo al prompt como contexto plano, en lugar de enviar el archivo directamente a LocalAI.

### Razón
- LocalAI solo recibe texto. No puede procesar archivos binarios directamente.
- Mantiene la arquitectura simple: el modelo solo ve texto bien estructurado.
- Permite truncado inteligente antes de enviar al modelo.

### Impacto
- LocalAI puede "leer" documentos sin soporte nativo de archivos.
- Diferencia entre calidad de extracción según tipo de archivo.
- Requiere librerías específicas por formato.

---

## 📎 Librerías de extracción por tipo de archivo

### Decisión
- **PDF**: `pdf2json` — descartados `pdf-parse` (bug de exports en versiones recientes) y `pdfjs-dist` (ruta `/legacy/build/pdf.js` eliminada en v5.x).
- **DOCX**: `mammoth` — extracción limpia de texto plano.
- **XLSX**: `xlsx` — conversión por hoja a CSV, cada hoja etiquetada.
- **Imágenes**: placeholder con metadata (nombre, tamaño, tipo). LocalAI no analiza imágenes visualmente.

### Razón
- `pdf-parse` falla con `Package subpath './lib/pdf-parse.js' is not defined by exports`.
- `pdfjs-dist` v5.x eliminó la ruta legacy usada en Node.js.
- `pdf2json` funciona nativamente sin problemas de exports.

---

## 📎 Truncado inteligente diferenciado

### Decisión
Truncar de forma diferente según el tipo de archivo:
- **Código**: 60% cabecera (imports/firmas) + 30% final (donde suelen estar los bugs).
- **Documentos**: 65% inicio + 25% final.
- Límite: 7500 caracteres.

### Razón
- Evitar enviar contexto infinito al modelo.
- Preservar las partes más útiles según el tipo de contenido.

---

## 📎 Limpieza de temporales en doble capa

### Decisión
- **Capa A**: limpieza inmediata en bloque `finally` tras cada request.
- **Capa B**: job escoba con `setInterval` cada 6h que borra archivos con más de 24h en `uploads/attachments/`.

### Razón
- La Capa A puede fallar si el proceso se interrumpe.
- La Capa B actúa como red de seguridad.

---

## 📎 chatHistory vs workingMemory para adjuntos

### Decisión
- `chatHistory` guarda el mensaje completo incluyendo el bloque `--- ARCHIVOS ADJUNTOS ---`.
- `workingMemory` guarda el contexto extraído por separado.

### Razón
- Permite que preguntas de seguimiento ("¿puedes resumir la sección 3?") tengan acceso al contenido del archivo.
- Evitar duplicar el bloque en memoria de trabajo.

---

## 🤖 Modelos Q4, Q5 y Q6

### Decisión
Soportar tres perfiles de calidad de modelo GGUF: Q4 (rápido), Q5 (equilibrado), Q6 (calidad).

### Razón
- Dar flexibilidad según recursos disponibles.

### Fix aplicado
- El nombre de archivo en los YAML usaba guión en lugar de punto antes de Q5/Q6.
- `n_gpu_layers` debe ir dentro de `parameters`, no como campo raíz.

---

## 🔮 Decisiones futuras

- Implementar PPTX con extracción XML de ZIP.
- Implementar LibreOffice headless desde Node para mejor calidad de extracción.
- **Modo híbrido de modelos:**
  - LocalAI con Qwen2.5-Coder-14B para código rutinario, refactorización simple y trabajo del día a día.
  - Claude API / OpenAI API para arquitectura compleja, problemas difíciles o cuando el modelo local no alcanza.
  - Selección manual desde el menú o automática según complejidad de la consulta.
- Migrar memoria JSON a base de datos.
- Añadir login real.
- Añadir resumen automático por chat/proyecto.
- Añadir embeddings para búsqueda semántica.
- Función de voz al chat: hablar → texto → consulta.
- Stream de audio en vivo con Faster-Whisper.