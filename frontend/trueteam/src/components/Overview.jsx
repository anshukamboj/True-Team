import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { api } from "../services/api";
import { getEmployees } from "../services/employees";

const card = "rounded-2xl bg-[#501820] text-[#F7EDDF]";

function toList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

function formatMoney(n) {
  n = Number(n || 0);
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(2) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(2) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
}

function timeAgo(date) {
  const mins = Math.round((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + " min ago";
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs + " hr ago";
  const days = Math.round(hrs / 24);
  return days === 1 ? "yesterday" : days + " days ago";
}

// last 6 months ka growth chart data
function getGrowthData(employees) {
  const now = new Date();
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const total = employees.filter((e) => new Date(e.createdAt) < end).length;
    const hired = employees.filter((e) => {
      const d = new Date(e.createdAt);
      return d >= start && d < end;
    }).length;

    data.push({
      month: start.toLocaleString("en-US", { month: "short" }),
      total,
      hired,
    });
  }

  return data;
}

function GrowthChart({ data }) {
  const left = 36, right = 385, top = 20, bottom = 262;
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const maxHired = Math.max(...data.map((d) => d.hired), 1);

  const getX = (i) => left + (i * (right - left)) / (data.length - 1);
  const getY = (v) => bottom - (v / maxTotal) * (bottom - top);
  const barHeight = (v) => (v / maxHired) * 60;

  const points = data.map((d, i) => getX(i) + "," + getY(d.total)).join(" ");

  return (
    <svg viewBox="0 0 400 300" className="h-full w-full">
      {[0, 0.5, 1].map((p) => {
        const y = bottom - p * (bottom - top);
        return (
          <g key={p}>
            <line x1={left} x2={right} y1={y} y2={y} stroke="#F7EDDF" strokeOpacity="0.12" />
            <text x={left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#F7EDDF" fillOpacity="0.8">
              {Math.round(p * maxTotal)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => (
        <rect
          key={i}
          x={getX(i) - 9}
          y={bottom - barHeight(d.hired)}
          width="18"
          height={barHeight(d.hired)}
          rx="3"
          fill="#D9A1A0"
          fillOpacity="0.55"
        />
      ))}

      <polyline
        points={points}
        fill="none"
        stroke="#F7EDDF"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {data.map((d, i) => (
        <g key={i}>
          <circle cx={getX(i)} cy={getY(d.total)} r="5" fill="#F7EDDF" />
          <text x={getX(i)} y={getY(d.total) - 10} textAnchor="middle" fontSize="11" fill="#F7EDDF">
            {d.total}
          </text>
          <text x={getX(i)} y={286} textAnchor="middle" fontSize="11" fill="#F7EDDF" fillOpacity="0.85">
            {d.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function HRDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [loading, setLoading] = useState(true);

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState({ present: 0, absent: 0, late: 0, remote: 0 });

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");

    // agar koi api fail ho to null le lo, page nahi tootega
    const safe = (promise) => promise.catch(() => null);

    Promise.all([
      getEmployees().catch(() => []),
      safe(api.get("/leaves?limit=100")),
      safe(api.get("/jobs")),
      safe(api.get("/payroll?limit=100")),
      safe(api.get("/attendance?limit=100&date=" + today)),
    ]).then(([emp, l, j, p, a]) => {
      setEmployees(emp);
      setLeaves(toList(l));
      setJobs(toList(j));
      setPayroll(toList(p));
      if (a?.summary) setAttendance(a.summary);
      setLoading(false);
    });
  }, []);

  // employees page jitne dikhata hai utne hi yahan bhi
  const totalEmployees = employees.length;

  const now = new Date();
  const newThisMonth = employees.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const presentToday = attendance.present + attendance.late + attendance.remote;
  const presentPercent = totalEmployees ? ((presentToday / totalEmployees) * 100).toFixed(1) : "0.0";

  const pendingLeaves = leaves.filter((l) => l.status === "pending").length;
  const approvedLeaves = leaves.filter((l) => l.status === "approved").length;
  const rejectedLeaves = leaves.filter((l) => l.status === "rejected").length;
  const leaveTotal = Math.max(1, pendingLeaves + approvedLeaves + rejectedLeaves);

  const openJobs = jobs.filter((j) => {
    const s = String(j.status || "").toLowerCase();
    return s === "open" || s === "active";
  }).length;

  // latest pay period ka payroll total
  const latestPeriod = payroll.map((p) => p.payPeriod).filter(Boolean).sort().pop();
  const payrollTotal = payroll
    .filter((p) => p.payPeriod === latestPeriod)
    .reduce((sum, p) => sum + Number(p.netPay || 0), 0);
  const pendingPayroll = payroll.filter((p) => p.status === "pending").length;
  const payrollMonth = latestPeriod
    ? new Date(latestPeriod + "-01T00:00:00Z").toLocaleString("en-US", { month: "long", timeZone: "UTC" })
    : "No data";

  const stats = [
    { title: "Total Employees", value: loading ? "--" : totalEmployees, sub: `+${newThisMonth} this month` },
    { title: "Present Today", value: loading ? "--" : presentPercent + "%", sub: `${presentToday} active` },
    {
      title: "Pending Leave",
      value: loading ? "--" : pendingLeaves,
      unit: "Requests",
      sub: pendingLeaves ? "Action required" : "All clear",
    },
    { title: "Open Positions", value: loading ? "--" : openJobs, unit: "Active", sub: `${jobs.length} total jobs` },
    { title: "Payroll Summary", value: loading ? "--" : formatMoney(payrollTotal), sub: payrollMonth },
  ];

  const growthData = getGrowthData(employees);

  const marked = attendance.present + attendance.late + attendance.remote + attendance.absent;
  const notMarked = Math.max(0, totalEmployees - marked);
  const attendanceBase = Math.max(1, marked + notMarked);

  const attendanceParts = [
    { label: "Present", value: attendance.present, color: "#F7EDDF" },
    { label: "Late", value: attendance.late, color: "#D9A1A0" },
    { label: "Remote", value: attendance.remote, color: "#E9B8BA" },
    { label: "Absent", value: attendance.absent, color: "#7A3640" },
    { label: "Not marked", value: notMarked, color: "#F7EDDF33" },
  ];

  const leaveRows = [
    { label: "Pending", value: pendingLeaves, color: "bg-[#F7EDDF]" },
    { label: "Approved", value: approvedLeaves, color: "bg-[#D9A1A0]" },
    { label: "Rejected", value: rejectedLeaves, color: "bg-[#D9A1A0]" },
  ];

  // naye employees + leave requests mila ke latest pehle
  const activityList = [
    ...employees.map((u) => ({
      text: (u.name || "New employee") + " joined",
      date: u.createdAt,
    })),
    ...leaves.map((l) => ({
      text: (l.employee?.name || "Employee") + " submitted " + String(l.type || "leave").toLowerCase(),
      date: l.createdAt,
    })),
  ]
    .filter((a) => a.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20);

  const query = search.trim().toLowerCase();
  const activity = activityList.filter((a) => a.text.toLowerCase().includes(query));

  const notifications = [];
  if (pendingLeaves > 0) {
    notifications.push(`${pendingLeaves} leave request${pendingLeaves > 1 ? "s are" : " is"} awaiting your action`);
  }
  if (openJobs > 0) {
    notifications.push(`${openJobs} open position${openJobs > 1 ? "s" : ""} currently active`);
  }
  if (pendingPayroll > 0) {
    notifications.push(`${pendingPayroll} payroll record${pendingPayroll > 1 ? "s are" : " is"} pending review`);
  }

  const quickActions = [
    { label: "Employees", path: "/hr/employees" },
    { label: "Recruitment", path: "/hr/recruitment" },
    { label: "Attendance", path: "/hr/attendance" },
    { label: "Payroll", path: "/hr/payroll" },
  ];

  return (
    <div className="px-4 py-6 sm:px-8 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-[40px] sm:leading-tight">HR Overview</h1>
          <p className="mt-1 text-base sm:text-[17px]">A clear view of your workforce today.</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative flex-1 sm:w-[245px] sm:flex-none">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4A4F]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity"
              className="h-10 w-full rounded-lg border border-[#D8C9BC] bg-transparent pl-10 pr-3 text-base outline-none placeholder:text-[#8A6E70] focus:border-[#D9A1A0]"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotif(!showNotif)}
              className="relative rounded-lg p-2 hover:bg-[#EBD5D0]/60"
            >
              <Bell size={24} strokeWidth={1.6} />
              {notifications.length > 0 && (
                <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-[#D9A1A0]" />
              )}
            </button>

            {showNotif && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
                <div className="absolute right-0 z-50 mt-2 w-[290px] max-w-[85vw] rounded-xl bg-[#501820] p-4 text-[#F7EDDF] shadow-lg">
                  <p className="text-[15px] font-semibold">Notifications</p>
                  {notifications.length === 0 ? (
                    <p className="mt-2 text-sm text-[#D9B7B2]">You're all caught up.</p>
                  ) : (
                    <ul className="mt-2 divide-y divide-[#F7EDDF]/15">
                      {notifications.map((n) => (
                        <li key={n} className="py-2 text-sm text-[#D9B7B2]">
                          {n}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <section className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((s, i) => (
          <div
            key={s.title}
            className={`${card} min-w-0 px-4 py-4 sm:px-5 ${i === 4 ? "min-[480px]:col-span-2 lg:col-span-1" : ""}`}
          >
            <p className="text-base sm:text-lg">{s.title}</p>
            <p className="mt-1 flex flex-wrap items-baseline text-[30px] font-bold leading-tight sm:text-[38px]">
              {s.value}
              {s.unit && <span className="ml-2 text-[20px] font-semibold sm:text-[24px]">{s.unit}</span>}
            </p>
            <p className="mt-0.5 text-[15px] text-[#D9B7B2]">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* Main grid */}
      <section className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[34fr_33fr_33fr] xl:grid-rows-[auto_1fr]">
        {/* Workforce */}
        <div className={`${card} flex min-h-[340px] min-w-0 flex-col p-5 md:col-span-2 xl:col-span-1 xl:row-span-2`}>
          <h3 className="text-[22px] font-semibold">Workforce Overview</h3>
          <p className="mt-2 text-base text-[#F3DCD8]">Employee growth, last 6 months</p>

          <div className="mt-4 min-h-[240px] flex-1">
            {loading ? (
              <p className="py-10 text-center text-[#D9B7B2]">Loading...</p>
            ) : (
              <GrowthChart data={growthData} />
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#D9B7B2]">
            <span className="flex items-center gap-1.5">
              <i className="h-1 w-5 rounded bg-[#F7EDDF]" /> Total employees
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-3 w-3 rounded-sm bg-[#D9A1A0]/60" /> New hires
            </span>
          </div>
        </div>

        {/* Attendance */}
        <div className={`${card} min-w-0 p-5`}>
          <h3 className="text-[22px] font-semibold">Attendance Overview</h3>
          <p className="mt-1 text-sm text-[#D9B7B2]">Today, out of {totalEmployees} employees</p>

          <div className="mt-4 flex h-10 w-full overflow-hidden rounded-md bg-[#F7EDDF]/10">
            {attendanceParts.map(
              (p) =>
                p.value > 0 && (
                  <div
                    key={p.label}
                    title={`${p.label}: ${p.value}`}
                    style={{ width: `${(p.value / attendanceBase) * 100}%`, background: p.color }}
                  />
                )
            )}
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[15px]">
            {attendanceParts.map((p) => (
              <li key={p.label} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                  <span className="truncate">{p.label}</span>
                </span>
                <span className="text-[#D9B7B2]">{p.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className={`${card} min-w-0 p-5`}>
          <h3 className="text-[22px] font-semibold">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => navigate(a.path)}
                className="rounded-lg bg-[#D9A1A0] px-2 py-2.5 text-[15px] font-medium text-[#48151C] transition hover:bg-[#E9B8BA]"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leave */}
        <div className={`${card} min-w-0 p-5`}>
          <h3 className="text-[22px] font-semibold">Leave Overview</h3>
          <div className="mt-4 space-y-4">
            {leaveRows.map((l) => (
              <div key={l.label}>
                <div className="flex items-center justify-between text-[15px]">
                  <span>{l.label}</span>
                  <span className="text-[#D9B7B2]">{l.value}</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-[#F7EDDF]/15">
                  <div
                    className={`h-full rounded-full ${l.color}`}
                    style={{ width: `${(l.value / leaveTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity (4 dikhte hain, baaki scroll) */}
        <div className={`${card} min-w-0 overflow-hidden p-5 md:col-span-2 xl:col-span-1`}>
          <h3 className="text-[22px] font-semibold">Recent Activity</h3>

          {loading ? (
            <p className="mt-4 text-[15px] text-[#D9B7B2]">Loading...</p>
          ) : activity.length === 0 ? (
            <p className="mt-4 text-[15px] text-[#D9B7B2]">
              {query ? "No activity matches your search." : "No recent activity yet."}
            </p>
          ) : (
            <div className="mt-4 max-h-[232px] overflow-y-auto pr-2 [scrollbar-color:#D9A1A0_transparent] [scrollbar-width:thin]">
              <ul className="relative">
                <span className="absolute bottom-3 left-[5px] top-3 w-px bg-[#D9A1A0]/60" />
                {activity.map((a, i) => (
                  <li key={a.text + a.date} className="relative flex items-start gap-4 py-2 text-[15px]">
                    <span
                      className={`relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full ${
                        i % 2 === 0 ? "bg-[#F7EDDF]" : "bg-[#D9A1A0]"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block break-words">{a.text}</span>
                      <span className="block text-xs text-[#D9B7B2]">{timeAgo(a.date)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}