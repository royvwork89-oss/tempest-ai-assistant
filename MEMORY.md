# Sistema de Memoria - Tempest

## 🧩 Visión general

Tempest implementa un sistema de memoria conversacional persistente basado en archivos JSON.

Este sistema permite:

- mantener contexto entre mensajes
- recordar información básica del usuario
- enriquecer las respuestas del modelo
- conservar historial entre ejecuciones

---

## ⚙️ Funcionamiento general

El flujo de memoria es el siguiente:

1. El usuario envía un mensaje
2. El sistema analiza el mensaje
3. Se detecta información relevante (ej. nombre)
4. El mensaje se guarda en memoria
5. Se construye el historial conversacional
6. El historial se envía al modelo
7. La respuesta se genera
8. La respuesta también se guarda

---

## 📦 Tipo de memoria implementada

### 1. Historial conversacional

Se guarda una lista de mensajes en formato:

```json
[
  { "role": "user", "content": "Hola" },
  { "role": "assistant", "content": "Hola, ¿en qué puedo ayudarte?" }
]