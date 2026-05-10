# 🧩 Tempest - Roadmap

## 🚧 Estado actual

Versión actual: **v1.0.0**

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
- **Detección de intención** — responde con texto cuando se pide explicación, con código cuando se pide código
- Botón para copiar código dentro de bloques
- Input multilínea con `Shift + Enter`
- Textarea autoexpandible con límite de altura
- Modo selección para eliminar múltiples chats independientes
- Botones de acción por mensaje (copiar consulta, copiar respuesta, editar*, compartir*, reintentar*)
- **Sistema de adjuntos completo:**
  - Drag & drop sobre chat y área de input
  - Chips visuales con preview de imágenes
  - PDF (pdf2json), DOCX (mammoth), XLSX (xlsx), TXT, código, imágenes
  - Truncado inteligente por tipo
  - Limpieza automática doble capa
  - Contexto inyectado al prompt de LocalAI
- **Historial de conversación corregido** (sin duplicados)
- **Modelos Q4, Q5 y Q6 funcionando**
- **Streaming de respuesta** — texto aparece palabra por palabra mientras LocalAI genera
- **Manejo de errores visual** — toast de sistema + burbuja de error en chat

*preparado para futuro

---

## 🎯 v1.0 — Uso diario real

Tempest funciona como cualquier IA básica para investigar y programar sin problemas.

- [x] Streaming de respuesta (texto aparece palabra por palabra)
- [x] Modal propio para renombrar — reemplazar el prompt() nativo por un modal visual
- [x] Mejorar prompt del generador de títulos — más rápido y preciso
- [x] Renombrar chat cuando el primer mensaje es solo archivo adjunto sin texto
- [x] Validación de nombres para caracteres inválidos
- [x] Manejo de errores visual — toast de sistema + burbuja de error en chat

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

- [ ] Reemplazar botón "Copiar" por ícono estilo ChatGPT/Claude
- [ ] Mostrar opciones de acción (copiar, compartir, etc.) al seleccionar texto manualmente con el cursor
- [ ] Activar edición de consultas del usuario
- [ ] Activar compartir respuestas
- [ ] Activar intentar nuevamente en respuestas de Tempest
- [ ] Mejorar diseño visual de acciones por mensaje

### 📎 Adjuntos — pendiente

- [ ] Implementar lectura de PPTX (extracción XML de ZIP)
- [ ] Implementar LibreOffice headless para mejor calidad de extracción de documentos
- [ ] Añadir soporte visual para archivos adjuntos en el historial del chat

### 🧠 Memoria

- [ ] Mejorar detección de datos importantes
- [ ] Evitar duplicados en perfil/memoria
- [ ] Añadir resumen automático por chat
- [ ] Añadir resumen automático por proyecto
- [ ] Separar memoria corta y larga de forma más estricta
- [ ] Limpiar historial viejo sin perder resumen

### 🧩 Proyectos y chats

- [ ] Evitar nombres duplicados de chats/proyectos
- [ ] Usar modelo más ligero para generación de títulos (evitar usar el modelo principal)
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
- [ ] Implementar router de modos: `coder` / `explain` / `general`
- [ ] Heurística sin IA para detección automática de modo:
  - palabras clave de implementación → modo coder
  - palabras clave de explicación → modo explain
  - archivos de código adjuntos → modo coder
- [ ] Cada modo carga su modelo y su prompt automáticamente sin que el usuario elija

### 🧱 Prioridad 2 — System prompt por capas por proyecto
- [ ] Capa 1: prompt base global (estilo, seguridad, formatos)
- [ ] Capa 2: prompt de proyecto (stack: Node/Express, React, Python, etc.) — configurable por proyecto
- [ ] Capa 3: prompt de tarea (coder/explain/general) — inyectado por el router
- [ ] UI para editar el prompt de proyecto desde la pantalla de configuración del proyecto

### 📸 Prioridad 3 — Context Snapshot del repo
- [ ] Generar `projectContext.json` por proyecto con extracto truncado de archivos relevantes
- [ ] Filtrar por extensión (js, ts, py, json, md, etc.) y archivos clave (README, package.json, routes, controllers, services)
- [ ] Usar hash/mtime para refrescar solo archivos que cambiaron
- [ ] Subir al contexto archivos mencionados explícitamente por el usuario
- [ ] Incluir top N archivos tocados recientemente

### 🩹 Prioridad 4 — Patch Mode para cambios de código
- [ ] Tempest responde cambios en formato diff/patch en lugar de bloques completos
- [ ] Formato: archivo + línea anterior + línea nueva
- [ ] Reducir errores al aplicar cambios en archivos grandes

### 🤖 Modelos recomendados para programación
- [ ] DeepSeek-Coder 6.7B — modelo default para código diario (rápido)
- [ ] Qwen2.5-Coder 14B — modo calidad/arquitectura
- [ ] CodeLlama 13B — backup/comparación
- [ ] Router elige modelo automáticamente según modo detectado

### 🔮 Para después
- Embeddings y búsqueda semántica del repo
- Decisiones técnicas generadas automáticamente por Tempest
- Visión real en imágenes de código/diagramas

---

## 📬 Integración de correo (Outlook)

- [ ] Registrar app en Azure Portal y configurar OAuth 2.0 con Microsoft Graph API
- [ ] Flujo de autenticación — abre navegador una vez, guarda token para sesiones futuras
- [ ] Leer correos no leídos desde el chat ("muéstrame los últimos 10 correos")
- [ ] Resumir correos con LocalAI
- [ ] Responder correos desde el chat
- [ ] Organizar correos — mover a carpetas desde el chat

---

## 📁 Context files por proyecto

- [ ] **Opción 1 — Subida manual desde la interfaz:** subir archivos `.md`, `.txt`, `.js`, etc. directamente desde Tempest, asociados a un proyecto, disponibles en todos sus chats sin adjuntarlos cada vez (similar a Project Knowledge de Claude/ChatGPT)
- [ ] **Opción 2 — Lectura de carpeta del disco:** configurar una ruta local por proyecto (ej. `F:\Mis proyectos\IA\Tempest-ai-assistant\`), Tempest lee automáticamente los archivos de esa carpeta — siempre actualizado sin reemplazar nada manualmente
- [ ] Pantalla de configuración inicial al crear proyecto — barra de mensaje + sección de context files + sección de ruta de carpeta (en lugar de ir directo al chat vacío)

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
- [ ] Probar adjuntos: PDF, DOCX, XLSX, TXT, código, imágenes

---
## 🎯 v2.0 — Tempest como asistente de programación real

- [ ] Router de modos: `coder` / `explain` / `general` con heurística automática
- [ ] System prompt por capas por proyecto (global + proyecto + tarea)
- [ ] Context Snapshot del repo — `projectContext.json` con archivos relevantes, hash/mtime
- [ ] Patch Mode — cambios en formato diff en lugar de bloques completos
- [ ] DeepSeek-Coder 6.7B como modelo default para código diario
- [ ] Qwen2.5-Coder 14B para modo calidad/arquitectura
- [ ] CodeLlama 13B como backup/comparación
- [ ] Router elige modelo automáticamente según modo detectado
- [ ] Context files por proyecto — subida manual + lectura de carpeta del disco
- [ ] Pantalla de configuración inicial al crear proyecto

---

## 🔮 vX.x

- [ ] Lectura de PPTX (extracción XML de ZIP)
- [ ] Añadir respaldo/exportación de memoria
- [ ] LibreOffice headless para extracción de documentos de alta fidelidad
- [ ] Función de voz al chat: hablar → texto → consulta
- [ ] Stream de audio en vivo con Faster-Whisper
- [ ] Migrar JSON a SQLite/PostgreSQL
- [ ] Añadir sistema de login
- [ ] Añadir múltiples usuarios reales
- [ ] Añadir búsqueda semántica con embeddings
- [ ] Añadir app desktop con Electron
- [ ] Añadir sincronización opcional
- [ ] Integración de correo Outlook (Microsoft Graph API + OAuth 2.0)