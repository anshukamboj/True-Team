import { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/public'

const FEATURES = [
  { title: 'Attendance Tracking', text: 'Daily check-ins, trends and heatmaps in one view.' },
  { title: 'Leave Management', text: 'Apply, approve and track leaves with a team calendar.' },
  { title: 'Payroll & Documents', text: 'Payslips, offer letters and ID proofs in one place.' },
  { title: 'Recruitment', text: 'Post jobs and move candidates from applied to hired.' },
]

function useFetch(path) {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch(`${API}/${path}`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => console.error(e))
  }, [path])
  return data
}

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="scroll-mt-20 bg-[#F8F1E6] px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-serif text-3xl font-bold text-[#4B101B]">{title}</h2>
        <p className="mt-2 text-[#321719]">{subtitle}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      </div>
    </section>
  )
}

function Card({ title, lines = [] }) {
  return (
    <div className="rounded-xl bg-[#511820] p-5 text-white">
      <h3 className="text-lg font-semibold">{title}</h3>
      {lines.map((l, i) => (
        <p key={i} className="mt-1 text-sm text-[#D9A1A0]">{l}</p>
      ))}
    </div>
  )
}

export default function LandingSections() {
  const jobs = useFetch('jobs')
  const employees = useFetch('employees')
  const hr = useFetch('hr')

  return (
    <>
      <Section id="features" title="Features" subtitle="Everything your HR team needs.">
        {FEATURES.map((f) => <Card key={f.title} title={f.title} lines={[f.text]} />)}
      </Section>

      <Section id="solutions" title="Open Positions" subtitle="Current openings in our company.">
        {jobs.map((j) => (
          <Card key={j._id} title={j.title} lines={[`${j.department} · ${j.location}`, j.employmentType]} />
        ))}
      </Section>

      <Section id="employees" title="Our Employees" subtitle="The people behind our company.">
        {employees.map((e) => (
          <Card key={e._id} title={e.name} lines={[e.designation, e.department, e.employeeCode]} />
        ))}
      </Section>

      <Section id="admin" title="HR & Admin" subtitle="The team that manages everything.">
        {hr.map((h) => (
          <Card key={h._id} title={h.name} lines={[h.designation, h.department]} />
        ))}
      </Section>

      <Section id="about" title="About Empower HR" subtitle="Simple HR software for growing teams.">
        <Card title="Our Mission" lines={['Make people management simple and transparent.']} />
        <Card title="Our Approach" lines={['Clean tools that save time for HR and employees.']} />
      </Section>
    </>
  )
}