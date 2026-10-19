import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../services/api";

/* Sample data (replace with your API)                                 */


const DEPTS = ["Engineering", "Marketing", "Design", "Product", "Finance", "HR"];
const TYPES = ["Annual Leave", "Sick Leave", "Casual Leave"];
const STATUSES = ["Pending", "Approved", "Rejected"];
const DATE_OPTS = [{ v: "2026-10", l: "October 2026" }, { v: "2026-11", l: "November 2026" }];

const CAL_DAYS = 28;
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const diffDays = (a, b) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const fmt = (d) => `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
const rangeText = (r) => (r.start === r.end ? fmt(parse(r.start)) : `${fmt(parse(r.start))} - ${fmt(parse(r.end))}`);
const durationText = (r) => { const n = diffDays(parse(r.start), parse(r.end)) + 1; return `${n} Day${n > 1 ? "s" : ""}`; };
const initials = (n) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const AVATAR_COLORS = ["bg-amber-700", "bg-slate-500", "bg-fuchsia-800", "bg-emerald-700", "bg-rose-700", "bg-sky-700"];
const toReq = (l, i) => ({
  id: l._id,
  name: l.employee?.name || "Unknown",
  email: l.employee?.email || "",
  dept: l.employee?.department || "-",
  type: l.type,
  start: String(l.startDate).slice(0, 10),
  end: String(l.endDate).slice(0, 10),
  reason: l.reason,
  status: cap(l.status),
  color: AVATAR_COLORS[i % AVATAR_COLORS.length],
  avatar: "",
});
/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */
function Avatar({ r }) {
  return r.avatar
    ? <img src={r.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full border-2 border-white/50 object-cover" />
    : <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/50 text-[11px] font-bold text-white ${r.color}`}>{initials(r.name)}</span>;
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full min-w-0 cursor-pointer appearance-none rounded-xl border border-[#E6D6C4] bg-[#F9F1E7] pl-3.5 pr-9 text-sm text-[#2a0d12] outline-none transition focus-visible:ring-2 focus-visible:ring-[#D9A5AA] sm:min-w-[132px]"
      >
        <option value="">{label}</option>
        {options.map((o) =>
          typeof o === "string"
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.v} value={o.v}>{o.l}</option>
        )}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-3" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Leave calendar (28-day timeline)                                    */
/* ------------------------------------------------------------------ */
function LeaveCalendar({ events, onOpen }) {
  const [start, setStart] = useState(new Date(2026, 10, 1)); // Sun, Nov 1 2026
  const today = new Date();

  const days = useMemo(() => Array.from({ length: CAL_DAYS }, (_, i) => addDays(start, i)), [start]);

  // cut each event to the window and place it on a free row
  const { placed, rows } = useMemo(() => {
    const items = events
      .map((e) => ({ ...e, s: diffDays(start, parse(e.start)), e: diffDays(start, parse(e.end)) }))
      .filter((e) => e.e >= 0 && e.s < CAL_DAYS)
      .map((e) => ({ ...e, cs: Math.max(0, e.s), ce: Math.min(CAL_DAYS - 1, e.e) }))
      .sort((a, b) => a.cs - b.cs || (b.ce - b.cs) - (a.ce - a.cs));

    const ends = [];
    const placed = items.map((it) => {
      let lane = ends.findIndex((x) => x < it.cs);
      if (lane === -1) { lane = ends.length; ends.push(it.ce); } else ends[lane] = it.ce;
      return { ...it, lane };
    });
    return { placed, rows: Math.max(4, ends.length) };
  }, [events, start]);

  const cols = { gridTemplateColumns: `repeat(${CAL_DAYS}, minmax(0, 1fr))` };
  const last = addDays(start, CAL_DAYS - 1);
  const label = `${fmt(start)} – ${fmt(last)}, ${last.getFullYear()}`;

  const navBtn = "flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9A5AA]";

  return (
    <section aria-labelledby="cal-title" className="rounded-2xl bg-[#4B101B] p-4 text-[#F7EFE2] sm:p-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="cal-title" className="text-lg font-semibold">Organization-Wide Leave Calendar</h2>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <button className={navBtn} aria-label="Previous week" onClick={() => setStart(addDays(start, -7))}><ChevronLeft size={17} /></button>
          <strong className="min-w-[150px] text-center text-sm font-semibold">{label}</strong>
          <button className={navBtn} aria-label="Next week" onClick={() => setStart(addDays(start, 7))}><ChevronRight size={17} /></button>
          <button
            onClick={() => setStart(addDays(today, -today.getDay()))}
            className="h-8 rounded-lg border border-white/20 bg-white/10 px-3 text-[13px] transition hover:bg-white/20"
          >
            Today
          </button>
        </div>
      </div>

      {/* legend */}
      <div className="mb-3 mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#D9A5AA]">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-6 rounded-full bg-[#D9A5AA]" /> Approved / scheduled</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-6 rounded-full border border-dashed border-[#D9A5AA]" /> Pending</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#D9A5AA]" /> Single day</span>
       
      </div>

      <div className="overflow-x-auto pb-2" tabIndex={0} aria-label="Leave timeline, scroll sideways for more days">
        <div className="min-w-[1008px]">
          {/* weekday + date header */}
          <div className="grid" style={cols}>
            {days.map((d) => {
              const isToday = iso(d) === iso(today);
              return (
                <div key={iso(d)} className="pb-1.5 text-center leading-tight">
                  <div className="text-[12.5px] text-[#F3DEDA]">{DOW[d.getDay()]}</div>
                  <div className={`mx-auto mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10.5px] ${isToday ? "bg-[#D9A5AA] font-bold text-[#4B101B]" : "text-[#D9A5AA]/80"}`}>
                    {d.getDate() === 1 ? MON[d.getMonth()] : d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* grid + events */}
          <div className="relative overflow-hidden rounded-lg border border-white/15" style={{ minHeight: rows * 30 + 14 }}>
            <div className="absolute inset-0 grid" style={cols} aria-hidden="true">
              {days.map((d, i) => (
                <div key={i} className={`border-l border-white/10 first:border-l-0 ${d.getDay() === 0 || d.getDay() === 6 ? "bg-white/[0.035]" : ""}`} />
              ))}
            </div>

            <ul className="relative grid auto-rows-[30px] py-[7px]" style={cols}>
              {placed.map((ev) => {
                const single = ev.cs === ev.ce && ev.s === ev.e;
                const pending = ev.status === "Pending";
                const text = `${ev.name} · ${ev.type} · ${rangeText(ev)}${pending ? " (pending)" : ""}`;
                return (
                  <li key={ev.id} className="flex items-center" style={{ gridColumn: `${ev.cs + 1} / ${ev.ce + 2}`, gridRow: ev.lane + 1 }}>
                    <button
                      type="button"
                      title={text}
                      aria-label={text}
                      onClick={() => ev.reqId && onOpen(ev.reqId)}
                      className={`transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                        ${ev.reqId ? "cursor-pointer hover:brightness-110" : "cursor-default"}
                        ${single
                          ? `mx-auto h-2.5 w-2.5 rounded-full ${pending ? "border border-dashed border-[#D9A5AA]" : "bg-[#D9A5AA]"}`
                          : `mx-1 h-[22px] w-full min-w-0 truncate rounded-full px-3 text-left text-[11.5px] font-semibold leading-[22px]
                             ${pending ? "border border-dashed border-[#D9A5AA] bg-[#D9A5AA]/10 text-[#F3DEDA]" : "bg-[#D9A5AA] text-[#4B101B]"}`}`}
                    >
                      {!single && ev.name}
                    </button>
                  </li>
                );
              })}
            </ul>

            {placed.length === 0 && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-[#D9A5AA]">No leave in this period</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LeavePage() {
   const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/leaves?limit=100");
      setRequests(res.data.map(toReq));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);
  const [tab, setTab] = useState("pending");
  const [f, setF] = useState({ dept: "", type: "", status: "", date: "" });
  const [detail, setDetail] = useState(null); // request id
  const [toast, setToast] = useState("");
  const closeRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") setDetail(null); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  useEffect(() => { if (detail) closeRef.current?.focus(); }, [detail]);

  // counters (starting numbers + live changes)
    const count = (s) => requests.filter((r) => r.status === s).length;
  const counts = { pending: count("Pending"), approved: count("Approved"), rejected: count("Rejected") };
  const todayIso = iso(new Date());
  const awayNow = requests.filter((r) => r.status === "Approved" && r.start <= todayIso && r.end >= todayIso).length;

  const setFilter = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const switchTab = (t) => { setTab(t); setF((x) => ({ ...x, status: "" })); };

  const list = requests.filter((r) =>
    (tab === "pending" ? r.status === "Pending" : r.status !== "Pending") &&
    (!f.dept || r.dept === f.dept) &&
    (!f.type || r.type === f.type) &&
    (!f.status || r.status === f.status) &&
    (!f.date || r.start.startsWith(f.date) || r.end.startsWith(f.date))
  );

  // approve / reject: connect your API here
    const decide = async (id, status) => {
    const r = requests.find((x) => x.id === id);
    try {
      await api.patch(`/leaves/${id}/review`, { status: status.toLowerCase() });
      await load();
      setDetail(null);
      setToast(`${r.name}'s request marked ${status.toLowerCase()}`);
    } catch (err) {
      setToast(err.message);
    }
  };

  // calendar events: requests (not rejected) + sample team leave
  const events = useMemo(() => [
    ...requests
      .filter((r) => r.status !== "Rejected")
      .map((r) => ({
        id: `r${r.id}`, reqId: r.id,
        name: r.name.replace(/(\w+) (\w)\w*/, "$1 $2."),
        type: r.type, start: r.start, end: r.end, status: r.status,
      })),
    
  ], [requests]);

  const det = requests.find((r) => r.id === detail);

  const btnApprove = "rounded-lg bg-[#D9A5AA] px-3.5 py-2 text-[13px] font-medium text-[#4B101B] transition hover:bg-[#e6b8bc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white xl:py-1.5";
  const btnReject = "rounded-lg border border-[#e9cfd0] px-3.5 py-2 text-[13px] font-medium text-[#F7EFE2] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white xl:py-1.5";
  const COLS = "xl:grid-cols-[1.75fr_1.15fr_1.1fr_1.2fr_.8fr_1.35fr_2.2fr]";

  const cell = (label, node) => (
    <div className="flex items-center justify-between gap-3 text-[13.5px] xl:block">
      <span className="text-xs text-[#D9A5AA] xl:hidden">{label}</span>
      <span className="text-right xl:text-left">{node}</span>
    </div>
  );

  const stat = "rounded-2xl bg-[#4B101B] px-[15px] py-3.5 text-[#F7EFE2]";

  return (
    <div className="px-4 pb-14 pt-6 sm:px-8 lg:px-10">
      <p className="text-sm">
        <Link to="/hr/employees" className="text-[#7a5a5e] hover:underline">Employees</Link> / <span>Leave Requests</span>
      </p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight text-[#4B101B] sm:text-[32px]">Leave Requests</h1>
      <p className="mt-1 text-sm">Review and manage employee leave requests.</p>
      {error && <p className="mt-4 text-red-700">{error}</p>}
      {/* stats */}
      <section aria-label="Leave summary" className="mt-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        <div className={stat}>
          <h3 className="text-sm font-semibold">Pending Requests</h3>
          <p className="mt-0.5 flex items-baseline gap-2.5">
            <b className="text-[34px] font-bold leading-tight">{counts.pending}</b>
            
          </p>
        </div>
        <div className={stat}>
          <h3 className="text-sm font-semibold">Approved</h3>
          <p className="mt-0.5"><b className="text-[34px] font-bold leading-tight">{counts.approved}</b></p>
        </div>
        <div className={`${stat} !bg-[#5b1a28]`}>
          <h3 className="text-sm font-semibold text-[#D9A5AA]">Rejected</h3>
          <p className="mt-0.5"><b className="text-[34px] font-bold leading-tight text-[#D9A5AA]/60">{counts.rejected}</b></p>
        </div>
        <div className={stat}>
          <h3 className="text-sm font-semibold">Currently Away</h3>
          <p className="mt-0.5 flex items-center gap-2.5">
            <b className="text-[34px] font-bold leading-tight">{awayNow}</b>
            <i className="h-2.5 w-2.5 rounded-full bg-[#D9A5AA]" />
          </p>
        </div>
      </section>

      {/* filters + tabs */}
      <div className="mb-4 mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
          <Select label="Department" value={f.dept} onChange={setFilter("dept")} options={DEPTS} />
          <Select label="Leave Type" value={f.type} onChange={setFilter("type")} options={TYPES} />
          <Select
            label="Status"
            value={f.status}
            onChange={setFilter("status")}
            options={tab === "pending" ? ["Pending"] : STATUSES.filter((s) => s !== "Pending")}
          />
          <Select label="Date" value={f.date} onChange={setFilter("date")} options={DATE_OPTS} />
        </div>

        <div role="tablist" aria-label="Request view" className="ml-auto flex items-center gap-2 text-[15px]">
          <button
            role="tab"
            aria-selected={tab === "pending"}
            onClick={() => switchTab("pending")}
            className={`rounded px-1 transition ${tab === "pending" ? "font-semibold text-[#2a0d12]" : "text-[#8b7276]"}`}
          >
            Pending
          </button>
          <span className="h-4 w-px bg-[#d5c2b0]" aria-hidden="true" />
          <button
            role="tab"
            aria-selected={tab === "history"}
            onClick={() => switchTab("history")}
            className={`rounded px-1 transition ${tab === "history" ? "font-semibold text-[#2a0d12]" : "text-[#8b7276]"}`}
          >
            History
          </button>
        </div>
      </div>

      {/* table */}
      <section aria-labelledby="tbl-title" className="mb-5 rounded-2xl bg-[#4B101B] p-4 text-[#F7EFE2] sm:p-[15px]">
        <h2 id="tbl-title" className="mb-3 text-lg font-semibold">
          {tab === "pending" ? "Pending Requests" : "Request History"}
        </h2>

        <div className={`hidden gap-3 pb-2.5 text-[13px] font-semibold xl:grid ${COLS}`}>
          <span>Employee</span><span>Department</span><span>Leave Type</span><span>Dates</span>
          <span>Duration</span><span>Reason</span><span>{tab === "pending" ? "Action" : "Status"}</span>
        </div>

        <ul>
          {list.map((r) => (
            <li key={r.id} className={`grid grid-cols-1 gap-2 border-t border-white/10 py-4 xl:items-center xl:gap-3 xl:py-3 ${COLS}`}>
              <div className="flex items-center gap-2.5">
                <Avatar r={r} />
                <span className="min-w-0 leading-tight">
                  <b className="block truncate text-[13.5px] font-semibold">{r.name}</b>
                  <em className="block truncate text-[11.5px] not-italic text-[#D9A5AA]">{r.email}</em>
                </span>
              </div>

              {cell("Department", <><i className="mr-2 inline-block h-[5px] w-[5px] rounded-full bg-[#F3DEDA] align-middle" />{r.dept}</>)}
              {cell("Leave Type", r.type)}
              {cell("Dates", rangeText(r))}
              {cell("Duration", durationText(r))}
              {cell("Reason", r.reason)}

              <div className="flex flex-wrap items-center gap-2 pt-1 xl:pt-0">
                {r.status === "Pending" ? (
                  <>
                    <button onClick={() => decide(r.id, "Approved")} className={`${btnApprove} max-xl:flex-1`} aria-label={`Approve ${r.name}'s request`}>Approve</button>
                    <button onClick={() => decide(r.id, "Rejected")} className={`${btnReject} max-xl:flex-1`} aria-label={`Reject ${r.name}'s request`}>Reject</button>
                  </>
                ) : (
                  <span className={`rounded-md px-2.5 py-1 text-[13px] ${r.status === "Approved" ? "bg-[#2f6b3f] text-[#d9f2df]" : "bg-[#6b3a44] text-[#f1d3d6]"}`}>
                    {r.status}
                  </span>
                )}
                <button
                  onClick={() => setDetail(r.id)}
                  className="rounded px-1 text-[11.5px] text-[#D9A5AA] hover:text-white hover:underline max-xl:w-full max-xl:py-1 max-xl:text-center"
                >
                  View Details
                </button>
              </div>
            </li>
          ))}
        </ul>

        {list.length === 0 && (
          <p className="border-t border-white/10 py-8 text-center text-sm text-[#D9A5AA]">
            {tab === "pending" ? "No pending requests match these filters." : "No history matches these filters."}
          </p>
        )}
      </section>

      <LeaveCalendar events={events} onOpen={setDetail} />

      {/* details popup */}
      {det && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="dt-title" className="w-full max-w-sm rounded-2xl bg-[#4B101B] p-6 text-[#F7EFE2] shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <Avatar r={det} />
              <div>
                <h3 id="dt-title" className="font-semibold leading-tight">{det.name}</h3>
                <p className="text-xs text-[#D9A5AA]">{det.email}</p>
              </div>
            </div>

            <dl className="space-y-2 text-sm">
              {[
                ["Department", det.dept], ["Leave type", det.type], ["Dates", rangeText(det)],
                ["Duration", durationText(det)], ["Reason", det.reason], ["Status", det.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/10 pb-1.5">
                  <dt className="text-[#D9A5AA]">{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap justify-end gap-2.5">
              <button ref={closeRef} onClick={() => setDetail(null)} className={btnReject}>Close</button>
              {det.status === "Pending" && (
                <>
                  <button onClick={() => decide(det.id, "Rejected")} className={btnReject}>Reject</button>
                  <button onClick={() => decide(det.id, "Approved")} className={btnApprove}>Approve</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* message at the bottom */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[60] w-max max-w-[92vw] -translate-x-1/2 rounded-xl bg-[#4B101B] px-5 py-3 text-center text-sm text-[#F7EFE2] shadow-xl transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      >
        {toast}
      </div>
    </div>
  );
}