import React, { useState, useMemo, useEffect } from 'react'
import { Search, ChevronDown, SlidersHorizontal, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../services/api'

const statusMap = { present: 'Active', remote: 'Active', late: 'Late', absent: 'Absent' }

const fmtTime = (d) =>
    d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'

const fmtHours = (from, to) =>
    from && to ? ((new Date(to) - new Date(from)) / 36e5).toFixed(1) + ' hrs' : '--'

const shade = ['bg-[#F7EDDF]/10', 'bg-[#7d3a42]', 'bg-[#a8666b]', 'bg-[#D9A1A0]', 'bg-[#F7EDDF]']
const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const attended = (d) => d.present + d.late + d.remote

// line chart ka path, har din ki attendance se
function buildTrend(days) {
    if (days.length < 2) return ''
    const max = Math.max(...days.map(attended), 1)
    return days.map((d, i) => {
        const x = 10 + (i / (days.length - 1)) * 320
        const y = 165 - (attended(d) / max) * 150
        return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1)
    }).join(' ')
}

// mahine ka heatmap, Monday se shuru
function buildHeat(days, month) {
    const [y, m] = month.split('-').map(Number)
    const offset = (new Date(y, m - 1, 1).getDay() + 6) % 7
    const daysInMonth = new Date(y, m, 0).getDate()
    const byDate = {}
    days.forEach((d) => { byDate[d.date] = d })
    const max = Math.max(1, ...days.map(attended))

    const cells = Array(offset).fill(null)
    for (let day = 1; day <= daysInMonth; day++) {
        const rec = byDate[month + '-' + String(day).padStart(2, '0')]
        const count = rec ? attended(rec) : 0
        cells.push({ day, count, level: rec ? Math.max(1, Math.ceil((count / max) * 4)) : 0 })
    }
    return cells
}

const GRID = 'md:grid-cols-[2fr_1.3fr_1.1fr_1.1fr_1.2fr_1fr]'

const Card = ({ className = '', children }) => (
    <section className={`rounded-2xl bg-[#511820] p-5 text-[#F7EDDF] ${className}`}>{children}</section>
)

const Avatar = ({ name }) => (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D9A1A0] text-xs font-semibold text-[#511820]">
        {name.split(' ').map((n) => n[0]).join('')}
    </div>
)

const StatusBadge = ({ status }) => {
    if (status === 'Late')
        return <span className="inline-block rounded-full border border-[#F7EDDF] px-3 py-0.5 text-sm">Late</span>
    if (status === 'Absent')
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7EDDF]/15 px-3 py-0.5 text-sm text-[#F7EDDF]/80">
                Absent <span className="h-1.5 w-1.5 rounded-full bg-[#D9A1A0]" />
            </span>
        )
    return <span className="text-[#F7EDDF]/90">Active</span>
}

function Select({ label, value, onChange, options }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                className="h-10 w-full appearance-none rounded-lg border border-[#48151C]/20 bg-transparent pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9A1A0] sm:text-base"
            >
                <option value="">{label} [All]</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>
    )
}

function AttendanceManagement() {
    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState('')
    const [status, setStatus] = useState('')
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'))
const [days, setDays] = useState([])
    const [page, setPage] = useState(1)
    const [records, setRecords] = useState([])
    const [counts, setCounts] = useState({ present: 0, absent: 0, late: 0, remote: 0 })
    const [total, setTotal] = useState(0)
    const [error, setError] = useState('')

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get('/attendance?limit=100&date=' + date)
                setRecords(
                    res.data.map((r) => ({
                        id: r._id,
                        name: r.employee?.name || 'Unknown',
                        department: r.employee?.department || '-',
                        checkIn: fmtTime(r.clockIn),
                        checkOut: fmtTime(r.clockOut),
                        hours: fmtHours(r.clockIn, r.clockOut),
                        status: statusMap[r.status] || 'Active',
                    }))
                )
                setCounts(res.summary)
                setTotal(res.pagination.total)
                setError('')
            } catch (err) {
                setError(err.message)
            }
        }
        load()
    }, [date])
const month = date.slice(0, 7)

useEffect(() => {
    api.get('/attendance/stats?month=' + month)
        .then((res) => setDays(res.data))
        .catch((err) => setError(err.message))
}, [month])

const trend = buildTrend(days)
const heatCells = buildHeat(days, month)

    const stats = [
        { label: 'Present Today', value: String(counts.present + counts.late + counts.remote), sub: 'Checked in', dim: false },
        { label: 'Absent', value: String(counts.absent), sub: 'Not present', dim: true },
        { label: 'Late', value: String(counts.late), sub: 'Came late', dim: true },
        { label: 'Remote', value: String(counts.remote), sub: 'Working remotely', dim: false },
    ]
    const departments = [...new Set(records.map((r) => r.department))]

    const shown = useMemo(() => {
        const q = search.toLowerCase()
        return records.filter((r) =>
            r.name.toLowerCase().includes(q) &&
            (!department || r.department === department) &&
            (!status || r.status === status)
        )
    }, [records, search, department, status])

    const clearFilters = () => { setSearch(''); setDepartment(''); setStatus('') }

    const pageBtn = (n) => (
        <button
            key={n}
            onClick={() => setPage(n)}
            className={`h-8 w-8 rounded-md ${page === n ? 'bg-[#D9A1A0] text-[#511820]' : 'hover:bg-[#F7EDDF]/10'}`}
        >
            {n}
        </button>
    )

    return (
        <div className="px-4 pb-8 pt-6 sm:px-8 lg:px-10">

            {/* Breadcrumb */}
            <p className="text-base">
                <span className="text-[#48151C]/60">Employees /</span> Attendance Management
            </p>

            {/* Header */}
            <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold sm:text-[44px] sm:leading-tight">Attendance Management</h1>
                    <p className="text-base text-[#48151C]/80 sm:text-lg">Monitor workforce attendance and working hours.</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                    <button className="hidden h-10 rounded-lg border border-[#48151C]/30 px-5 text-base transition hover:bg-[#D9A1A0]/20 sm:block">
                        Export Report
                    </button>
                    <button aria-label="Notifications"><Bell className="h-6 w-6" /></button>
                </div>
            </div>
            <button className="mt-3 h-10 w-full rounded-lg border border-[#48151C]/30 px-5 text-base transition hover:bg-[#D9A1A0]/20 sm:hidden">
                Export Report
            </button>

            {/* Main grid */}
            <div className="mt-6 grid gap-4.5 xl:grid-cols-[minmax(0,1fr)_340px]">

                {/* Left: stats + filters + table */}
                <div className="min-w-0 space-y-4.5">

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 gap-4.5 lg:grid-cols-4">
                        {stats.map((s) => (
                            <Card key={s.label} className="py-4">
                                <p className="text-lg">{s.label}</p>
                                <p className={`text-4xl font-bold leading-tight ${s.dim ? 'text-[#D9A1A0]' : ''}`}>{s.value}</p>
                                <p className={`text-sm sm:text-base ${s.dim ? 'text-[#F7EDDF]/70' : ''}`}>{s.sub}</p>
                            </Card>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.4fr_1.2fr_1.3fr_1.2fr_auto]">
                        <div className="relative col-span-2 lg:col-span-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#48151C]/60" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search employee..."
                                aria-label="Search employee"
                                className="h-10 w-full rounded-lg border border-[#48151C]/20 bg-transparent pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9A1A0] sm:text-base"
                            />
                        </div>
                        <Select label="Department" value={department} onChange={setDepartment} options={departments} />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            aria-label="Date"
                            className="h-10 w-full rounded-lg border border-[#48151C]/20 bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9A1A0] sm:text-base"
                        />
                        <Select label="Status" value={status} onChange={setStatus} options={['Active', 'Late', 'Absent']} />
                        <button
                            onClick={clearFilters}
                            aria-label="Clear filters"
                            className="col-span-2 flex h-10 items-center justify-center rounded-lg border border-[#48151C]/20 px-3 hover:bg-[#D9A1A0]/15 lg:col-span-1 lg:border-0"
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Table */}
                    <Card>
                        <h2 className="text-2xl font-semibold">Attendance Table</h2>

                        {/* Header row (tablet and up) */}
                        <div className={`mt-3 hidden gap-x-4 border-b border-[#F7EDDF]/20 pb-2 text-[#F7EDDF]/80 md:grid ${GRID}`}>
                            <span>Employee</span><span>Department</span><span>Check In</span>
                            <span>Check Out</span><span>Working Hours</span><span>Status</span>
                        </div>

                        {shown.length === 0 && <p className="py-8 text-center text-[#D9A1A0]">No records found.</p>}

                        {shown.map((r) => (
                            <div key={r.id} className="border-b border-[#F7EDDF]/20 last:border-0">

                                {/* Desktop / tablet row */}
                                <div className={`hidden items-center gap-x-4 py-3 md:grid ${GRID} ${r.status === 'Late' ? 'rounded-xl border border-[#F7EDDF]/60 px-3' : ''}`}>
                                    <div className="flex min-w-0 items-center gap-3">
                                        <Avatar name={r.name} />
                                        <span className="truncate">{r.name}</span>
                                    </div>
                                    <span>{r.department}</span>
                                    <span>{r.checkIn}</span>
                                    <span>{r.checkOut}</span>
                                    <span>{r.hours}</span>
                                    <span><StatusBadge status={r.status} /></span>
                                </div>

                                {/* Mobile card */}
                                <div className="space-y-3 py-4 md:hidden">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <Avatar name={r.name} />
                                            <div className="min-w-0">
                                                <p className="truncate text-lg">{r.name}</p>
                                                <p className="text-sm text-[#F7EDDF]/70">{r.department}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div><p className="text-[#D9A1A0]">Check In</p><p>{r.checkIn}</p></div>
                                        <div><p className="text-[#D9A1A0]">Check Out</p><p>{r.checkOut}</p></div>
                                        <div><p className="text-[#D9A1A0]">Hours</p><p>{r.hours}</p></div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Footer */}
                        <div className="mt-4 flex flex-col gap-3 text-sm sm:text-base md:flex-row md:items-center md:justify-between">
                           <p className="text-[#F7EDDF]/80">Showing 1-{shown.length} of {total} employees</p>
                            <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="flex items-center px-2 text-[#F7EDDF]/60 hover:text-[#F7EDDF]"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>
                                {[1, 2, 3].map(pageBtn)}
                                <span className="px-1">...</span>
                                {pageBtn(25)}
                                <button
                                    onClick={() => setPage((p) => Math.min(25, p + 1))}
                                    className="flex items-center px-2 hover:text-[#D9A1A0]"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right: trend + heatmap */}
                <div className="grid gap-4.5 md:grid-cols-2 xl:grid-cols-1 xl:content-start">
                    <Card>
                        <h2 className="text-2xl font-semibold">Attendance Trend</h2>
                        <div className="mt-4 h-48 sm:h-56">
                            <svg viewBox="0 0 340 170" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Attendance trend chart">
                                <defs>
                                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#D9A1A0" stopOpacity="0.45" />
                                        <stop offset="100%" stopColor="#D9A1A0" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {[30, 70, 110, 150].map((y) => (
                                    <line key={y} x1="10" x2="335" y1={y} y2={y} stroke="#F7EDDF" strokeOpacity="0.15" vectorEffect="non-scaling-stroke" />
                                ))}
                                <line x1="10" x2="10" y1="5" y2="165" stroke="#F7EDDF" strokeOpacity="0.3" vectorEffect="non-scaling-stroke" />
                                {trend && <path d={`${trend} L330 165 L10 165 Z`} fill="url(#trendFill)" />}
{trend && <path d={trend} fill="none" stroke="#D9A1A0" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
                            </svg>
                            {!trend && <p className="text-center text-sm text-[#D9A1A0]">Not enough data yet.</p>}
                        </div>
                    </Card>

                    <Card className="relative">
                        <h2 className="text-2xl font-semibold">Attendance Heatmap</h2>
                       <div className="mt-3 grid grid-cols-7 gap-1.5">
    {weekLabels.map((c, i) => <span key={i} className="text-center text-sm">{c}</span>)}
    {heatCells.map((cell, i) =>
        cell === null ? (
            <span key={i} />
        ) : (
            <span
                key={i}
                title={`${cell.day}: ${cell.count} present`}
                className={`flex aspect-square items-center justify-center rounded-[5px] text-[10px] ${shade[cell.level]} ${cell.level === 4 ? 'text-[#511820]' : ''}`}
            >
                {cell.day}
            </span>
        )
    )}
</div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AttendanceManagement;