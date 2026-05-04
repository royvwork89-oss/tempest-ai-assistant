const express = require('express');
const cors = require('cors');
const path = require('path');

const chatRoutes = require('./routes/chat.routes');
const transcriptionRoutes = require('./routes/transcription.routes');
const documentRoutes = require('./routes/document.routes');

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// Servir frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Rutas del backend
app.use('/', chatRoutes);
app.use('/', transcriptionRoutes);
app.use('/', documentRoutes);

app.listen(PORT, () => {
  console.log(`Tempest activo en http://localhost:${PORT}`);
});