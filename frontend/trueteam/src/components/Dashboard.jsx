import React, { useState, useEffect } from 'react'
import { Search, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const summary = [
    { label: 'Attendance', value: '98.2%', pill: 'On Time' },
    { label: 'Leave Balance', value: '14 Days', pill: 'Available' },
    { label: 'Pending Tasks', value: '5 Active', pill: '5 Active' },
    { label: 'Monthly Salary', value: '$4,500', pill: 'Processed' },
]

const tasks = [
    { title: 'Complete Performance Self-Review', due: 'Today', status: 'Pending' },
    { title: 'Submit Q3 Report', due: 'Oct 12', status: 'In Progress' },
]

const upcoming = [
    { category: 'Holidays', event: 'Columbus Day (Oct 12)' },
    { category: 'Notifications', event: 'Task approved' },
]

const timeNow = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

const todayStr = () => new Date().toLocaleDateString('en-CA')

const timeOf = (d) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

const fmtDuration = (h) => {
    const mins = Math.round(h * 60)
    return Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm'
}

const Card = ({ className = '', children }) => (
    <section className={`rounded-xl bg-[#511820] p-5 text-[#F7F0E6] ${className}`}>{children}</section>
)

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
}

function Dashboard() {
    const { user } = useAuth()

    // FIX: signup saves "fullName", so don't assume user.name exists
    const displayName = user?.fullName || user?.name || 'there'
    const firstName = displayName.split(' ')[0]

    const [search, setSearch] = useState('')
    const [notifOpen, setNotifOpen] = useState(false)
    const [unread, setUnread] = useState(true)

    // today's attendance (database se)
    const [rec, setRec] = useState(null)
    const [now, setNow] = useState(Date.now())
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    async function loadToday() {
        try {
            const res = await api.get('/attendance?limit=100&month=' + todayStr().slice(0, 7))
            setRec(res.data.find((r) => r.date === todayStr()) || null)
        } catch (err) {
            setError(err.message)
        }
    }

    useEffect(() => { loadToday() }, [])

    // clock-in ke baad hours live badhte rahein
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 10000)
        return () => clearInterval(id)
    }, [])

    async function handleClock(kind) {
        setBusy(true)
        setError('')
        try {
            if (kind === 'in') await api.post('/attendance/clock-in')
            else await api.patch('/attendance/clock-out')
            await loadToday()
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    const clockedIn = !!rec?.clockIn && !rec?.clockOut
    const checkIn = rec?.clockIn ? timeOf(rec.clockIn) : '--:--'
    const checkOut = rec?.clockOut ? timeOf(rec.clockOut) : '--:--'
    const endTime = rec?.clockOut ? new Date(rec.clockOut).getTime() : now
    const hours = rec?.clockIn ? Math.max(0, (endTime - new Date(rec.clockIn).getTime()) / 3600000) : 0
    const statusText = !rec ? 'Not clocked in' : clockedIn ? 'Active' : 'Clocked out'

    const q = search.toLowerCase()
    const shownTasks = tasks.filter((t) => t.title.toLowerCase().includes(q))
    const shownUpcoming = upcoming.filter((u) => (u.category + u.event).toLowerCase().includes(q))

    return (
        <div className="px-4 pb-8 pt-4 sm:px-8 lg:px-10">

            {/* Top bar */}
            <div className="flex items-center justify-end gap-4">
                <div className="relative w-40 sm:w-60">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#48151C]/60" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                        aria-label="Search"
                        className="h-10 w-full rounded-lg border border-[#48151C]/20 bg-transparent pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-[#D9A1A0]"
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => { setNotifOpen(!notifOpen); setUnread(false) }}
                        aria-label="Notifications"
                        className="relative"
                    >
                        <Bell className="h-6 w-6" />
                        {unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#D9A1A0]" />}
                    </button>
                    {notifOpen && (
                        <div className="absolute right-0 top-9 z-20 w-56 rounded-lg bg-[#511820] p-3 text-sm text-[#F7F0E6] shadow-lg">
                            Your task "Submit Q3 Report" was approved.
                        </div>
                    )}
                </div>
            </div>

            {/* Greeting */}
            <h1 className="mt-4 text-3xl font-bold sm:text-[44px] sm:leading-tight">
                {getGreeting()}, {firstName}.
            </h1>
            <p className="text-base text-[#48151C]/80 sm:text-xl">Here's your work overview for today.</p>

            {/* Summary cards */}
            <div className="mt-6 grid grid-cols-2 gap-[18px] xl:grid-cols-4">
                {summary.map((s) => (
                    <Card key={s.label} className="py-4">
                        <p className="text-base sm:text-lg">{s.label}</p>
                        <p className="text-2xl font-bold sm:text-[38px] sm:leading-tight">{s.value}</p>
                        <span className="mt-1 inline-block rounded-full bg-[#D9A1A0] px-3 py-0.5 text-sm text-[#511820]">
                            {s.pill}
                        </span>
                    </Card>
                ))}
            </div>

            {/* Today */}
            <div className="mt-[18px] grid gap-[18px] lg:grid-cols-2">
                <Card>
                    <h2 className="text-2xl font-semibold">Today's Activity</h2>

                    {error && (
                        <div className="mt-3 rounded-lg border border-red-400 bg-red-100 p-2 text-sm text-red-800">{error}</div>
                    )}

                    <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-lg sm:grid-cols-2">
                        <p>Check-in: {checkIn}</p>
                        <p>Check-out: {checkOut}</p>
                        <p>Working Hours: {rec?.clockIn ? fmtDuration(hours) : '--'}</p>
                        <p>Status: {statusText}</p>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => handleClock('out')}
                            disabled={!clockedIn || busy}
                            className="h-11 rounded-lg bg-[#D9A1A0] text-lg font-medium text-[#511820] transition hover:bg-[#e3b4b3] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Clock Out
                        </button>
                        <button
                            onClick={() => handleClock('in')}
                            disabled={!!rec || busy}
                            className="h-11 rounded-lg bg-[#D9A1A0] text-lg font-medium text-[#511820] transition hover:bg-[#e3b4b3] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Clock In
                        </button>
                    </div>
                </Card>
            </div>

            {/* Tasks + Upcoming */}
            <div className="mt-[18px] grid gap-[18px] lg:grid-cols-2">
                <Card>
                    <h2 className="text-2xl font-semibold">Tasks</h2>
                    <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-[#F7F0E6]/20 pb-2 text-sm text-[#D9A1A0] sm:text-base">
                        <span>Heading</span>
                        <span className="w-16 sm:w-20">Due</span>
                        <span className="w-24 sm:w-28">Status</span>
                    </div>

                    {shownTasks.length === 0 && <p className="py-4 text-sm text-[#D9A1A0]">No tasks found.</p>}

                    {shownTasks.map((t) => (
                        <div
                            key={t.title}
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-[#F7F0E6]/20 py-2 text-sm last:border-0 sm:text-base"
                        >
                            <span>{t.title}</span>
                            <span className="w-16 sm:w-20">{t.due}</span>
                            <span className="w-24 sm:w-28">
                                <span
                                    className={`inline-block rounded-full px-3 py-0.5 text-sm text-[#511820] ${
                                        t.status === 'Pending' ? 'bg-[#D9A1A0]' : 'bg-[#F7F0E6]'
                                    }`}
                                >
                                    {t.status}
                                </span>
                            </span>
                        </div>
                    ))}
                </Card>

                <Card className="relative">
                    <h2 className="text-2xl font-semibold">Upcoming</h2>

                    {shownUpcoming.length === 0 && <p className="py-4 text-sm text-[#D9A1A0]">Nothing upcoming.</p>}

                    <div className="mt-3 space-y-3">
                        {shownUpcoming.map((u) => (
                            <div key={u.category} className="border-b border-[#F7F0E6]/20 pb-3 last:border-0">
                                <p className="flex items-center gap-2 text-[#D9A1A0]">
                                    <span className="h-3.5 w-3.5 rounded-sm bg-[#D9A1A0]" />
                                    {u.category}
                                </p>
                                <p className="pl-[22px] text-lg">{u.event}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard