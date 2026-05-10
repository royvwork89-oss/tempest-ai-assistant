# Decisiones de Diseño - Tempest

Este documento registra las decisiones técnicas principales tomadas durante el desarrollo.

---

## 🧠 Uso de LocalAI como motor principal

### Decisión
Usar LocalAI como motor principal de inferencia.

### Razón
Independencia de servicios externos, privacidad, ejecución local, sin costo por token, control sobre modelos GGUF.

### Impacto
Más control, mayor complejidad técnica, menor potencia que modelos comerciales grandes.

---

## ⚙️ Backend en Node.js + Express

### Decisión
Construir el backend con Node.js y Express.

### Razón
Simple de depurar, alineado con JavaScript del frontend, buena base para APIs REST, modularización clara.

### Impacto
Desarrollo rápido, fácil expansión, buen proyecto de portafolio backend.

---

## 🧩 Arquitectura modular

### Decisión
Separar el backend en routes / controllers / services / utils / config.

### Impacto
Código más profesional, cambios localizados, base preparada para crecer.

---

## 🧠 Memoria jerárquica

### Decisión
Separar memoria en tres niveles: Usuario → Proyecto → Chat.

### Razón
Evitar mezclar conversaciones, permitir proyectos con múltiples chats, aislar historiales individuales.

### Impacto
Mejor organización, experiencia parecida a ChatGPT, base para multiusuario real.

---

## 📁 Uso de JSON para persistencia inicial

### Decisión
Guardar memoria, proyectos y chats en archivos JSON.

### Razón
Fácil de inspeccionar, rápido de implementar, ideal para MVP local.

### Impacto
Depuración sencilla, futura migración necesaria a DB si crece.

---

## 💬 Chats independientes y chats por proyecto

### Decisión
Permitir dos tipos de conversación: chats sin proyecto en `general` y chats ligados a proyectos.

### Impacto
Mejor UX, mejor organización, más lógica en frontend y memoria.

---

## 🏷️ Renombrado automático con IA

### Decisión
Usar la primera consulta para generar título automático del chat.

### Impacto
Sidebar más útil, requiere endpoint `/title/generate`, depende de LocalAI.

---

## 🏷️ Generador de títulos optimizado

### Decisión
- Limpiar el bloque `--- ARCHIVOS ADJUNTOS ---` antes de enviarlo al modelo generador.
- Usar `max_tokens: 12` en lugar de 20.
- System prompt directo sin redundancia con el mensaje de usuario.
- Truncar texto a 300 caracteres.
- Si el mensaje está vacío pero hay archivos adjuntos, usar los nombres de los archivos como texto base.

### Razón
El bloque de adjuntos confundía al modelo. Reducir tokens fuerza títulos más cortos y precisos.

### Impacto
Títulos más relevantes y generación más rápida.

---

## 🧾 Modal propio para renombrar

### Decisión
Reemplazar `prompt()` nativo del navegador por un modal visual propio.

### Razón
El `prompt()` nativo es inconsistente entre navegadores, no se puede estilizar y rompe la experiencia visual.

### Impacto
UX más profesional y consistente. El modal soporta validación inline con mensaje de error en rojo.

---

## ✅ Validación de nombres

### Decisión
Validar nombres de chats y proyectos con estas reglas: no vacío, mínimo 2 caracteres, sin caracteres inválidos (`\ / : * ? " < > |`), no empieza con punto, máximo 60 caracteres.

### Razón
Evitar errores del sistema de archivos al crear carpetas y archivos JSON con nombres inválidos.

### Impacto
Mayor robustez. Los errores se muestran inline sin cerrar el modal.

---

## 🧾 Modal propio para confirmación

### Decisión
Usar un modal interno en lugar de `confirm()` del navegador.

### Impacto
Interfaz más profesional, más código frontend.

---

## 🎙️ Transcripción local

### Decisión
Implementar transcripción con ffmpeg + LocalAI Whisper.

### Impacto
Mayor privacidad, mayor carga técnica, requiere limpieza de temporales.

---

## 📎 Sistema de adjuntos con extracción de texto

### Decisión
Extraer texto de los archivos adjuntos en el backend e inyectarlo al prompt como contexto plano.

### Razón
LocalAI solo recibe texto. No puede procesar archivos binarios directamente.

### Impacto
LocalAI puede "leer" documentos sin soporte nativo de archivos.

---

## 📎 Librerías de extracción por tipo de archivo

### Decisión
- **PDF**: `pdf2json` — descartados `pdf-parse` y `pdfjs-dist` por bugs.
- **DOCX**: `mammoth` — extracción limpia de texto plano.
- **XLSX**: `xlsx` — conversión por hoja a CSV etiquetado.
- **Imágenes**: placeholder con metadata.

---

## 📎 Truncado inteligente diferenciado

### Decisión
- **Código**: 60% cabecera + 30% final, límite 7500 chars.
- **Documentos**: 65% inicio + 25% final, límite 7500 chars.

---

## 📎 Limpieza de temporales en doble capa

### Decisión
- **Capa A**: limpieza inmediata en bloque `finally` tras cada request.
- **Capa B**: job escoba con `setInterval` cada 6h.

---

## 📎 chatHistory vs workingMemory para adjuntos

### Decisión
- `chatHistory` guarda el mensaje completo incluyendo el bloque `--- ARCHIVOS ADJUNTOS ---`.
- `workingMemory` guarda el contexto extraído por separado.

### Razón
Permite preguntas de seguimiento con acceso al contenido del archivo.

---

## 🤖 Modelos Q4, Q5 y Q6

### Decisión
Soportar tres perfiles de calidad de modelo GGUF: Q4 (rápido), Q5 (equilibrado), Q6 (calidad).

---

## 🧠 Router de modos: coder / explain / general

### Decisión
Crear `services/mode.router.js` como módulo independiente que detecta el modo de respuesta por mensaje.

### Razón
La detección binaria anterior (explicación vs código) no cubría casos mixtos ni adjuntos no-código. Separar la lógica en su propio archivo permite testearla, extenderla y leerla de forma independiente sin tocar el controller.

### Arquitectura
- `mode.router.js` — `detectMode({ rawMessage, files, configMode })` → `{ mode, variant, reason }`
- `chat.controller.js` — llama al router, aplica prefijo según `variant`, pasa `mode` a `streamOptions`
- `localai.service.js` — pasa `options.mode` a `getMaxTokens`
- `token.profiles.js` — `getMaxTokens` acepta `'coder'|'explain'|'general'|'continue'`

### Heurística (orden de prioridad)
1. Override manual del frontend (`config.mode`) → gana siempre
2. Sin texto + adjunto de código → `coder/strict`
3. Sin texto + adjunto no-código → `explain`
4. Adjunto + verbo técnico → `coder/strict`
5. Adjunto + verbo de lectura → `explain`
6. Trigger código explícito + trigger explicación → `coder/hybrid`
7. Trigger explicación + tecnología mencionada → `explain`
8. Solo trigger de código → `coder/strict`
9. Default → `general`

### Submodos internos (variant)
- `strict` — solo código/archivos, sin explicación
- `hybrid` — explicación breve + código
- `null` — sin modificación al mensaje

### Texto default del frontend
El mensaje `"Analiza los archivos adjuntos."` que manda el frontend cuando no hay texto escrito se trata como texto vacío en el router para no interferir con la detección por tipo de adjunto.

### Log
```
[MODE ROUTER] mode=coder variant=hybrid reason="trigger mixto: explicación + código explícito"
```

### Impacto
Respuestas más precisas según intención. Tokens ajustados automáticamente al modo. Sin `confidence` — se agrega cuando haya datos reales para calibrarlo.

---

## 💬 Íconos SVG en botones de acción

### Decisión
Reemplazar texto ("Copiar", "Editar", "Compartir") por íconos SVG inline en los botones de acción por mensaje y en el botón de copiar de bloques de código.

### Razón
Consistencia visual con Claude y ChatGPT. Menos espacio ocupado. Mejor experiencia en hover.

### Impacto
- Botones visibles solo al hacer hover sobre el mensaje (`opacity: 0` → `opacity: 1`).
- `user-select: none` en `.message-actions` evita que los botones se incluyan al seleccionar texto.
- Ícono cambia a checkmark al copiar y vuelve al original tras 1.5s.

---

## ⌨️ Rediseño del área de entrada

### Decisión
Cambiar el layout del input de grid a flexbox con dos secciones: textarea arriba, barra de herramientas abajo.

### Razón
El grid anterior causaba que el botón de enviar se desplazara o quedara invisible al crecer el textarea. La barra inferior con flexbox `justify-content: space-between` mantiene `+` a la izquierda y enviar a la derecha siempre visibles.

### Estructura
```
┌─────────────────────────────────┐
│  [adjuntos si los hay]          │
│  textarea (crece hacia arriba)  │
├─────────────────────────────────┤
│  [+]              [➤ enviar]    │
└─────────────────────────────────┘
```

### Botón enviar
- Ícono avión de papel (SVG `fill="currentColor"`).
- Siempre visible en la barra inferior.
- Color azul `#2563eb`, hover `#1d4ed8`.

### Impacto
Layout estable sin importar el tamaño del texto. Botones siempre accesibles.

---

## 🌊 Streaming de respuesta con SSE

### Decisión
Implementar streaming de respuesta usando Server-Sent Events (SSE) en el backend y `ReadableStream` en el frontend.

### Razón
Sin streaming el usuario espera en silencio hasta que LocalAI termina de generar toda la respuesta.

### Problema resuelto: tokens especiales de Hermes
LocalAI con modelos Hermes envía tokens especiales letra por letra. La solución fue limpiarlos en `finalizeStreamingBubble` sobre el `fullText` acumulado.

### Impacto
Experiencia de usuario significativamente mejor.

---

## 🔮 Decisiones futuras

- Implementar PPTX con extracción XML de ZIP.
- Implementar LibreOffice headless desde Node.
- **Modo híbrido de modelos:** LocalAI con Qwen2.5-Coder-14B para código rutinario, Claude API / OpenAI API para arquitectura compleja.
- Migrar memoria JSON a base de datos.
- Añadir login real.
- Añadir resumen automático por chat/proyecto.
- Añadir embeddings para búsqueda semántica.
- Añadir `confidence` al router de modos cuando haya datos reales para calibrarlo.
- Ordenar chats por fecha de último mensaje.
- Mostrar opciones de acción al seleccionar texto manualmente.