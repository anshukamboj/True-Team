const router = require('express').Router();
const c = require('../controllers/employeeController');
const { protect, allowRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', allowRoles('hr'), c.list);
router.get('/me', c.me);              // /:id se pehle hi rakhna
router.post('/', allowRoles('hr'), c.create);
router.get('/:id', c.getOne);
router.patch('/:id', c.update);

module.exports = router;