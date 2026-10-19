const router = require('express').Router();
const c = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', c.get);
router.patch('/profile', c.updateProfile);
router.patch('/password', c.changePassword);

module.exports = router;