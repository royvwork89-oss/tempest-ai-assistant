# Flujo del Sistema - Tempest

## Flujo actual

1. Usuario escribe mensaje
2. Frontend envía POST /chat
3. Backend recibe mensaje
4. Backend envía request a LocalAI
5. LocalAI procesa el mensaje
6. Backend recibe respuesta
7. Backend responde al frontend
8. Frontend renderiza el mensaje

## Manejo de errores

- Validación de mensaje vacío
- Respuesta HTTP con error

## Flujo futuro

1. Recuperar memoria del usuario
2. Construir contexto completo
3. Enviar a IA
4. Guardar nueva información

---

## 🎙️ Flujo de transcripción de audio

1. Usuario abre el menú de herramientas (+)
2. Selecciona “Transcripción”
3. Selecciona archivo de audio
4. Elige:
   - Tipo: texto corrido o con timestamps
   - Formato: TXT, PDF o DOCX
5. Frontend envía POST `/transcribe`
6. Backend recibe el audio
7. Se divide el audio en fragmentos (ffmpeg)
8. Cada fragmento se envía a LocalAI (Whisper)
9. Se unen las transcripciones
10. Se generan archivos:
    - TXT
    - PDF
    - DOCX
11. Backend devuelve URLs públicas
12. Frontend muestra link descargable