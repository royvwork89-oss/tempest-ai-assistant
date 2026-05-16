const express = require('express');
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controllers/context.controller');

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../uploads/context-tmp/'),
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
});

router.get( '/:projectId/context/items',          ctrl.listItems);
router.post('/:projectId/context/upload', upload.array('files', 20), ctrl.uploadFiles);
router.patch('/:projectId/context/item/:id',      ctrl.updateItem);
router.delete('/:projectId/context/item/:id',     ctrl.deleteItem);
router.get( '/:projectId/settings',               ctrl.getSettings);
router.patch('/:projectId/settings',              ctrl.updateSettings);

module.exports = router;