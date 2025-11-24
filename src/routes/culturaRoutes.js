const express = require('express');
const router = express.Router();
const culturaController = require('../controllers/culturaController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', culturaController.create);
router.get('/propriedade/:propriedadeId', culturaController.listByPropriedade);
router.put('/:id', culturaController.update);
router.delete('/:id', culturaController.delete);

module.exports = router;