const router = require('express').Router();
const c = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', c.summary);
router.get('/attendance', c.attendance);
router.get('/tasks', c.tasks);

module.exports = router;