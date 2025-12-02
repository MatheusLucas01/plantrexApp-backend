const express = require('express');
const router = express.Router();
const pragaController = require('../controllers/pragaController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas
router.get('/', pragaController.getAll);
router.get('/cultura/:cultura', pragaController.getByCultura);
router.get('/categoria/:categoria', pragaController.getByCategoria);
router.get('/:id', pragaController.getById);

module.exports = router;