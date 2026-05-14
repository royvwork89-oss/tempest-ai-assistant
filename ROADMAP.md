# 🧩 Tempest - Roadmap

## 🚧 Estado actual

Versión actual: **v1.2.0**

Sistema funcional con:

- Chat local con IA (modelos Q4, Q5, Q6)
- LocalAI como motor principal
- Memoria por usuario/proyecto/chat
- Chats independientes y por proyecto
- Sidebar tipo workspace
- Renombrar y eliminar chats/proyectos
- **Modal propio para renombrar** (reemplazó `prompt()` nativo)
- **Validación de nombres** para caracteres inválidos en renombrar y nuevo proyecto
- Modal de confirmación para eliminar
- Creación de proyectos con nombre manual
- Renombrado automático de chats con IA
- **Generador de títulos mejorado** — más rápido, limpia bloque de adjuntos, prompt optimizado
- **Renombrado de chat cuando el primer mensaje es solo un archivo adjunto**
- Transcripción de audio con exportación TXT/PDF/DOCX
- Menú de herramientas (+)
- Renderizado de bloques de código estilo terminal
- **Separación automática de múltiples archivos en bloques individuales**
- **Router de modos automático** — `coder/strict`, `coder/hybrid`, `explain`, `general` con heurística
- **Botones de acción con íconos SVG** — sin texto, estilo Claude/ChatGPT, visibles al hacer hover
- **Selección de texto sin capturar botones** — `user-select: none` en acciones
- **Botón enviar con ícono de avión de papel** dentro del área de entrada
- **Barra de herramientas fija** debajo del textarea (+ izquierda, enviar derecha)
- Input multilínea con `Shift + Enter`
- Textarea autoexpandible con límite de altura
- Modo selección para eliminar múltiples chats independientes
- **Sistema de adjuntos completo:**
  - Drag & drop sobre chat y área de input
  - Chips visuales con preview de imágenes
  - PDF (pdf2json), DOCX (mammoth), XLSX (xlsx), **PPTX (unzipper + XML)**, TXT, código, imágenes
  - Extractor PPTX modular con notas del presentador, tablas y tolerancia a fallos por slide
  - Truncado inteligente por tipo
  - Limpieza automática doble capa
  - Contexto inyectado al prompt de LocalAI
  - Arquitectura de extractores con contrato estándar `{ name, type, content, truncated, original, meta? }`
- **sanitize.js** — capa centralizada de post-procesado de salidas del modelo (función pura)
- **Historial limpio** — prefijos internos de instrucción no se guardan en `chatHistory`
- **Airbag visual en frontend** — capa independiente de limpieza en `finalizeStreamingBubble`
- **Historial de conversación corregido** (sin duplicados)
- **Modelos Q4, Q5 y Q6 funcionando**
- **Streaming de respuesta** — texto aparece palabra por palabra mientras LocalAI genera
- **Manejo de errores visual** — toast de sistema + burbuja de error en chat

---

## 🎯 v1.0 — Uso diario real ✅

- [x] Streaming de respuesta (texto aparece palabra por palabra)
- [x] Modal propio para renombrar
- [x] Mejorar prompt del generador de títulos
- [x] Renombrar chat cuando el primer mensaje es solo archivo adjunto sin texto
- [x] Validación de nombres para caracteres inválidos
- [x] Manejo de errores visual

---

## 🎯 v1.1 — Experiencia de uso mejorada ✅

- [x] Router de modos automático — `coder/strict`, `coder/hybrid`, `explain`, `general`
- [x] Botones de acción con íconos SVG estilo Claude/ChatGPT
- [x] Acciones visibles solo al hacer hover, sin interferir con selección de texto
- [x] Botón enviar con ícono de avión de papel dentro del área de entrada
- [x] Barra de herramientas fija debajo del textarea

---

## 🎯 v1.2 — Adjuntos completos + sanitización ✅

- [x] Lectura de PPTX (extractor modular, unzipper + XML, notas del presentador, tablas)
- [x] sanitize.js — capa centralizada de post-procesado del modelo (función pura)
- [x] Historial limpio — prefijos internos separados del historial de conversación
- [x] Airbag visual en frontend — limpieza independiente antes de renderizar

---

## 🔥 Prioridad alta

### 🗂️ Sidebar

- [ ] Invertir orden del sidebar: proyectos arriba, chats independientes abajo
- [ ] Ordenar chats por fecha de último mensaje (más reciente arriba)
- [ ] Mover chat al tope de la lista al generar un nuevo mensaje
- [ ] Guardar estado de proyecto colapsado/expandido en localStorage
- [ ] Mejorar visual de proyecto activo/chat activo
- [ ] Extender eliminación múltiple a chats dentro de proyectos
- [ ] Añadir selección múltiple dentro de cada proyecto

### 💬 Acciones por mensaje

- [ ] Mostrar opciones de acción al seleccionar texto manualmente con el cursor
- [ ] Activar edición de consultas del usuario
- [ ] Activar compartir respuestas
- [ ] Activar intentar nuevamente en respuestas de Tempest

### 📎 Adjuntos — pendiente

- [ ] Implementar LibreOffice headless para mejor calidad de extracción de documentos
- [ ] Añadir soporte visual para archivos adjuntos en el historial del chat
- [ ] Orden real de slides PPTX leyendo `ppt/presentation.xml` (v2 del extractor)

### 🧠 Memoria

- [ ] Mejorar detección de datos importantes
- [ ] Evitar duplicados en perfil/memoria
- [ ] Añadir resumen automático por chat
- [ ] Añadir resumen automático por proyecto
- [ ] Separar memoria corta y larga de forma más estricta
- [ ] Limpiar historial viejo sin perder resumen

### 🧩 Proyectos y chats

- [ ] Evitar nombres duplicados de chats/proyectos
- [ ] Usar modelo más ligero para generación de títulos
- [ ] Permitir renombrado automático opcional de proyectos
- [ ] Añadir opción de cancelar creación de chat pendiente

### 🧾 UI/UX

- [ ] Añadir loader animado de respuesta
- [ ] Añadir confirmación visual al renombrar
- [ ] Mejorar diseño móvil

---

## ⚙️ Transcripción de audio

- [ ] Implementar corte por silencio real (VAD)
- [ ] Mejorar manejo de errores por fragmento
- [ ] Optimizar tiempo de procesamiento
- [ ] Permitir elegir idioma del audio
- [ ] Limpiar automáticamente uploads/audio
- [ ] Limpiar automáticamente uploads/chunks
- [ ] Añadir análisis automático de transcripción
- [ ] Enviar transcripción al chat como contexto opcional

---

## 📄 Exportación

- [ ] Mejorar formato de PDF
- [ ] Mejorar formato DOCX
- [ ] Añadir descarga directa desde frontend
- [ ] Permitir elegir solo un formato de salida
- [ ] Añadir nombres de archivo más descriptivos

---

## 🤖 Integración IA

### Modelos locales
- [ ] Configurar Qwen2.5-Coder-14B en desktop (YAML + modelo GGUF)
- [ ] Implementar cambio real de modelo desde el menú
- [ ] Añadir selección automática de modelo según la consulta
- [ ] Añadir análisis de archivos con visión (imágenes reales)
- [ ] Añadir herramientas nuevas al menú +
- [ ] Mostrar en el chat cuándo inicia y cuándo termina una transcripción

### APIs externas
- [ ] Integrar Claude API como motor alternativo
- [ ] Integrar OpenAI API como motor alternativo
- [ ] Implementar modo híbrido: LocalAI para trabajo rutinario, API externa para problemas complejos
- [ ] Selección manual de motor desde el menú (local / Claude / GPT)
- [ ] Selección automática de motor según complejidad de la consulta

---

## 🧑‍💻 Tempest como asistente de programación

### 🔀 Prioridad 1 — Enrutador de modelos y modos
- [x] Implementar router de modos: `coder` / `explain` / `general`
- [x] Heurística automática para detección de modo (keywords + tipo de adjunto)
- [ ] Cada modo carga su modelo automáticamente sin que el usuario elija

### 🧱 Prioridad 2 — System prompt por capas por proyecto
- [ ] Capa 1: prompt base global (estilo, seguridad, formatos)
- [ ] Capa 2: prompt de proyecto (stack: Node/Express, React, Python, etc.) — configurable por proyecto
- [ ] Capa 3: prompt de tarea (coder/explain/general) — inyectado por el router
- [ ] UI para editar el prompt de proyecto desde la pantalla de configuración del proyecto

### 📸 Prioridad 3 — Context Snapshot del repo
- [ ] Generar `projectContext.json` por proyecto con extracto truncado de archivos relevantes
- [ ] Filtrar por extensión y archivos clave (README, package.json, routes, controllers, services)
- [ ] Usar hash/mtime para refrescar solo archivos que cambiaron
- [ ] Subir al contexto archivos mencionados explícitamente por el usuario

### 🩹 Prioridad 4 — Patch Mode para cambios de código
- [ ] Tempest responde cambios en formato diff/patch en lugar de bloques completos
- [ ] Formato: archivo + línea anterior + línea nueva

### 🤖 Modelos recomendados para programación
- [ ] DeepSeek-Coder 6.7B — modelo default para código diario (rápido)
- [ ] Qwen2.5-Coder 14B — modo calidad/arquitectura
- [ ] CodeLlama 13B — backup/comparación
- [ ] Router elige modelo automáticamente según modo detectado

---

## 📬 Integración de correo (Outlook)

- [ ] Registrar app en Azure Portal y configurar OAuth 2.0 con Microsoft Graph API
- [ ] Flujo de autenticación — abre navegador una vez, guarda token para sesiones futuras
- [ ] Leer correos no leídos desde el chat
- [ ] Resumir correos con LocalAI
- [ ] Responder correos desde el chat
- [ ] Organizar correos — mover a carpetas desde el chat

---

## 📁 Context files por proyecto

- [ ] **Opción 1 — Subida manual desde la interfaz:** subir archivos asociados a un proyecto, disponibles en todos sus chats sin adjuntarlos cada vez
- [ ] **Opción 2 — Lectura de carpeta del disco:** configurar una ruta local por proyecto, Tempest lee automáticamente los archivos de esa carpeta
- [ ] Pantalla de configuración inicial al crear proyecto

---

## 🧪 Testing

- [ ] Probar `/chat` con y sin adjuntos
- [ ] Probar `/chat/history`
- [ ] Probar `/chat/create`
- [ ] Probar `/chat/rename`
- [ ] Probar `/chat/delete`
- [ ] Probar `/project/create`
- [ ] Probar `/project/rename`
- [ ] Probar `/project/delete`
- [ ] Probar `/title/generate`
- [ ] Probar `/transcribe`
- [ ] Probar adjuntos: PDF, DOCX, XLSX, PPTX, TXT, código, imágenes
- [ ] Probar router de modos: explain / coder strict / coder hybrid / general
- [ ] Probar sanitize.js con distintos tipos de basura del modelo

---

## 🎯 v2.0 — Tempest como asistente de programación contextual

### 🧠 Contexto y comprensión del proyecto
- [ ] Context Snapshot del repo — generación de `projectContext.json` con estructura, archivos relevantes, hash y mtime
- [ ] Context files por proyecto — subida manual + lectura opcional de carpetas del disco
- [ ] System prompts por capas — contexto global + proyecto + tarea activa

### 🤖 Inteligencia y selección de modelos
- [ ] Router inteligente de modelos — selección automática según modo detectado y tipo de tarea
- [ ] DeepSeek-Coder 6.7B como modelo principal para programación diaria
- [ ] Qwen2.5-Coder 14B para tareas de arquitectura, calidad y razonamiento complejo
- [ ] CodeLlama 13B como fallback, comparación o recuperación

### 🛠️ Edición y flujo de desarrollo
- [ ] Patch Mode — generación de cambios en formato diff en lugar de archivos completos
- [ ] Aplicación parcial de cambios sobre archivos existentes
- [ ] Mejoras futuras para continuidad de contexto entre sesiones técnicas

### ⚙️ Experiencia de proyecto
- [ ] Pantalla de configuración inicial al crear proyecto
- [ ] Configuración persistente por proyecto (modelo, modo, prompts, contexto)

---

## 🔮 vX.x

- [ ] Añadir respaldo/exportación de memoria
- [ ] LibreOffice headless para extracción de documentos de alta fidelidad
- [ ] Orden real de slides PPTX via `ppt/presentation.xml`
- [ ] Función de voz al chat: hablar → texto → consulta
- [ ] Stream de audio en vivo con Faster-Whisper
- [ ] Migrar JSON a SQLite/PostgreSQL
- [ ] Añadir sistema de login
- [ ] Añadir múltiples usuarios reales
- [ ] Añadir búsqueda semántica con embeddings
- [ ] Añadir app desktop con Electron
- [ ] Añadir sincronización opcional
- [ ] Integración de correo Outlook (Microsoft Graph API + OAuth 2.0)