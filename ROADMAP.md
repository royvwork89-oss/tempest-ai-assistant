# 🧩 Tempest - Roadmap

## 🚧 Estado actual

Versión actual: v0.3.5

Sistema funcional con:

- Chat local con IA
- LocalAI como motor principal
- Memoria por usuario/proyecto/chat
- Chats independientes
- Proyectos con múltiples chats
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
- Base visual preparada para archivos adjuntos
- Mejora de limpieza de títulos generados por IA
- Prevención básica de nombres duplicados en chats
- Modo selección para eliminar múltiples chats independientes
- Botones de acción por mensaje
- 6 modelos configurados: 3 para laptop (RTX 4050) y 3 para desktop (RTX 4070)
- Selección automática de modelo según tipo de consulta
- Perfiles de tokens por modelo y perfil de hardware
- Timeouts con AbortController en peticiones a LocalAI
- YAMLs con templates correctos para todos los modelos
- Docker-compose con soporte NVIDIA

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
- [ ] Añadir selección múltiple dentro de cada proyecto

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
- [ ] Mejorar diseño visual de acciones por mensaje
- [ ] Añadir soporte visual para archivos adjuntos

### 🧱 Código

- [ ] Separar archivos grandes en módulos más pequeños
- [ ] Separar lógica de memoria controlada en su propio archivo
- [ ] Separar lógica de tokens y perfiles de hardware en su propio archivo
- [ ] Separar lógica de detección de respuestas incompletas en su propio archivo

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

- [x] Implementar cambio real de modelo desde el menú de modelos
- [x] Implementar selección automática de modelo según la consulta del usuario
- [x] Mejorar la lógica para separación de múltiples archivos
- [x] Implementar detección de respuestas incompletas
- [x] Implementar regeneración de archivos cortados
- [x] Implementar unión limpia de respuestas múltiples
- [x] Configurar 6 modelos con YAMLs correctos (3 laptop + 3 desktop)
- [x] Implementar perfiles de tokens por modelo y hardware
- [x] Implementar timeouts con AbortController
- [ ] Forzar formato de salida cuando la IA genere varios archivos de código
- [ ] Mostrar en el chat cuándo inicia y cuándo termina una transcripción
- [ ] Mover automáticamente al primer lugar el chat con la consulta más reciente
- [ ] Validar número exacto de archivos generados
- [ ] Reintento automático por archivos faltantes
- [ ] Añadir modelos especializados opcionales (código, matemáticas)

---

## 🧪 Testing

- [ ] Probar `/chat`
- [ ] Probar `/chat/history`
- [ ] Probar `/chat/create`
- [ ] Probar `/chat/rename`
- [ ] Probar `/chat/delete`
- [ ] Probar `/project/create`
- [ ] Probar `/project/rename`
- [ ] Probar `/project/delete`
- [ ] Probar `/title/generate`
- [ ] Probar `/transcribe`

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
