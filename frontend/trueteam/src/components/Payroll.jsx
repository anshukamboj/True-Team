import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Sample data (replace with your API)                                 */
/* ------------------------------------------------------------------ */
const STATS = [
  { label: "Total Payroll",    value: "₹12,45,800", sub: "+4.2% YoY" },
  { label: "Average Salary",   value: "₹76,400",    sub: "Per Employee" },
  { label: "Total Deductions", value: "₹1,12,400",  sub: "9.0% total" },
  { label: "Pending Payroll",  value: "4 Teams",    sub: "Review required" },
];

const PAYROLL = [
  { id: 1, name: "Sarah Jenkins", dept: "Engineering", gross: 8250, ded: 850, net: 7400, status: "Processed" },
  { id: 2, name: "Marcus Vance",  dept: "Marketing",   gross: 7100, ded: 710, net: 6390, status: "Processed" },
  { id: 3, name: "Aisha Patel",   dept: "HR",          gross: 6800, ded: 680, net: 6120, status: "Processed" },
];

const REPORTS = [
  { id: 1, name: "Payroll Summary",    date: "Oct 2026" },
  { id: 2, name: "Attendance Report",  date: "Oct 2026" },
  { id: 3, name: "Leave Report",       date: "Oct 2026" },
  { id: 4, name: "Employee Report",    date: "Sep 2026" },
  { id: 5, name: "Performance Report", date: "Q3 2026" },
];

// chart values 0 to 1 (height)
const LINE_A = [0.06, 0.27, 0.22, 0.36, 0.52, 0.4, 0.33, 0.5, 0.6, 0.48, 0.62, 0.5, 0.78, 0.95];
const LINE_B = [0.03, 0.14, 0.2, 0.1, 0.38, 0.5, 0.36, 0.3, 0.44, 0.66, 0.82, 0.54, 0.7, 0.72];
// department compensation: [cream %, pink %]
const BARS = [[100, 89], [79, 58], [70, 48], [30, 52]];

const inr = (n) => `₹${n.toLocaleString("en-IN")}`;
const PINK = "#D9A5AA";
const CREAM = "#F7EFE2";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
// smooth line through points
function smoothPath(pts) {
  return pts.reduce((d, p, i, a) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const p0 = a[i - 2] || a[i - 1], p1 = a[i - 1], p2 = p, p3 = a[i + 1] || p;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return `${d} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }, "");
}

// makes a real CSV file in the browser (used for the demo downloads)
function saveFile(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */
const Card = ({ title, children, className = "" }) => (
  <section className={`rounded-2xl bg-[#4B101B] p-5 text-[#F7EFE2] sm:p-6 ${className}`}>
    <h2 className="mb-3 text-xl font-semibold leading-tight">{title}</h2>
    {children}
  </section>
);

function PayrollChart() {
  const W = 520, H = 190, P = 14;

  const { a, b, area } = useMemo(() => {
    const toPts = (arr) => arr.map((v, i) => [P + (i * (W - 2 * P)) / (arr.length - 1), P + (1 - v) * (H - 2 * P)]);
    const pa = toPts(LINE_A);
    const pb = toPts(LINE_B);
    const line = smoothPath(pa);
    return { a: line, b: smoothPath(pb), area: `${line} L${pa[pa.length - 1][0]},${H} L${pa[0][0]},${H} Z` };
  }, []);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Line chart showing monthly payroll trending upward over the year">
      <defs>
        <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PINK} stopOpacity="0.28" />
          <stop offset="100%" stopColor={PINK} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#fillA)" />
      <path d={b} fill="none" stroke={PINK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={a} fill="none" stroke={CREAM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// popup for "Generate Payroll"
function GenerateDialog({ onClose, onConfirm, busy }) {
  const first = useRef(null);
  const [period, setPeriod] = useState("Oct 2026");
  const [scope, setScope] = useState("pending");

  useEffect(() => {
    first.current?.focus();
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  const field = "h-10 w-full rounded-lg border border-white/20 bg-white/[0.04] px-3 text-sm text-[#F7EFE2] outline-none focus:border-[#D9A5AA] focus:ring-2 focus:ring-[#D9A5AA]/40";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="gp-title"
        onSubmit={(e) => { e.preventDefault(); onConfirm({ period, scope }); }}
        className="w-full max-w-sm rounded-2xl bg-[#4B101B] p-6 text-[#F7EFE2] shadow-2xl"
      >
        <h3 id="gp-title" className="text-xl font-semibold">Generate Payroll</h3>
        <p className="mb-4 mt-1 text-sm text-[#EAD5D3]">Choose the pay period and teams to include.</p>

        <label htmlFor="gp-period" className="mb-1.5 block text-[13px] text-[#F3DEDA]">Pay period</label>
        <select id="gp-period" ref={first} value={period} onChange={(e) => setPeriod(e.target.value)} className={`${field} mb-4`}>
          <option className="text-black">Oct 2026</option>
          <option className="text-black">Nov 2026</option>
        </select>

        <label htmlFor="gp-scope" className="mb-1.5 block text-[13px] text-[#F3DEDA]">Teams</label>
        <select id="gp-scope" value={scope} onChange={(e) => setScope(e.target.value)} className={field}>
          <option value="pending" className="text-black">Pending teams (4)</option>
          <option value="all" className="text-black">All teams</option>
        </select>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#e9cfd0] px-4 py-2 text-sm hover:bg-white/10">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[#D9A5AA] px-4 py-2 text-sm font-medium text-[#4B101B] hover:bg-[#e6b8bc] disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function PayrollPage() {
  const [dialog, setDialog] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // connect your payroll API here
  const generate = async ({ period }) => {
    setBusy(true);
    try {
      // TODO: await fetch("/api/payroll/generate", { method: "POST", body: JSON.stringify({ period }) })
      await new Promise((r) => setTimeout(r, 700));
      setDialog(false);
      setToast(`Demo only: payroll for ${period} was not processed. Connect your payroll API.`);
    } catch {
      setToast("Could not generate payroll. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // these download a CSV of the sample data on screen
  const downloadPayslip = (p) => {
    saveFile(
      `payslip-${p.name.replace(/\s+/g, "-").toLowerCase()}-sample.csv`,
      `Employee,Department,Gross Salary,Deductions,Net Salary,Status\n${p.name},${p.dept},${p.gross},${p.ded},${p.net},${p.status}\n`
    );
    setToast(`Sample payslip for ${p.name} saved (demo data)`);
  };

  const downloadReport = (r) => {
    saveFile(
      `${r.name.replace(/\s+/g, "-").toLowerCase()}-sample.csv`,
      `Report,Generated\n${r.name},${r.date}\nNote,Sample data only\n`
    );
    setToast(`${r.name} sample file saved (demo data)`);
  };

  const th = "whitespace-nowrap pb-3 pr-4 text-left text-[13px] font-normal text-[#EAD5D3]";
  const td = "whitespace-nowrap py-3.5 pr-4 text-[13.5px]";
  const dl = "inline-flex items-center gap-1.5 rounded-md py-1 text-[13px] text-[#D9A5AA] transition hover:text-white hover:underline";

  return (
    <div className="px-4 pb-14 pt-6 sm:px-8 lg:px-10">
      <p className="text-[15px]">
        <Link to="/hr/dashboard" className="text-[#7a5a5e] hover:underline">HR</Link>
        <span className="mx-2 text-[#7a5a5e]">/</span>Payroll &amp; Reports
      </p>

      {/* header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#4B101B] sm:text-[34px] xl:text-[38px]">Payroll &amp; Reports</h1>
          <p className="mt-1 text-[15px] sm:text-base">Manage compensation and generate workforce reports.</p>
        </div>
        <button
          onClick={() => setDialog(true)}
          className="h-12 w-full rounded-xl bg-[#D9A5AA] px-6 text-base font-medium text-[#4B101B] shadow-sm transition hover:bg-[#e3b4b8] sm:w-auto"
        >
          Generate Payroll
        </button>
      </div>

      {/* stats */}
      <section aria-label="Payroll summary" className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#4B101B] px-5 py-4 text-[#F7EFE2]">
            <h3 className="text-[17px] font-medium">{s.label}</h3>
            <p className="mt-0.5 text-3xl font-bold leading-tight tracking-tight sm:text-[34px]">{s.value}</p>
            <p className="mt-0.5 text-sm text-[#D9A5AA]">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* charts */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card title="Monthly Payroll">
          <div className="pt-2"><PayrollChart /></div>
        </Card>

        <Card title="Department Compensation">
          <div className="flex flex-col gap-4 pt-3" role="img" aria-label="Horizontal bar chart comparing compensation across departments">
            {BARS.map(([c, p], i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="h-2.5 rounded-full bg-[#F7EFE2]" style={{ width: `${c}%` }} />
                <span className="h-2.5 rounded-full bg-[#D9A5AA]" style={{ width: `${p}%` }} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* tables */}
      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <Card title="Current Payroll">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  {["Employee", "Department", "Gross Salary", "Deductions", "Net Salary", "Status", "Payslip"].map((h) => (
                    <th key={h} scope="col" className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYROLL.map((p) => (
                  <tr key={p.id} className="border-t border-white/10">
                    <td className={td}>{p.name}</td>
                    <td className={td}>{p.dept}</td>
                    <td className={td}>{inr(p.gross)}</td>
                    <td className={td}>{inr(p.ded)}</td>
                    <td className={td}>{inr(p.net)}</td>
                    <td className={td}>
                      <span className="inline-block rounded-full bg-[#F7EFE2] px-3 py-0.5 text-xs font-medium text-[#4B101B]">{p.status}</span>
                    </td>
                    <td className={td}>
                      <button type="button" onClick={() => downloadPayslip(p)} className={dl} aria-label={`Download payslip for ${p.name}`}>
                        <Download size={13} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Reports & Downloads">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[330px] border-collapse">
              <thead>
                <tr>
                  {["Report Name", "Generated", "Action"].map((h) => (
                    <th key={h} scope="col" className={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REPORTS.map((r) => (
                  <tr key={r.id} className="border-t border-white/10">
                    <td className="py-3 pr-3 text-[13.5px]">{r.name}</td>
                    <td className="whitespace-nowrap py-3 pr-3 text-[13.5px]">{r.date}</td>
                    <td className="whitespace-nowrap py-3">
                      <button type="button" onClick={() => downloadReport(r)} className={dl} aria-label={`Download ${r.name}`}>
                        <Download size={13} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {dialog && <GenerateDialog onClose={() => setDialog(false)} onConfirm={generate} busy={busy} />}

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