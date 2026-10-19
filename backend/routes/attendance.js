const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth'); // apne project ka path/naam rakho

router.get('/stats', protect, ctrl.getStats);   // /:id se pehle hi rehna chahiye

router.get('/', protect, ctrl.list);
router.post('/clock-in', protect, ctrl.clockIn);
router.patch('/clock-out', protect, ctrl.clockOut);

router.post('/', protect, ctrl.create);         
router.patch('/:id', protect, ctrl.update);     

module.exports = router;