# 🧩 Tempest - Roadmap

## 🚧 Estado actual

Versión actual: v0.3.9

Sistema funcional con:

- Chat local con IA.
- LocalAI como motor principal.
- Memoria por usuario/proyecto/chat.
- Chats independientes y por proyecto.
- Sidebar tipo workspace.
- Renombrar y eliminar chats/proyectos.
- Modal de confirmación para eliminar.
- Creación de proyectos con nombre manual.
- Renombrado automático de chats con IA.
- Renombrado automático de chats después de transcripción.
- Transcripción de audio con Whisper vía LocalAI.
- Exportación de transcripciones a TXT, PDF y DOCX.
- Selección de modo de transcripción:
  - texto corrido
  - con divisiones de tiempo
- Mensajes visuales durante transcripción:
  - inicio de transcripción
  - finalización
- Tarjeta descargable para documentos/transcripciones.
- Adjuntos en chat.
- Drag & drop de archivos.
- Lectura de archivos de texto/código como contexto.
- Generación de documentos TXT, PDF y DOCX desde una instrucción.
- Limpieza automática de documentos temporales antiguos.
- Limpieza automática de audio original y chunks temporales.
- Menú de herramientas (+).
- Renderizado de bloques de código estilo terminal.
- Botón para copiar código generado.
- Input multilínea con Shift + Enter.
- Textarea autoexpandible.
- Botones de acción por mensaje.
- 6 modelos configurados: 3 laptop y 3 desktop.
- Selección automática de modelo según consulta.
- Perfiles de tokens por modelo y hardware.
- Timeouts con AbortController.
- Docker-compose con soporte NVIDIA.
- Módulos backend separados.
- Módulos frontend separados.

## 🔥 Prioridad alta

### 🧠 Memoria

- [ ] Mejorar detección de datos importantes
- [ ] Evitar duplicados en perfil/memoria
- [ ] Añadir resumen automático por chat
- [ ] Añadir resumen automático por proyecto
- [ ] Separar memoria corta y larga de forma más estricta
- [ ] Limpiar historial viejo sin perder resumen

### 🧩 Proyectos y chats

- [ ] Validar nombres para evitar caracteres inválidos
- [ ] Evitar nombres duplicados de chats/proyectos
- [ ] Generar título de chat en background sin bloquear la conversación
- [ ] Permitir renombrado automático opcional de proyectos
- [ ] Añadir opción de cancelar creación de chat pendiente
- [ ] Mejorar visual de proyecto activo/chat activo
- [ ] Guardar estado de proyecto colapsado/expandido en localStorage
- [ ] Extender eliminación múltiple a chats dentro de proyectos

### 🧾 UI/UX

- [x] Añadir soporte visual para archivos adjuntos.
- [x] Añadir chips de archivos adjuntos.
- [x] Añadir drag & drop.
- [x] Añadir tarjeta visual para documentos generados.
- [x] Añadir botón Ver documento.
- [x] Añadir botón Descargar.
- [x] Mostrar mensaje de inicio al transcribir.
- [x] Mostrar mensaje de finalización al transcribir.
- [ ] Reemplazar `prompt()` de renombrar por modal propio.
- [ ] Añadir modal de error visual.
- [ ] Añadir loader animado de respuesta.
- [ ] Añadir confirmación visual al renombrar.
- [ ] Mejorar diseño de menú de tres puntos.
- [ ] Mejorar diseño móvil.
- [ ] Activar edición de consultas del usuario.
- [ ] Activar compartir respuestas.
- [ ] Activar intentar nuevamente en respuestas de Tempest.

## ⚙️ Transcripción de audio

- [x] Transcripción con Whisper vía LocalAI.
- [x] División automática en chunks.
- [x] Exportación a TXT.
- [x] Exportación a PDF.
- [x] Exportación a DOCX.
- [x] Modo texto corrido.
- [x] Modo con timestamps.
- [x] Mensaje visual al iniciar transcripción.
- [x] Mensaje visual al terminar transcripción.
- [x] Tarjeta descargable al finalizar.
- [x] Limpieza automática de audio original.
- [x] Limpieza automática de chunks temporales.
- [x] Renombrado automático del chat tras transcripción.
- [ ] Corte por silencio real, VAD.
- [ ] Mejorar manejo de errores por fragmento.
- [ ] Optimizar tiempo de procesamiento.
- [ ] Permitir elegir idioma del audio.
- [ ] Enviar transcripción al chat como contexto opcional.

## 📄 Documentos y exportación

- [x] Generar documentos TXT.
- [x] Generar documentos PDF.
- [x] Generar documentos DOCX.
- [x] Generar transcripciones como TXT.
- [x] Generar transcripciones como PDF.
- [x] Generar transcripciones como DOCX.
- [x] Añadir descarga directa desde frontend.
- [x] Mostrar tarjeta descargable.
- [x] Usar modelo seleccionado para generar documentos.
- [x] Usar Whisper fijo para transcripción.
- [ ] Mejorar formato visual de PDF.
- [ ] Mejorar formato visual de DOCX.
- [ ] Permitir crear documentos desde una respuesta previa.
- [ ] Detectar instrucciones como “2 páginas”, “con portada”, “formato profesional”.
- [ ] Añadir nombres de archivo más descriptivos.

## 🤖 Integración IA

- [x] Implementar cambio real de modelo desde el menú de modelos
- [x] Implementar selección automática de modelo según la consulta
- [x] Mejorar la lógica para separación de múltiples archivos
- [x] Implementar detección de respuestas incompletas
- [x] Implementar regeneración de archivos cortados
- [x] Implementar unión limpia de respuestas múltiples
- [x] Configurar 6 modelos con YAMLs correctos (3 laptop + 3 desktop)
- [x] Implementar perfiles de tokens por modelo y hardware
- [x] Implementar timeouts con AbortController
- [x] Separar módulos de localai.service.js en carpeta localai/
- [ ] Forzar formato de salida cuando la IA genere varios archivos
- [ ] Mostrar en el chat cuándo inicia y termina una transcripción
- [ ] Mover automáticamente el chat más reciente al primer lugar
- [ ] Validar número exacto de archivos generados
- [ ] Reintento automático por archivos faltantes
- [ ] Añadir modelos especializados opcionales (código, matemáticas)

---

## 🧪 Testing

- [ ] Probar todos los endpoints principales
- [ ] Probar selección automática de modelo
- [ ] Probar generación de múltiples archivos
- [ ] Probar transcripción completa

---

## 🚀 Futuro

- [ ] Migrar JSON a SQLite/PostgreSQL
- [ ] Añadir sistema de login
- [ ] Añadir múltiples usuarios reales
- [ ] Añadir búsqueda semántica con embeddings
- [ ] Añadir app desktop con Electron
- [ ] Añadir sincronización opcional
- [ ] Añadir respaldo/exportación de memoria
- [ ] Añadir soporte de visión con modelo multimodal
- [ ] Añadir texto a voz con Piper