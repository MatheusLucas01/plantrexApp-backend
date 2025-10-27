const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Rotas públicas (sem autenticação)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rotas protegidas (com autenticação)
router.get('/me', authMiddleware, authController.me);

module.exports = router;