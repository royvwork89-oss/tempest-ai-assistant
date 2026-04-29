const express = require('express');
const router = express.Router();

const {
  chat,
  getChatHistory,
  listChats,
  createChat,
  deleteChat,
  listProjects,
  createProject,
  deleteProject,
  renameChat,
  renameProject,
  generateTitle
} = require('../controllers/chat.controller');

router.post('/chat', chat);
router.get('/chat/history', getChatHistory);

router.get('/chats', listChats);
router.post('/chat/create', createChat);
router.post('/chat/delete', deleteChat);

router.get('/projects', listProjects);
router.post('/project/create', createProject);
router.post('/project/delete', deleteProject);
router.post('/chat/rename', renameChat);
router.post('/project/rename', renameProject);
router.post('/title/generate', generateTitle);

module.exports = router;