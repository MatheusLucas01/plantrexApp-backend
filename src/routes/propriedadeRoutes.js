const express = require('express');
const router = express.Router();
const propriedadeController = require('../controllers/propriedadeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', propriedadeController.create);
router.get('/', propriedadeController.list);
router.get('/:id', propriedadeController.getById);
router.put('/:id', propriedadeController.update);
router.delete('/:id', propriedadeController.delete);

module.exports = router;