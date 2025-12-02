const express = require('express');
const router = express.Router();
const pragaRespostaController = require('../controllers/pragaRespostaController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas
router.post('/', pragaRespostaController.createOrUpdate);
router.get('/', pragaRespostaController.getAll);
router.get('/stats', pragaRespostaController.getStats);
router.get('/:pragaIdExterno', pragaRespostaController.getByPragaId);
router.delete('/:id', pragaRespostaController.delete);

module.exports = router;