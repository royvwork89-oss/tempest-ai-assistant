const express = require('express');
const multer = require('multer');
const path = require('path');

const { transcribeAudio } = require('../controllers/transcription.controller');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/audio'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/transcribe', upload.single('audio'), transcribeAudio);

module.exports = router;