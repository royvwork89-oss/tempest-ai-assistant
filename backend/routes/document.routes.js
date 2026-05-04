const express = require('express');
const router = express.Router();

const {
  generateDocument,
  viewDocument,
  downloadDocument
} = require('../controllers/document.controller');

const {
  cleanupOldDocuments
} = require('../services/document.service');

cleanupOldDocuments();

setInterval(() => {
  try {
    cleanupOldDocuments();
  } catch (error) {
    console.error('Error limpiando documentos temporales:', error);
  }
}, 60 * 60 * 1000); // cada hora

router.post('/document/generate', generateDocument);
router.get('/documents/:filename', viewDocument);
router.get('/documents/download/:filename', downloadDocument);

module.exports = router;