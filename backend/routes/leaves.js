const router = require('express').Router();
const c = require('../controllers/leaveController');
const { protect, allowRoles } = require('../middleware/auth');

router.use(protect);

router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getOne);
router.patch('/:id/review', allowRoles('hr'), c.review);

module.exports = router;