require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/User');
const Organization = require('../models/Organization');
const Employee = require('../models/Employee');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Document = require('../models/Document');
const Payroll = require('../models/Payroll');

let bcrypt;
try { bcrypt = require('bcryptjs'); } catch { bcrypt = require('bcrypt'); }

const DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'];
const DESIGNATIONS = ['Software Engineer', 'HR Executive', 'Accountant', 'Marketing Executive', 'Operations Lead', 'Sales Executive'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const JOB_TITLES = {
  Engineering: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'QA Engineer', 'ML Engineer'],
  HR: ['HR Intern', 'HR Executive', 'Talent Acquisition Specialist', 'Payroll Executive'],
  Finance: ['Accountant', 'Financial Analyst', 'Auditor'],
  Marketing: ['Digital Marketing Executive', 'Content Writer', 'SEO Specialist', 'Graphic Designer'],
  Operations: ['Operations Lead', 'Logistics Coordinator', 'Office Administrator'],
  Sales: ['Sales Executive', 'Business Development Associate', 'Account Manager'],
};
const LOCATIONS = ['Remote', 'Hisar', 'Delhi', 'Gurugram', 'Chandigarh', 'Noida', 'Hybrid'];
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

function randomJobs(count) {
  const jobs = [];
  const used = new Set(); // same title+location repeat na ho
  let tries = 0;
  while (jobs.length < count && tries < count * 10) {
    tries++;
    const department = pick(DEPARTMENTS);
    const title = pick(JOB_TITLES[department]);
    const location = pick(LOCATIONS);
    const key = `${title}|${location}`;
    if (used.has(key)) continue;
    used.add(key);

    const employmentType = title.includes('Intern') ? 'Internship' : pick(TYPES);
    const status = Math.random() < 0.75 ? 'Open' : 'Closed'; // 75% open
    jobs.push({ title, department, location, employmentType, status });
  }
  return jobs;
}

const isHr = (u) => String(u.role || '').toLowerCase() === 'hr';

// optional: node <seed file> "Naam" email password hr|employee
const [argName, argEmail, argPassword, argRole = 'employee'] = process.argv.slice(2);

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // 0. Agar arguments diye hain to ek user bana/update kar do
  if (argName && argEmail && argPassword) {
    let org = await Organization.findOne();
    if (!org) {
      org = await Organization.create({
        name: 'My Company Pvt Ltd',
        departments: DEPARTMENTS,
        contact: { email: 'hr@mycompany.com', phone: '9999999999', address: 'Hisar, Haryana' },
      });
    }

    const pwField = User.schema.path('passwordHash') ? 'passwordHash' : 'password';
    const hash = await bcrypt.hash(argPassword, 10);
    const now = new Date();

    await User.collection.updateOne(
      { email: argEmail.trim().toLowerCase() },
      {
        $set: { name: argName, role: argRole, status: 'active', [pwField]: hash, organizationId: org._id, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    console.log(`${argRole} ready: ${argName} (${argEmail.trim().toLowerCase()})`);
  }

  // users database se hi aate hain
  const users = await User.find();
  if (users.length === 0) {
    console.log('Database me koi user nahi hai. User banane ke liye: node <seed file> "Naam" email password hr');
    process.exit(0);
  }
  const people = users.filter((u) => !isHr(u));
  console.log(`${users.length} users mile (${people.length} employees)`);

  // 1. Delete ho chuke users ka bacha hua data hata do
  const liveIds = users.map((u) => u._id);
  await Employee.deleteMany({ userId: { $nin: liveIds } });
  await Document.deleteMany({ employee: { $nin: liveIds } });
  await Payroll.deleteMany({ employee: { $nin: liveIds } });

  // 2. HR ka employee record nahi hona chahiye
  await Employee.deleteMany({ userId: { $in: users.filter(isHr).map((u) => u._id) } });

  // 3. Employees (jis employee ka record nahi hai, uska banao)
  const haveEmp = new Set((await Employee.find().select('userId')).map((e) => String(e.userId)));
  const missing = people.filter((u) => !haveEmp.has(String(u._id)));
  if (missing.length) {
    const start = await Employee.countDocuments();
    await Employee.insertMany(
      missing.map((u, i) => ({
        employeeCode: `EMP-${2401 + start + i}`,
        userId: u._id,
        department: DEPARTMENTS[(start + i) % DEPARTMENTS.length],
        designation: DESIGNATIONS[(start + i) % DESIGNATIONS.length],
        joiningDate: new Date(2024, (start + i) % 12, 10),
        status: 'Active',
      }))
    );
    console.log(`${missing.length} employees created`);
  }

  // 4. Jobs (har baar fresh random)
  await Job.deleteMany({});
  await Candidate.deleteMany({});
  const count = 6 + Math.floor(Math.random() * 5);
  const jobs = await Job.insertMany(randomJobs(count));
  console.log(`${jobs.length} random jobs created`);

  // 5. Candidates
  const day = 24 * 60 * 60 * 1000;
  await Candidate.insertMany([
    { jobId: jobs[0]._id, name: 'Riya Sharma', email: 'riya@example.com', stage: 'Interview', interviewDate: new Date(Date.now() + 3 * day) },
    { jobId: jobs[0]._id, name: 'Aman Verma', email: 'aman@example.com', stage: 'Screening' },
    { jobId: jobs[1]._id, name: 'Neha Gupta', email: 'neha@example.com', stage: 'Applied' },
    { jobId: jobs[1]._id, name: 'Karan Singh', email: 'karan@example.com', stage: 'Offer' },
    { jobId: jobs[2]._id, name: 'Pooja Yadav', email: 'pooja@example.com', stage: 'Hired' },
  ]);
  console.log('5 candidates created');

  // 6. Documents (jis user ke documents nahi hain, uske 2 banao)
  const hrUser = users.find(isHr) || users[0];
  const haveDocs = new Set((await Document.distinct('employee')).map(String));
  const docs = users
    .filter((u) => !haveDocs.has(String(u._id)))
    .flatMap((u) => [
      { employee: u._id, uploadedBy: hrUser._id, title: `Offer Letter - ${u.name}`, fileUrl: `/uploads/offer-${u._id}.pdf` },
      { employee: u._id, uploadedBy: hrUser._id, title: `ID Proof - ${u.name}`, fileUrl: `/uploads/id-${u._id}.pdf` },
    ]);
  if (docs.length) {
    await Document.insertMany(docs);
    console.log(`${docs.length} documents created`);
  }

  // 7. Payroll (jis user ke records nahi hain, uske 3 mahine + 1 pending)
  const havePay = new Set((await Payroll.distinct('employee')).map(String));
  const pay = [];
  users.filter((u) => !havePay.has(String(u._id))).forEach((u) => {
    const gross = 4000 + Math.floor(Math.random() * 3000);
    const ded = Math.round(gross * 0.1);
    [['2026-07', '2026-07-31'], ['2026-08', '2026-08-31'], ['2026-09', '2026-09-30']].forEach(([period, payday]) => {
      pay.push({ employee: u._id, payPeriod: period, grossPay: gross, deductions: ded, netPay: gross - ded, status: 'paid', payday: new Date(payday) });
    });
    pay.push({ employee: u._id, payPeriod: '2026-10', grossPay: gross, deductions: ded, netPay: gross - ded, status: 'pending', payday: new Date('2026-10-31') });
  });
  if (pay.length) {
    await Payroll.insertMany(pay);
    console.log(`${pay.length} payroll records created`);
  }

  // jo employees abhi database me hain, unki list
  console.log('\nEmployees in database:');
  people.forEach((u) => console.log(` - ${u.name} | ${u.email}`));

  console.log('Done');
  process.exit(0);
})().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});