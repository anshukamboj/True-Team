import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Pencil, ArrowLeftRight, UserCog, CircleDot, FileText } from 'lucide-react'

const employees = {
    'EMP-2401': {
        name: 'Sarah Jenkins',
        title: 'Senior Software Engineer',
        id: 'EMP-2401',
        department: 'Engineering',
        manager: 'Sarah Connor',
        joined: 'Oct 12, 2021',
        status: 'Active',
        attendance: { rate: '98.2%', avgHours: '8.2h', late: 2 },
        leave: { used: 12, remaining: 14, pending: 1 },
        performance: { rating: '4.8 / 5', goals: '8 / 10', lastReview: 'Oct 2026' },
        timeline: [
            { text: 'Promoted to Senior Engineer', date: 'Jan 2024' },
            { text: 'Completed Q3 Performance Review', date: 'Oct 2025' },
            { text: 'Joined Engineering Team', date: 'Oct 2021' },
        ],
    },
}

const tabs = ['Overview', 'Personal Details', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Documents', 'Activity']

const adminActions = [
    { label: 'Edit', icon: Pencil },
    { label: 'Change Department', icon: ArrowLeftRight },
    { label: 'Change Role', icon: UserCog },
    { label: 'Update Status', icon: CircleDot },
    { label: 'View Documents', icon: FileText },
]

const Card = ({ className = '', children }) => (
    <section className={`rounded-xl bg-[#511820] p-5 text-[#F7EDDF] sm:p-6 ${className}`}>{children}</section>
)

const Stat = ({ value, label }) => (
    <div>
        <p className="text-3xl font-medium leading-tight sm:text-[40px]">{value}</p>
        <p className="text-sm text-[#F7EDDF]/80 sm:text-base">{label}</p>
    </div>
)

const Avatar = ({ name }) => (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-[#F7EDDF] bg-[#D9A1A0] text-3xl font-semibold text-[#511820] sm:h-36 sm:w-36 sm:text-5xl">
        {name.split(' ').map((n) => n[0]).join('')}
    </div>
)

function EmployeeDetail() {
    const { id } = useParams()
    // only one demo employee exists, so unknown ids show him too
    const emp = employees[id] ?? employees['EMP-2401']

    const [activeTab, setActiveTab] = useState('Overview')
    const [status, setStatus] = useState(emp.status)

    const toggleStatus = () => setStatus((s) => (s === 'Active' ? 'On Leave' : 'Active'))

    const handleAction = (label) => {
        if (label === 'Update Status') toggleStatus()
        else alert(`${label} - ${emp.name}`)
    }

    const info = [
        { label: 'Department', value: emp.department },
        { label: 'Manager', value: emp.manager },
        { label: 'Joining Date', value: emp.joined },
    ]

    return (
        <div className="px-4 pb-8 pt-6 sm:px-8 lg:px-10">

            {/* Breadcrumb */}
            <p className="text-base">
                <Link to="/hr/employees" className="text-[#48151C]/60 hover:underline">Employees</Link>
                <span className="text-[#48151C]/60"> / </span>
                {emp.name}
            </p>

            {/* Profile header */}
            <Card className="mt-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
                    <Avatar name={emp.name} />

                    <div className="min-w-0 flex-1">
                        <h1 className="font-serif text-3xl sm:text-5xl">{emp.name}</h1>
                        <p className="mt-1 text-base text-[#F7EDDF]/80 sm:text-xl">
                            {emp.title} <span className="mx-1">•</span> ID: {emp.id}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-y-4 sm:flex sm:flex-wrap sm:gap-y-3">
                            {info.map((i) => (
                                <div key={i.label} className="border-l border-[#F7EDDF]/30 pl-4 sm:mr-6">
                                    <p className="text-sm text-[#F7EDDF]/80">{i.label}</p>
                                    <p className="text-lg sm:text-xl">{i.value}</p>
                                </div>
                            ))}
                            <div className="border-l border-[#F7EDDF]/30 pl-4">
                                <p className="text-sm text-[#F7EDDF]/80">Status</p>
                                <span className="mt-1 inline-block rounded-full bg-[#D9A1A0] px-3 py-0.5 text-sm text-[#511820]">{status}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleAction('Edit Employee')}
                        className="h-11 self-start rounded-lg bg-[#D9A1A0] px-5 text-lg font-medium text-[#511820] transition hover:bg-[#e3b4b3]"
                    >
                        Edit Employee
                    </button>
                </div>
            </Card>

            {/* Tabs */}
            <div className="mt-5 overflow-x-auto border-b border-[#48151C]/20">
                <div className="flex min-w-max gap-6 sm:gap-8" role="tablist">
                    {tabs.map((t) => (
                        <button
                            key={t}
                            role="tab"
                            aria-selected={activeTab === t}
                            onClick={() => setActiveTab(t)}
                            className={`-mb-px border-b-2 px-1 pb-2 text-base sm:text-lg ${
                                activeTab === t ? 'border-[#D9A1A0] font-medium' : 'border-transparent text-[#48151C]/80 hover:text-[#48151C]'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            {activeTab === 'Overview' ? (
                <div className="mt-5 grid gap-[18px] lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">

                    <div className="grid gap-[18px]">
                        <Card>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h2 className="text-2xl">Attendance</h2>
                                    <div className="mt-3 grid grid-cols-3 gap-3">
                                        <Stat value={emp.attendance.rate} label="Attendance" />
                                        <Stat value={emp.attendance.avgHours} label="Avg Hours" />
                                        <Stat value={emp.attendance.late} label="Late Arrivals" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl">Leave</h2>
                                    <div className="mt-3 grid grid-cols-3 gap-3">
                                        <Stat value={`${emp.leave.used} Days`} label="Used" />
                                        <Stat value={emp.leave.remaining} label="Days Remaining" />
                                        <Stat value={emp.leave.pending} label="Pending" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="grid gap-[18px] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                            <Card>
                                <h2 className="text-2xl">Performance</h2>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <Stat value={emp.performance.rating} label="Rating" />
                                    <Stat value={emp.performance.goals} label="Goals Achieved" />
                                </div>
                                <p className="mt-4 text-sm text-[#F7EDDF]/80 sm:text-base">Last Review: {emp.performance.lastReview}</p>
                            </Card>

                            <Card>
                                <h2 className="text-2xl">Activity Timeline</h2>
                                <ul className="mt-4 space-y-4 border-l border-[#D9A1A0]/50 pl-5">
                                    {emp.timeline.map((t) => (
                                        <li key={t.text} className="relative text-base sm:text-lg">
                                            <span className="absolute -left-[26px] top-2 h-2.5 w-2.5 rounded-full bg-[#D9A1A0]" />
                                            {t.text} <span className="text-[#F7EDDF]/70">• {t.date}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    </div>

                    {/* Admin actions */}
                    <Card className="relative h-fit">
                        <h2 className="text-2xl">Admin Actions</h2>
                        <div className="mt-4 space-y-3">
                            {adminActions.map(({ label, icon: Icon }) => (
                                <button
                                    key={label}
                                    onClick={() => handleAction(label)}
                                    className="flex h-11 w-full items-center gap-3 rounded-lg border border-[#F7EDDF]/30 px-4 text-left text-lg transition hover:bg-[#F7EDDF]/10"
                                >
                                    <Icon className="h-5 w-5 shrink-0" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
            ) : (
                <Card className="mt-5">
                    <h2 className="text-2xl">{activeTab}</h2>
                    <p className="mt-2 text-[#D9A1A0]">This section is coming soon.</p>
                </Card>
            )}
        </div>
    )
}

export default EmployeeDetail