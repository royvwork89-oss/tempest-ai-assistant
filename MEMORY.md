# Sistema de Memoria - Tempest

## 🧩 Visión general

Tempest implementa una memoria persistente basada en JSON organizada por usuario, proyecto y chat.

La memoria no se maneja como un único archivo global. El sistema separa la información para evitar mezclar conversaciones y permitir que cada contexto tenga su propio historial.

---

## 🧠 Modelo de memoria

```text
Usuario
├── profile.json
└── projects/
    ├── general/
    │   ├── projectMemory.json
    │   └── chats/
    │       └── chat.json
    └── proyecto-x/
        ├── projectMemory.json
        └── chats/
            └── chat.json
```

---

## 📌 Niveles de memoria

### 1. Memoria global de usuario

Archivo:

```text
backend/data/users/local-user/profile.json
```

Guarda información general del usuario:

- nombre
- gustos
- metas
- preferencias
- proyecto actual
- datos persistentes útiles

Esta memoria puede ser usada por cualquier chat del usuario.

---

### 2. Memoria de proyecto

Archivo:

```text
backend/data/users/local-user/projects/{projectId}/projectMemory.json
```

Guarda información compartida por todos los chats de un proyecto.

Ejemplo:

- objetivo del proyecto
- decisiones técnicas
- contexto común
- resumen del proyecto

Cualquier chat dentro del mismo proyecto puede usar esta memoria.

---

### 3. Memoria de chat

Archivo:

```text
backend/data/users/local-user/projects/{projectId}/chats/{chatId}.json
```

Guarda información propia de una conversación específica:

```json
{
  "chatId": "chat-name",
  "title": "Nombre visible",
  "chatHistory": [],
  "workingMemory": []
}
```

Regla clave:

> Un chat solo puede leer su propio historial. No puede leer el historial de otros chats, aunque estén dentro del mismo proyecto.

---

## 🔒 Reglas de aislamiento

### Chat sin proyecto

Pertenece al proyecto especial:

```text
general
```

Puede acceder a:

- memoria global del usuario
- memoria de `general`
- su propia memoria de chat

No accede a chats de proyectos.

---

### Chat dentro de proyecto

Puede acceder a:

- memoria global del usuario
- memoria del proyecto
- su propia memoria de chat

No accede a:

- historial de otros chats
- memoria de otros proyectos

---

## 🔄 Flujo de memoria en conversación

1. Usuario envía mensaje.
2. Frontend manda `userId`, `projectId` y `chatId`.
3. Backend localiza los archivos JSON correctos.
4. El mensaje se guarda en `chatHistory`.
5. Se toma contexto relevante.
6. Se construye el prompt para LocalAI.
7. LocalAI responde.
8. La respuesta se limpia.
9. La respuesta se guarda en el mismo chat.
10. Frontend renderiza la conversación.

---

## 🧠 Memoria de trabajo

`workingMemory` representa contexto corto, útil para mantener continuidad reciente sin enviar conversaciones infinitas.

Objetivo:

- evitar crecimiento descontrolado
- conservar contexto inmediato
- reducir ruido para el modelo

---

## 🧾 Historial visual

`chatHistory` conserva la conversación para que, al refrescar o seleccionar un chat, el frontend pueda recargar mensajes anteriores.

Ejemplo:

```json
[
  { "role": "user", "content": "Hola" },
  { "role": "assistant", "content": "Hola, ¿en qué puedo ayudarte?" }
]
```

---

## 🏷️ Renombrado automático

Cuando se crea un chat nuevo desde la pantalla inicial, Tempest usa la primera consulta del usuario para generar un título corto.

Flujo:

1. Se crea chat temporal con ID tipo `chat-123`.
2. Se envía la primera consulta.
3. Backend llama a `/title/generate`.
4. LocalAI genera un título corto.
5. El archivo del chat se renombra.
6. El sidebar muestra el nuevo nombre.

---

## ⚠️ Consideraciones actuales

- JSON es suficiente para MVP y depuración.
- En producción conviene migrar a base de datos.
- Se debe mejorar validación de nombres para evitar caracteres inválidos.
- Se debe evitar sobrescribir chats/proyectos con nombres repetidos.
- Se puede añadir resumen automático por chat y por proyecto.

