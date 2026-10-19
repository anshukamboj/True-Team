const router = require('express').Router();
const c = require('../controllers/documentController');
const { protect, allowRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/', allowRoles('hr'), c.create);
router.patch('/:id', allowRoles('hr'), c.update);
router.delete('/:id', allowRoles('hr'), c.remove);

module.exports = router;