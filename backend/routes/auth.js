const router = require('express').Router();
const { login, me, createUser, updateMe } = require('../controllers/authController');
const { protect, allowRoles } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, me);
router.patch('/me', protect, updateMe);
router.post('/users', protect, allowRoles('hr'), createUser);

module.exports = router;