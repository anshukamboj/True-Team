const router = require('express').Router();
const c = require('../controllers/taskController');
const { protect, allowRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', c.list);
router.post('/', allowRoles('hr'), c.create);
router.get('/:id', c.getOne);
router.patch('/:id', c.update);
router.delete('/:id', allowRoles('hr'), c.remove);

module.exports = router;