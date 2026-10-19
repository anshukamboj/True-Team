import { useEffect, useState } from 'react'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/jobs')
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-6 text-[#48151C]">Loading jobs...</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-[#48151C] mb-4">Jobs</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <div key={job._id} className="rounded-xl bg-[#511820] p-4 text-white">
            <h2 className="text-lg font-semibold">{job.title}</h2>
            <p className="text-sm text-[#D9A1A0]">{job.department} · {job.location}</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="rounded-full bg-[#D9A1A0] px-3 py-1 text-[#48151C]">{job.employmentType}</span>
              <span className="rounded-full border border-[#D9A1A0] px-3 py-1">{job.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}