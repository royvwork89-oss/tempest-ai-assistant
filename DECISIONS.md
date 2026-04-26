# Decisiones de Diseño - Tempest

Este documento describe las decisiones técnicas clave tomadas durante el desarrollo del sistema.

---

## 🧠 Uso de LocalAI en lugar de APIs externas

### Decisión

Utilizar LocalAI como motor principal de inferencia.

### Razón

- independencia de servicios externos
- control total del entorno
- sin costos por uso
- privacidad de datos

### Impacto

- mayor control
- menor dependencia
- limitación en capacidad comparado con modelos comerciales

---

## ⚙️ Backend en Node.js + Express

### Decisión

Construir el backend con Node.js y Express.

### Razón

- simplicidad
- rapidez de desarrollo
- buena integración con frontend JS
- fácil modularización

### Impacto

- estructura clara y extensible
- aprendizaje alineado a desarrollo backend moderno

---

## 🧩 Arquitectura modular

### Decisión

Separar el backend en:

- routes
- controllers
- services
- utils

### Razón

- mejorar mantenibilidad
- reducir acoplamiento
- facilitar crecimiento

### Impacto

- código más limpio
- fácil de escalar

---

## 🧠 Memoria basada en JSON

### Decisión

Usar archivos JSON para persistencia inicial.

### Razón

- implementación rápida
- fácil depuración
- suficiente para MVP

### Impacto

- simplicidad inicial
- limitación para múltiples usuarios

---

## 🧾 Limpieza de respuestas del modelo

### Decisión

Procesar la salida del modelo antes de enviarla al frontend.

### Razón

- evitar respuestas vacías o mal formateadas
- mejorar consistencia

### Impacto

- mejor experiencia de usuario
- control sobre la salida

---

## ⚙️ Uso de prompt dinámico

### Decisión

Construir el prompt del sistema dinámicamente con memoria.

### Razón

- personalización
- mayor coherencia en respuestas
- integración de contexto

### Impacto

- respuestas más naturales
- mejor continuidad conversacional

---

## 📌 Estado actual

El sistema está diseñado como una base modular que permite evolución futura hacia:

- selección dinámica de modelos
- integración con servicios externos
- sistema híbrido de inferencia
- memoria avanzada

---

## 🎙️ Sistema de transcripción local

### Decisión

Implementar transcripción de audio utilizando ffmpeg + LocalAI (Whisper).

### Razón

- evitar costos de APIs externas
- mantener procesamiento completamente local
- integración directa con el sistema existente

### Impacto

- mayor control del flujo
- mayor complejidad técnica
- necesidad de manejo de errores en fragmentos de audio