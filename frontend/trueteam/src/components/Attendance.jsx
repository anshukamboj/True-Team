import { useState, useEffect, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import { api } from '../services/api'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// dropdown choices: January 2025 to December 2026
const monthOptions = []
for (let year = 2025; year <= 2026; year++) {
  for (let month = 0; month < 12; month++) {
    monthOptions.push({ value: year + '-' + month, label: monthNames[month] + ' ' + year })
  }
}

// ---------------- helpers ----------------
const statusLabels = { present: 'On Time', late: 'Late', absent: 'Absent', remote: 'Remote' }

const todayStr = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
const monthParam = (y, m) => y + '-' + String(m + 1).padStart(2, '0')

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'

const fmtDate = (str) =>
  new Date(str + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })

const fmtHours = (from, to) =>
  from && to ? ((new Date(to) - new Date(from)) / 36e5).toFixed(1) + ' hrs' : '--'

// API record -> row jo screen pe dikhta hai
function toRow(r) {
  const isToday = r.date === todayStr()
  const active = !!r.clockIn && !r.clockOut && isToday

  let status = statusLabels[r.status] || r.status
  if (active) status = 'Active'
  else if (isToday && r.clockOut) status = 'Clocked out'

  return {
    id: r._id,
    date: fmtDate(r.date),
    day: Number(r.date.slice(8)),
    checkIn: fmtTime(r.clockIn),
    checkOut: fmtTime(r.clockOut),
    hours: fmtHours(r.clockIn, r.clockOut || (active ? new Date() : null)),
    status,
  }
}

// ---------------- Today's activity card ----------------
function TodayCard({ today, busy, onClockIn, onClockOut }) {
  const notStarted = !today
  const isActive = today?.status === 'Active'

  return (
    <div className="rounded-xl bg-[#541D25] p-5 text-[#F7F0E6]">
      <h3 className="text-xl font-semibold">Today's Activity</h3>

      <div className="mt-2 grid grid-cols-[150px_1fr] gap-y-1 text-[17px]">
        <span>Current Status:</span>
        <span>
          <span
            className={
              'rounded px-2 py-0.5 ' +
              (isActive ? 'bg-[#DDEFC8] text-[#2F5D1E]' : 'bg-[#E9B8BA] text-[#541D25]')
            }
          >
            {notStarted ? 'Not clocked in' : today.status}
          </span>
        </span>

        <span>Check-in:</span>
        <span>{notStarted ? '--:--' : today.checkIn}</span>

        <span>Check-out:</span>
        <span>{notStarted ? '--:--' : today.checkOut}</span>

        <span>Working hours:</span>
        <span>{notStarted ? '--' : today.hours}</span>
      </div>

      {notStarted ? (
        <button
          onClick={onClockIn}
          disabled={busy}
          className="mt-4 h-10 w-full rounded-lg bg-[#D9A0A4] text-lg text-[#541D25] transition hover:bg-[#E9B8BA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Please wait...' : 'Clock In'}
        </button>
      ) : (
        <button
          onClick={onClockOut}
          disabled={!isActive || busy}
          className="mt-4 h-10 w-full rounded-lg bg-[#D9A0A4] text-lg text-[#541D25] transition hover:bg-[#E9B8BA] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? 'Please wait...' : 'Clock Out'}
        </button>
      )}
    </div>
  )
}

// ---------------- Calendar ----------------
function MonthCalendar({ year, month, dotDays, todayDay }) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  return (
    <div className="mt-5 rounded-xl border border-[#541D25] bg-[#F7F0E6] p-5 text-[#4A1820]">
      <h3 className="text-xl font-semibold">{monthNames[month] + ' ' + year}</h3>

      <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
        {weekDays.map((name) => (
          <span key={name} className="text-[15px]">{name}</span>
        ))}

        {cells.map((day, index) => {
          if (day === null) return <span key={'empty' + index}></span>

          const isToday = day === todayDay
          const hasDot = dotDays.includes(day)

          return (
            <div key={day} className="flex flex-col items-center">
              <span
                className={
                  'flex h-9 w-9 items-center justify-center rounded-lg text-[17px] ' +
                  (isToday ? 'bg-[#D9A0A4]' : '')
                }
              >
                {day}
              </span>
              <span className={'mt-0.5 h-1.5 w-1.5 rounded-full ' + (hasDot ? 'bg-[#D9A0A4]' : '')}></span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------- History table ----------------
function HistoryTable({ records }) {
  return (
    <div className="relative overflow-x-auto rounded-xl bg-[#541D25] p-4 text-[#F7F0E6]">
      <table className="w-full min-w-[460px] text-left text-sm">
        <thead>
          <tr>
            <th className="pb-3 pr-2 font-semibold">Date</th>
            <th className="pb-3 pr-2 font-semibold">Check In</th>
            <th className="pb-3 pr-2 font-semibold">Check Out</th>
            <th className="pb-3 pr-2 font-semibold">Working Hours</th>
            <th className="pb-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-[#E9B8BA]">No records for this month.</td>
            </tr>
          )}
          {records.map((row) => (
            <tr key={row.id} className="border-t border-[#F7F0E6]/20">
              <td className="py-2.5 pr-2">{row.date}</td>
              <td className="py-2.5 pr-2">{row.checkIn}</td>
              <td className="py-2.5 pr-2">{row.checkOut}</td>
              <td className="py-2.5 pr-2">{row.hours}</td>
              <td className="py-2.5">
                {row.status === 'Active' && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-white"></span>}
                {row.status === 'Late' && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#D9A0A4]"></span>}
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------- The page ----------------
function Attendance() {
const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getFullYear() + '-' + now.getMonth())
  const [records, setRecords] = useState([])
  const [counts, setCounts] = useState({ present: 0, absent: 0, late: 0, remote: 0 })
  const [todayRec, setTodayRec] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // "2026-9" -> year 2026, month 9
  const year = Number(selectedMonth.split('-')[0])
  const month = Number(selectedMonth.split('-')[1])

  const loadMonth = useCallback(async () => {
    try {
      const res = await api.get('/attendance?limit=100&month=' + monthParam(year, month))
      setRecords(res.data.map(toRow))
      setCounts(res.summary)
    } catch (err) {
      setError(err.message)
    }
  }, [year, month])

  const loadToday = useCallback(async () => {
    const d = new Date()
    try {
      const res = await api.get('/attendance?limit=100&month=' + monthParam(d.getFullYear(), d.getMonth()))
      const found = res.data.find((r) => r.date === todayStr())
      setTodayRec(found ? toRow(found) : null)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => { loadMonth() }, [loadMonth])
  useEffect(() => { loadToday() }, [loadToday])

  async function handleClock(kind) {
    setBusy(true)
    setError('')
    try {
      if (kind === 'in') await api.post('/attendance/clock-in')
      else await api.patch('/attendance/clock-out')
      await Promise.all([loadToday(), loadMonth()])
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // summary cards
  const finished = records.filter((r) => r.hours !== '--' && r.checkOut !== '--:--')
  const avg = finished.length
    ? (finished.reduce((sum, r) => sum + parseFloat(r.hours), 0) / finished.length).toFixed(1) + ' hrs'
    : '--'

  const summary = [
    { label: 'Present Days:', value: String(counts.present + counts.late + counts.remote) },
    { label: 'Absent Days:', value: String(counts.absent) },
    { label: 'Late Days:', value: String(counts.late) },
    { label: 'Avg. Hours:', value: avg },
  ]

  const dotDays = records.map((r) => r.day)
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
  const todayDay = isCurrentMonth ? now.getDate() : null

  return (
    <div className="px-4 py-6 sm:px-8 lg:px-10">
      {/* Title + month dropdown */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold sm:text-[44px] sm:leading-tight">Attendance</h1>
          <p className="text-lg">Track your working hours and attendance history.</p>
        </div>

        <div className="sm:w-[230px]">
          <label htmlFor="month" className="mb-1 block text-lg font-medium">Month</label>
          <div className="relative">
            <select
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-[#D8C9BC] bg-white px-4 pr-10 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D9A0A4]"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-400 bg-red-100 p-3 text-sm text-red-800">{error}</div>
      )}

      {/* Two columns on desktop, stacked on phones */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[6fr_5fr]">
        <div>
          <h2 className="mb-3 text-2xl font-semibold">Today's Attendance</h2>
          <TodayCard
            today={todayRec}
            busy={busy}
            onClockIn={() => handleClock('in')}
            onClockOut={() => handleClock('out')}
          />
          <MonthCalendar year={year} month={month} dotDays={dotDays} todayDay={todayDay} />
        </div>

        <div>
          <h2 className="mb-3 text-2xl font-semibold">Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-xl bg-[#541D25] p-5">
                <p className="text-lg text-[#E9B8BA]">{item.label}</p>
                <p className="text-3xl font-bold text-[#D9A0A4]">{item.value}</p>
              </div>
            ))}
          </div>

          <h2 className="mb-3 mt-6 text-2xl font-semibold">Attendance History</h2>
          <HistoryTable records={records} />
        </div>
      </div>
    </div>
  )
}

export default Attendance