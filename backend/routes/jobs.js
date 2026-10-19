const express = require('express')
const Job = require('../models/Job')
const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await Job.find().sort({ createdAt: -1 }))
})

module.exports = router