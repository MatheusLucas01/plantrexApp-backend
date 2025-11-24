const express = require('express');
const router = express.Router();
const bioinsumoController = require('../controllers/bioinsumoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', bioinsumoController.create);
router.get('/', bioinsumoController.list);
router.get('/:id', bioinsumoController.getById);
router.put('/:id', bioinsumoController.update);
router.delete('/:id', bioinsumoController.delete);

module.exports = router;