import React, { useState, useMemo } from 'react'
import { Search, ChevronDown, ArrowRight } from 'lucide-react'

const stats = [
    { label: 'Open Positions', value: '14', unit: 'Active', pill: true },
    { label: 'Applicants', value: '184', unit: 'New', tag: '+24 this week' },
    { label: 'Interviews', value: '38', unit: 'Scheduled', tag: '+5 today' },
    { label: 'Hired', value: '9', unit: 'This Month' },
]

const pipeline = [
    { stage: 'Applied', count: 124 },
    { stage: 'Screening', count: 32 },
    { stage: 'Interview', count: 18 },
    { stage: 'Selected', count: 6 },
    { stage: 'Hired', count: 4 },
]

const candidates = [
    { name: 'Jamie Vance', sub: 'jamie@empowerhr.com', position: 'UI/UX Designer', exp: '4 Yrs Exp', date: 'Oct 04, 2026', stage: 'Interview' },
    { name: 'Alex Carter', sub: 'alex.c@empowerhr.com', position: 'Software Engineer', exp: '6 Yrs Exp', date: 'Oct 03, 2026', stage: 'Screening' },
    { name: 'Chloe Brooks', sub: 'chloe.b@empowerhr.com', position: 'Product Manager', exp: '5 Yrs Exp', date: 'Oct 01, 2026', stage: 'Applied' },
    { name: 'Taylor Martinez', sub: 'taylor.m@empowerhr.com', position: 'HR Specialist', exp: '3 Yrs Exp', date: 'Sep 29, 2026', stage: 'Selected' },
]

const openings = [
    { position: 'Lead Software Engineer', department: 'Engineering', applicants: 42, posted: 'Oct 01, 2026', status: 'Active' },
    { position: 'Senior UI/UX Designer', department: 'Product', applicants: 28, posted: 'Sep 28, 2026', status: 'Active' },
    { position: 'Technical Recruiter', department: 'HR', applicants: 15, posted: 'Sep 25, 2026', status: 'Draft' },
    { position: 'Product Analyst', department: 'Operations', applicants: 34, posted: 'Sep 24, 2026', status: 'Active' },
]

const CAND_GRID = 'sm:grid-cols-[1.7fr_1.4fr_0.9fr_1.3fr_1fr]'
const JOB_GRID = 'sm:grid-cols-[1.6fr_1.1fr_1fr_1.1fr_0.7fr]'

const Card = ({ className = '', children }) => (
    <section className={`rounded-2xl bg-[#511820] p-5 text-[#F7EDDF] ${className}`}>{children}</section>
)

const Avatar = ({ name }) => (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9A1A0] text-xs font-semibold text-[#511820]">
        {name.split(' ').map((n) => n[0]).join('')}
    </div>
)

const StagePill = ({ stage }) => {
    const highlighted = stage === 'Interview' || stage === 'Selected'
    return highlighted
        ? <span className="inline-block rounded-full bg-[#D9A1A0] px-3 py-0.5 text-sm text-[#511820]">{stage}</span>
        : <span className="text-[#F7EDDF]/90">{stage}</span>
}

function Select({ label, value, onChange, options }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                className="h-10 w-full appearance-none rounded-lg bg-[#511820] pl-3 pr-8 text-[#F7EDDF] focus:outline-none focus:ring-2 focus:ring-[#D9A1A0]"
            >
                <option value="">{label}</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F7EDDF]" />
        </div>
    )
}

function Recruitment() {
    const [search, setSearch] = useState('')
    const [position, setPosition] = useState('')
    const [stage, setStage] = useState('')
    const [sort, setSort] = useState('') // '' | 'newest' | 'oldest'
    const [activeStage, setActiveStage] = useState('Hired')

    const positions = [...new Set(candidates.map((c) => c.position))]
    const stages = pipeline.map((p) => p.stage)

    const shown = useMemo(() => {
        const q = search.toLowerCase()
        const list = candidates.filter((c) =>
            (c.name + c.position + c.sub).toLowerCase().includes(q) &&
            (!position || c.position === position) &&
            (!stage || c.stage === stage)
        )
        if (sort === 'newest') return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
        if (sort === 'oldest') return [...list].sort((a, b) => new Date(a.date) - new Date(b.date))
        return list
    }, [search, position, stage, sort])

    const clearFilters = () => { setSearch(''); setPosition(''); setStage(''); setSort('') }

    return (
        <div className="px-4 pb-8 pt-6 sm:px-8 lg:px-10">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold sm:text-[44px] sm:leading-tight">Recruitment</h1>
                    <p className="text-base text-[#48151C]/80 sm:text-lg">Manage open positions and candidates.</p>
                </div>
                <button
                    onClick={() => alert('Create job opening')}
                    className="h-11 rounded-lg bg-[#D9A1A0] px-5 text-lg font-medium text-[#511820] transition hover:bg-[#e3b4b3]"
                >
                    Create Job Opening
                </button>
            </div>

            {/* Stat cards */}
            <div className="mt-6 grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                    <Card key={s.label} className="py-4">
                        <p className="text-xl font-medium">{s.label}</p>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-3xl">
                                <span className="font-bold">{s.value}</span>{' '}
                                {s.pill
                                    ? <span className="ml-1 inline-block rounded-full bg-[#D9A1A0] px-3 py-0.5 align-middle text-base text-[#511820]">{s.unit}</span>
                                    : <span className="text-2xl text-[#F7EDDF]/90">{s.unit}</span>}
                            </p>
                            {s.tag && (
                                <span className="rounded-full bg-[#F7EDDF]/15 px-3 py-0.5 text-xs text-[#F7EDDF]/80 sm:text-sm">{s.tag}</span>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Hiring pipeline */}
            <Card className="mt-[18px]">
                <h2 className="text-2xl font-semibold">Hiring Pipeline</h2>
                <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-0">
                    {pipeline.map((p, i) => (
                        <React.Fragment key={p.stage}>
                            <button
                                onClick={() => setActiveStage(p.stage)}
                                className={`flex-1 rounded-xl border px-4 py-3 text-left transition ${
                                    activeStage === p.stage
                                        ? 'border-[#F7EDDF] bg-[#F7EDDF]/10'
                                        : 'border-[#F7EDDF]/25 bg-[#F7EDDF]/5 hover:bg-[#F7EDDF]/10'
                                }`}
                            >
                                <p className="text-lg font-semibold">{p.stage}</p>
                                <p className="text-[#F7EDDF]/80">{p.count} candidates</p>
                            </button>

                            {i < pipeline.length - 1 && (
                                <>
                                    <div className="hidden items-center px-2 text-[#D9A1A0] lg:flex" aria-hidden="true">
                                        <span className="h-2 w-2 rounded-full bg-[#D9A1A0]" />
                                        <span className="h-px w-8 bg-[#D9A1A0]/60 xl:w-14" />
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                    <div className="flex justify-center text-[#D9A1A0] lg:hidden" aria-hidden="true">
                                        <ArrowRight className="h-4 w-4 rotate-90" />
                                    </div>
                                </>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </Card>

            {/* Filters */}
            <div className="mt-[18px] rounded-xl border border-[#48151C]/15 p-2">
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-center">
                    <div className="relative col-span-2 lg:col-span-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#48151C]/60" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search candidates..."
                            aria-label="Search candidates"
                            className="h-10 w-full rounded-lg bg-transparent pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-[#D9A1A0]"
                        />
                    </div>
                    <div className="lg:w-44"><Select label="Position" value={position} onChange={setPosition} options={positions} /></div>
                    <div className="lg:w-40"><Select label="Stage" value={stage} onChange={setStage} options={stages} /></div>
                    <div className="lg:w-40"><Select label="Date" value={sort} onChange={setSort} options={['newest', 'oldest']} /></div>
                    <button
                        onClick={clearFilters}
                        className="h-10 rounded-lg border border-[#48151C]/20 px-4 transition hover:bg-[#D9A1A0]/15"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Candidates + Job openings */}
            <div className="mt-[18px] grid gap-[18px] xl:grid-cols-2">

                {/* Candidates */}
                <Card>
                    <h2 className="text-2xl font-semibold">Candidates</h2>

                    <div className={`mt-3 hidden gap-x-3 border-b border-[#F7EDDF]/20 pb-2 text-sm text-[#F7EDDF]/70 sm:grid ${CAND_GRID}`}>
                        <span>Candidate</span><span>Position</span><span>Experience</span><span>Application Date</span><span>Stage</span>
                    </div>

                    {shown.length === 0 && <p className="py-8 text-center text-[#D9A1A0]">No candidates found.</p>}

                    {shown.map((c) => (
                        <div key={c.name} className="border-b border-[#F7EDDF]/20 last:border-0">

                            {/* Desktop / tablet row */}
                            <div className={`hidden items-center gap-x-3 py-2.5 text-sm sm:grid ${CAND_GRID}`}>
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <Avatar name={c.name} />
                                    <div className="min-w-0">
                                        <p className="truncate text-base">{c.name}</p>
                                        <p className="truncate text-xs text-[#F7EDDF]/70">{c.sub}</p>
                                    </div>
                                </div>
                                <span className="text-base">{c.position}</span>
                                <span>{c.exp}</span>
                                <span>{c.date}</span>
                                <span><StagePill stage={c.stage} /></span>
                            </div>

                            {/* Mobile card */}
                            <div className="space-y-2 py-3 sm:hidden">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <Avatar name={c.name} />
                                        <div className="min-w-0">
                                            <p className="truncate text-base">{c.name}</p>
                                            <p className="truncate text-xs text-[#F7EDDF]/70">{c.sub}</p>
                                        </div>
                                    </div>
                                    <StagePill stage={c.stage} />
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div><p className="text-[#D9A1A0]">Position</p><p>{c.position}</p></div>
                                    <div><p className="text-[#D9A1A0]">Experience</p><p>{c.exp}</p></div>
                                    <div><p className="text-[#D9A1A0]">Applied</p><p>{c.date}</p></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Card>

                {/* Job openings */}
                <Card className="relative">
                    <h2 className="text-2xl font-semibold">Job Openings</h2>

                    <div className={`mt-3 hidden gap-x-3 border-b border-[#F7EDDF]/20 pb-2 text-sm text-[#F7EDDF]/70 sm:grid ${JOB_GRID}`}>
                        <span>Position</span><span>Department</span><span>Applicants</span><span>Posted</span><span>Status</span>
                    </div>

                    {openings.map((j) => (
                        <div key={j.position} className="border-b border-[#F7EDDF]/20 last:border-0">

                            {/* Desktop / tablet row */}
                            <div className={`hidden items-center gap-x-3 py-3 text-sm sm:grid ${JOB_GRID}`}>
                                <span className="text-base">{j.position}</span>
                                <span className="text-base">{j.department}</span>
                                <span>{j.applicants} applicants</span>
                                <span>{j.posted}</span>
                                <span className={j.status === 'Draft' ? 'text-[#F7EDDF]' : 'text-[#F7EDDF]/80'}>{j.status}</span>
                            </div>

                            {/* Mobile card */}
                            <div className="space-y-2 py-3 sm:hidden">
                                <div className="flex items-start justify-between gap-3">
                                    <p className="text-base">{j.position}</p>
                                    <span className="text-sm text-[#F7EDDF]/80">{j.status}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div><p className="text-[#D9A1A0]">Department</p><p>{j.department}</p></div>
                                    <div><p className="text-[#D9A1A0]">Applicants</p><p>{j.applicants}</p></div>
                                    <div><p className="text-[#D9A1A0]">Posted</p><p>{j.posted}</p></div>
                                </div>
                            </div>
                        </div>
                    ))}

                </Card>
            </div>
        </div>
    )
}

export default Recruitment