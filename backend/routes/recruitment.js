const express = require('express');
const router = express.Router();

const { protect, allowRoles } = require('../middleware/auth');

router.use(protect);

// Temporary route to verify recruitment API
router.get('/', allowRoles('hr'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Recruitment API is working',
    data: []
  });
});

module.exports = router;