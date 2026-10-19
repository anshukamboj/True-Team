const express = require('express');
const Employee = require('../models/Employee');
const Job = require('../models/Job');
const router = express.Router();

const getPeople = async () => {
  const list = await Employee.find({ status: 'Active' }).populate('userId', 'name role');
  return list
    .filter((e) => e.userId)
    .map((e) => ({
      _id: e._id,
      name: e.userId.name,
      role: e.userId.role,
      department: e.department,
      designation: e.designation,
      employeeCode: e.employeeCode,
    }));
};

router.get('/employees', async (req, res) => {
  const people = await getPeople();
  res.json(people.filter((p) => p.role !== 'hr'));
});

router.get('/hr', async (req, res) => {
  const people = await getPeople();
  res.json(people.filter((p) => p.role === 'hr'));
});

router.get('/jobs', async (req, res) => {
  res.json(await Job.find({ status: 'Open' }).sort({ createdAt: -1 }));
});

module.exports = router;