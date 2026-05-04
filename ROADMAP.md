# 🧩 Tempest - Roadmap

## 🚧 Estado actual

Versión actual: v0.3.6

Sistema funcional con:

- Chat local con IA
- LocalAI como motor principal
- Memoria por usuario/proyecto/chat
- Chats independientes y por proyecto
- Sidebar tipo workspace
- Renombrar y eliminar chats/proyectos
- Modal de confirmación para eliminar
- Creación de proyectos con nombre manual
- Renombrado automático de chats con IA
- Transcripción de audio
- Exportación TXT, PDF y DOCX
- Menú de herramientas (+)
- Renderizado de bloques de código estilo terminal
- Botón para copiar código generado dentro de bloques
- Input multilínea con `Shift + Enter`
- Textarea autoexpandible con límite de altura
- Modo selección para eliminar múltiples chats independientes
- Botones de acción por mensaje
- 6 modelos configurados: 3 laptop (RTX 4050) y 3 desktop (RTX 4070)
- Selección automática de modelo según tipo de consulta
- Perfiles de tokens por modelo y perfil de hardware
- Timeouts con AbortController en peticiones a LocalAI
- YAMLs con templates correctos para todos los modelos
- Docker-compose con soporte NVIDIA
- Módulos backend separados en `services/localai/`
- Módulos frontend separados en `frontend/modules/`
- styles.css limpio sin reglas duplicadas

---

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

- [ ] Reemplazar `prompt()` de renombrar por modal propio
- [ ] Añadir modal de error visual
- [ ] Añadir loader animado de respuesta
- [ ] Añadir confirmación visual al renombrar
- [ ] Mejorar diseño de menú de tres puntos
- [ ] Mejorar diseño móvil
- [ ] Activar edición de consultas del usuario
- [ ] Activar compartir respuestas
- [ ] Activar intentar nuevamente en respuestas de Tempest
- [ ] Añadir soporte visual para archivos adjuntos

---

## ⚙️ Transcripción de audio

- [ ] Implementar corte por silencio real (VAD)
- [ ] Mejorar manejo de errores por fragmento
- [ ] Optimizar tiempo de procesamiento
- [ ] Permitir elegir idioma del audio
- [ ] Limpiar automáticamente uploads/audio y uploads/chunks
- [ ] Añadir análisis automático de transcripción
- [ ] Enviar transcripción al chat como contexto opcional

---

## 📄 Exportación

- [ ] Mejorar formato de PDF y DOCX
- [ ] Añadir descarga directa desde frontend
- [ ] Permitir elegir solo un formato de salida
- [ ] Añadir nombres de archivo más descriptivos

---

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