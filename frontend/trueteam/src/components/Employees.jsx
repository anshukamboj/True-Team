import React, { useState, useMemo, useEffect } from 'react'
import { Search, ChevronDown, SlidersHorizontal, Plus, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getEmployees } from '../services/employees'

const GRID = 'xl:grid-cols-[2.3fr_1fr_1.1fr_1.5fr_1.2fr_1fr_1fr]'
const PER_PAGE = 10

const dateText = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-'

// database ka user -> table ki row
const toRow = (u) => ({
    id: u._id || u.id,
    empId: u.employeeId || (u._id ? 'EMP-' + u._id.slice(-6).toUpperCase() : '-'),
    name: u.name || 'Unnamed',
    email: u.email || '-',
    department: u.department || '-',
    position: u.jobTitle || '-',
    joined: dateText(u.createdAt),
    status: String(u.status || '').toLowerCase() === 'active' ? 'Active' : 'Inactive',
})

const Avatar = ({ name }) => (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9A1A0] text-sm font-semibold text-[#511820]">
        {name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2)}
    </div>
)

const StatusPill = ({ status }) => (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-sm text-[#511820] ${status === 'Active' ? 'bg-[#F7EDDF]' : 'bg-[#D9A1A0]'}`}>
        {status}
    </span>
)

function Select({ label, value, onChange, options }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={label}
                className="h-11 w-full appearance-none rounded-lg border border-[#48151C]/20 bg-transparent pl-3 pr-9 focus:outline-none focus:ring-2 focus:ring-[#D9A1A0]"
            >
                <option value="">{label}</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>
    )
}

function ActionsMenu({ open, onToggle, onClose, onStatus, onDelete, id }) {
    return (
        <div className="relative">
            <button onClick={onToggle} className="flex items-center gap-1.5 text-[#F7EDDF]/90 hover:text-[#F7EDDF]" aria-label="Actions">
                <MoreHorizontal className="h-4 w-4" />
                <span>Actions</span>
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={onClose} />
                    <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-lg bg-[#F7EDDF] py-2 text-[#48151C] shadow-lg">
                        <Link
                            to={`/hr/employees/${id}`}
                            onClick={onClose}
                            className="block w-full px-4 py-1.5 text-left hover:bg-[#D9A1A0]/30"
                        >
                            View / Edit
                        </Link>
                        <button
                            onClick={() => { onStatus(); onClose() }}
                            className="block w-full px-4 py-1.5 text-left hover:bg-[#D9A1A0]/30"
                        >
                            Change Status
                        </button>
                        <button
                            onClick={() => { onDelete(); onClose() }}
                            className="block w-full px-4 py-1.5 text-left text-red-700 hover:bg-[#D9A1A0]/30"
                        >
                            Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

function Employees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState('')
    const [role, setRole] = useState('')
    const [status, setStatus] = useState('')
    const [openMenu, setOpenMenu] = useState(null)
    const [page, setPage] = useState(1)

    useEffect(() => {
        getEmployees()
            .then((list) => setEmployees(list.map(toRow)))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    // filter badalne par wapas pehle page pe
    useEffect(() => { setPage(1) }, [search, department, role, status])

    const departments = [...new Set(employees.map((e) => e.department))].filter((d) => d !== '-')
    const roles = [...new Set(employees.map((e) => e.position))].filter((r) => r !== '-')

    const shown = useMemo(() => {
        const q = search.toLowerCase()
        return employees.filter((e) =>
            (e.name + e.email + e.empId).toLowerCase().includes(q) &&
            (!department || e.department === department) &&
            (!role || e.position === role) &&
            (!status || e.status === status)
        )
    }, [employees, search, department, role, status])

    const totalPages = Math.max(1, Math.ceil(shown.length / PER_PAGE))
    const start = (page - 1) * PER_PAGE
    const pageRows = shown.slice(start, start + PER_PAGE)

    const toggleStatus = (id) =>
        setEmployees((list) => list.map((e) => (e.id === id ? { ...e, status: e.status === 'Active' ? 'Inactive' : 'Active' } : e)))

    const remove = (id) => {
        if (window.confirm('Delete this employee?')) {
            setEmployees((list) => list.filter((e) => e.id !== id))
        }
    }

    const clearFilters = () => { setSearch(''); setDepartment(''); setRole(''); setStatus('') }

    const menuFor = (e) => (
        <ActionsMenu
            id={e.id}
            open={openMenu === e.id}
            onToggle={() => setOpenMenu(openMenu === e.id ? null : e.id)}
            onClose={() => setOpenMenu(null)}
            onStatus={() => toggleStatus(e.id)}
            onDelete={() => remove(e.id)}
        />
    )

    return (
        <div className="px-4 pb-8 pt-6 sm:px-8 lg:px-10">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold sm:text-[44px] sm:leading-tight">Employees</h1>
                    <p className="text-base text-[#48151C]/80 sm:text-xl">Manage your organization's workforce.</p>
                </div>
                <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#D9A1A0] px-5 text-lg font-medium text-[#511820] transition hover:bg-[#e3b4b3] sm:mt-2">
                    <Plus className="h-5 w-5" /> Add Employee
                </button>
            </div>

            {/* Filters */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#48151C]/60" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search employees..."
                        aria-label="Search employees"
                        className="h-11 w-full rounded-lg border border-[#48151C]/20 bg-transparent pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-[#D9A1A0]"
                    />
                </div>
                <Select label="Department" value={department} onChange={setDepartment} options={departments} />
                <Select label="Role" value={role} onChange={setRole} options={roles} />
                <Select label="Status" value={status} onChange={setStatus} options={['Active', 'Inactive']} />
                <button
                    onClick={clearFilters}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#48151C]/20 px-5 hover:bg-[#D9A1A0]/15"
                >
                    <SlidersHorizontal className="h-4 w-4" /> Clear
                </button>
            </div>

            {/* Table card */}
            <section className="mt-6 rounded-xl bg-[#511820] p-4 text-[#F7EDDF] sm:p-6">

                {/* Desktop header row */}
                <div className={`hidden gap-x-4 border-b border-[#F7EDDF]/20 px-3 pb-4 text-lg font-semibold xl:grid ${GRID}`}>
                    <span>Employee</span>
                    <span>Employee ID</span>
                    <span>Department</span>
                    <span>Position</span>
                    <span>Joining Date</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {loading && <p className="py-8 text-center text-[#D9A1A0]">Loading employees...</p>}
                {!loading && error && <p className="py-8 text-center text-[#D9A1A0]">{error}</p>}
                {!loading && !error && shown.length === 0 && (
                    <p className="py-8 text-center text-[#D9A1A0]">No employees found.</p>
                )}

                {pageRows.map((e) => (
                    <div key={e.id} className="border-b border-[#F7EDDF]/20 last:border-0">

                        {/* Desktop row */}
                        <div className={`hidden items-center gap-x-4 px-3 py-3 transition hover:bg-[#F7EDDF]/5 xl:grid ${GRID}`}>
                            <div className="flex min-w-0 items-center gap-3">
                                <Avatar name={e.name} />
                                <div className="min-w-0">
                                    <Link to={`/hr/employees/${e.id}`} className="block truncate text-lg hover:underline">
                                        {e.name}
                                    </Link>
                                    <p className="truncate text-sm text-[#F7EDDF]/80">{e.email}</p>
                                </div>
                            </div>
                            <span>{e.empId}</span>
                            <span>{e.department}</span>
                            <span>{e.position}</span>
                            <span>{e.joined}</span>
                            <span><StatusPill status={e.status} /></span>
                            {menuFor(e)}
                        </div>

                        {/* Mobile / tablet card */}
                        <div className="space-y-3 py-4 xl:hidden">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <Avatar name={e.name} />
                                    <div className="min-w-0">
                                        <Link to={`/hr/employees/${e.id}`} className="block truncate text-lg hover:underline">
                                            {e.name}
                                        </Link>
                                        <p className="truncate text-sm text-[#F7EDDF]/80">{e.email}</p>
                                    </div>
                                </div>
                                <StatusPill status={e.status} />
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                                <div><p className="text-[#D9A1A0]">Employee ID</p><p>{e.empId}</p></div>
                                <div><p className="text-[#D9A1A0]">Department</p><p>{e.department}</p></div>
                                <div><p className="text-[#D9A1A0]">Position</p><p>{e.position}</p></div>
                                <div><p className="text-[#D9A1A0]">Joined</p><p>{e.joined}</p></div>
                            </div>
                            <div className="flex justify-end">{menuFor(e)}</div>
                        </div>
                    </div>
                ))}

                {/* Pagination */}
                <div className="mt-4 flex flex-col gap-4 px-1 sm:px-3 md:flex-row md:items-center md:justify-between">
                    <p>
                        Showing {shown.length === 0 ? 0 : start + 1}-{start + pageRows.length} of {shown.length} employees
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="px-2 text-[#F7EDDF]/80 hover:text-[#F7EDDF]"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                onClick={() => setPage(n)}
                                className={`h-9 w-9 rounded-md ${page === n ? 'bg-[#D9A1A0] text-[#511820]' : 'hover:bg-[#F7EDDF]/10'}`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="px-2 text-[#F7EDDF]/80 hover:text-[#F7EDDF]"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Employees