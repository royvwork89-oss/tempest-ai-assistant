# Decisiones de Diseño - Tempest

Este documento registra las decisiones técnicas principales tomadas durante el desarrollo.

---

## 🧠 Uso de LocalAI como motor principal

### Decisión

Usar LocalAI como motor principal de inferencia.

### Razón

- independencia de servicios externos
- privacidad
- ejecución local
- sin costo por token
- control sobre modelos GGUF

### Impacto

- más control
- mayor complejidad técnica
- menor potencia que modelos comerciales grandes

---

## ⚙️ Backend en Node.js + Express

### Decisión

Construir el backend con Node.js y Express.

### Razón

- simple de depurar
- alineado con JavaScript del frontend
- buena base para APIs REST
- modularización clara

### Impacto

- desarrollo rápido
- fácil expansión
- buen proyecto de portafolio backend

---

## 🧩 Arquitectura modular

### Decisión

Separar el backend en:

- routes
- controllers
- services
- utils
- config

### Razón

- mejorar orden
- evitar archivos gigantes
- facilitar mantenimiento

### Impacto

- código más profesional
- cambios localizados
- base preparada para crecer

---

## 🧠 Memoria jerárquica

### Decisión

Separar memoria en tres niveles:

```text
Usuario → Proyecto → Chat
```

### Razón

- evitar mezclar conversaciones
- permitir proyectos con múltiples chats
- mantener contexto global del usuario
- aislar historiales individuales

### Impacto

- mejor organización
- experiencia parecida a ChatGPT
- base para multiusuario real

---

## 📁 Uso de JSON para persistencia inicial

### Decisión

Guardar memoria, proyectos y chats en archivos JSON.

### Razón

- fácil de inspeccionar
- rápido de implementar
- ideal para MVP local
- no requiere base de datos todavía

### Impacto

- depuración sencilla
- estructura visible
- futura migración necesaria a DB si crece

---

## 💬 Chats independientes y chats por proyecto

### Decisión

Permitir dos tipos de conversación:

- chats sin proyecto en `general`
- chats ligados a proyectos

### Razón

- separar trabajo rápido de trabajo organizado
- replicar flujo moderno tipo workspace
- facilitar contexto por proyecto

### Impacto

- mejor UX
- mejor organización
- más lógica en frontend y memoria

---

## 🏷️ Renombrado automático con IA

### Decisión

Usar la primera consulta para generar título automático del chat.

### Razón

- evitar nombres genéricos tipo `chat-123`
- mejorar navegación
- experiencia más natural

### Impacto

- sidebar más útil
- requiere endpoint `/title/generate`
- depende de LocalAI

---

## ✏️ Renombrar y eliminar desde sidebar

### Decisión

Añadir menú de tres puntos en chats y proyectos.

### Razón

- dar control al usuario
- evitar borrar manualmente archivos
- acercar la UI a herramientas modernas

### Impacto

- UX más completa
- requiere endpoints de rename/delete
- necesita validación de nombres

---

## 🧾 Modal propio para confirmación

### Decisión

Usar un modal interno en lugar de `confirm()` del navegador.

### Razón

- mejor estética
- coherencia visual
- más control de UI

### Impacto

- interfaz más profesional
- más código frontend

---

## 🎙️ Transcripción local

### Decisión

Implementar transcripción con ffmpeg + LocalAI Whisper.

### Razón

- evitar APIs externas
- mantener procesamiento local
- reutilizar LocalAI

### Impacto

- mayor privacidad
- mayor carga técnica
- requiere limpieza de temporales

---

## 🤖 Selección dinámica de modelos

### Decisión

Permitir cambiar el modelo de IA desde el frontend y enviarlo dinámicamente al backend.

### Razón

- aprovechar múltiples modelos locales
- adaptar rendimiento según hardware (laptop vs desktop)
- mejorar flexibilidad del sistema
- preparar base para selección automática

### Impacto

- mayor control del usuario
- integración directa con LocalAI
- necesidad de validar modelos disponibles
- base para futuras estrategias inteligentes de selección

---

## 🤖 Control de respuestas incompletas

### Decisión

Implementar lógica backend para detectar y corregir respuestas incompletas de la IA.

### Razón

- Los modelos locales pueden cortar respuestas.
- Generación de múltiples archivos es inestable.
- No se puede confiar únicamente en el modelo.

### Implementación

- Detección de cortes (`looksLikeCutReply`)
- Eliminación de bloques incompletos (`removeIncompleteFileBlock`)
- Regeneración parcial en lugar de continuación directa

### Impacto

- Respuestas más completas
- Menos errores en código generado
- Mayor confiabilidad del sistema

---

## 🖥️ Perfiles de hardware con 3 modelos por equipo

### Decisión

Definir 3 modelos por perfil de hardware: rápido, equilibrado, inteligente.

### Razón

- cada equipo tiene capacidades diferentes
- evitar sobrecargar hardware con modelos demasiado grandes
- dar opciones sin abrumar al usuario

### Implementación

**Laptop (RTX 4050):**
- Rápido: `qwen2.5-3b-q4`
- Equilibrado: `qwen2.5-3b-q5`
- Inteligente: `llama-3.2-3b-q4`

**Desktop (RTX 4070):**
- Rápido: `hermes-q4`
- Equilibrado: `hermes-q5`
- Inteligente: `hermes-q6`

### Impacto

- experiencia adaptada a cada equipo
- mejor aprovechamiento del hardware
- cambio de perfil con una sola línea en el frontend

---

## ⏱️ Timeouts con AbortController

### Decisión

Agregar AbortController con timeout de 120 segundos a cada petición fetch hacia LocalAI.

### Razón

- LocalAI puede tardar en cargar modelos la primera vez (warmup)
- sin timeout Node.js queda colgado indefinidamente
- mejora la experiencia cuando el modelo está ocupado

### Impacto

- errores más claros cuando LocalAI no responde
- evita que el servidor quede bloqueado
- timeout independiente para petición principal y petición de continuación

---

## 📋 Perfiles de tokens por modelo y hardware

### Decisión

Implementar `HARDWARE_TOKEN_PROFILES` con límites de tokens diferentes según modelo, hardware y tipo de tarea.

### Razón

- modelos pequeños necesitan menos tokens para no generar ruido
- código necesita más tokens que conversación normal
- cada hardware tiene diferente capacidad de VRAM

### Impacto

- respuestas más eficientes
- menos cortes en generación de código
- base para ajuste fino por tarea

---

## 🔮 Decisiones futuras

- Migrar memoria JSON a base de datos.
- Añadir login real.
- Añadir resumen automático por chat/proyecto.
- Añadir embeddings para búsqueda semántica.
- Añadir renombrado automático de proyectos opcional.
- Separar módulos grandes en archivos más pequeños.
- Generar título de chat en background sin bloquear.
