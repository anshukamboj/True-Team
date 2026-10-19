import { useEffect, useState } from "react";
import { Download, Eye, FileText} from "lucide-react";
import { api } from "../services/api";

/*
  Documents abhi demo data hai (backend ka documents route baad mein jodenge).
  Put a real file link in `url` to make View / Download work.
*/
const DOCS = [
  { name: "Employment Contract", meta: "PDF • Jan 15", action: "View", url: "" },
  { name: "September Payslip", meta: "PDF • Jan 15", action: "View", url: "" },
  { name: "Tax Documents (W-4)", meta: "PDF • Jan 15", action: "Download", url: "" },
  { name: "ID Documents (Passport)", meta: "PDF • Jan 15", action: "View", url: "" },
  { name: "Company Policies", meta: "PDF • Jan 15", action: "Download", url: "" },
];

const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// "2026-09" -> "September"
const monthName = (period) =>
  new Date(period + "-01T00:00:00Z").toLocaleString("en-US", { month: "long", timeZone: "UTC" });

// payday ko UTC mein dikhao taaki date khisake nahi
const fmtDay = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });

function openFile(url, label) {
  if (!url) {
    window.alert(`No file is available yet for "${label}".`);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function downloadFile(url, label) {
  if (!url) {
    window.alert(`No file is available yet for "${label}".`);
    return;
  }
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const summaryCard = "rounded-2xl bg-[#501820] px-5 py-4 text-[#F7EDDF]";

export default function PayrollDocuments() {
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/payroll?limit=100");
        setPayroll(res.data); // backend payday ke hisab se naya pehle bhejta hai
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // history = jo ho chuka (pending nahi), summary = sabse latest paid record
  const history = payroll.filter((p) => p.status !== "pending");
  const latest = history[0];
  const previous = history[1];
  const upcoming = payroll
    .filter((p) => p.status === "pending")
    .sort((a, b) => new Date(a.payday) - new Date(b.payday))[0];

  const change =
    latest && previous && previous.grossPay > 0
      ? (((latest.grossPay - previous.grossPay) / previous.grossPay) * 100).toFixed(1)
      : null;

  const daysLeft = upcoming
    ? Math.max(0, Math.ceil((new Date(upcoming.payday) - new Date()) / 86400000))
    : null;

  const downloadAll = () => {
    const available = DOCS.filter((d) => d.url);
    if (available.length === 0) {
      window.alert("No documents are available to download yet.");
      return;
    }
    available.forEach((d) => downloadFile(d.url, d.name));
  };

  return (
    <div className="px-4 py-6 sm:px-8 lg:px-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-[44px] sm:leading-tight">Payroll &amp; Documents</h1>
      <p className="text-lg">Your salary details, payslips and files.</p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-400 bg-red-100 p-3 text-sm text-red-800">{error}</div>
      )}

      {/* Summary */}
      <h2 className="mt-8 text-2xl font-bold">Payroll Summary</h2>
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        <div className={summaryCard}>
          <div className="flex items-start justify-between">
            <p className="text-[17px]">Gross Salary</p>
            {change !== null && (
              <span className="text-[15px] text-[#E9B8BA]">{change > 0 ? "+" : ""}{change}%</span>
            )}
          </div>
          <p className="mt-1 text-4xl font-bold leading-tight">{latest ? money(latest.grossPay) : "--"}</p>
          <p className="mt-1 text-base text-[#E9B8BA]">Before deductions</p>
        </div>

        <div className={summaryCard}>
          <p className="text-[17px]">Deductions</p>
          <p className="mt-1 text-4xl font-bold leading-tight">{latest ? money(latest.deductions) : "--"}</p>
        </div>

        <div className={summaryCard}>
          <p className="text-[17px]">Net Salary</p>
          <p className="mt-1 text-4xl font-bold leading-tight text-[#D9A1A0]">{latest ? money(latest.netPay) : "--"}</p>
        </div>

        <div className={summaryCard}>
          <p className="text-[17px]">Next Payday</p>
          <p className="mt-2 text-3xl font-bold leading-tight text-[#D9A1A0]">
            {upcoming ? fmtDay(upcoming.payday) : "--"}
          </p>
          <p className="mt-1 text-base text-[#E9B8BA]">
            {daysLeft === null ? "Not scheduled" : daysLeft === 0 ? "Today" : `${daysLeft} days`}
          </p>
        </div>
      </section>

      {/* Panels */}
      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[60fr_40fr] xl:gap-7">
        {/* Salary history */}
        <div className="min-w-0 rounded-2xl bg-[#501820] p-5 text-[#F7EDDF] sm:p-6">
          <h3 className="text-2xl font-semibold">Salary History</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-140 border-collapse text-left text-base">
              <thead>
                <tr className="border-b border-[#F7EDDF]/20">
                  {["Month", "Gross", "Deductions", "Net", "Status", "Payslip"].map((h) => (
                    <th key={h} className="pb-3 pr-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#E9B8BA]">Loading...</td>
                  </tr>
                )}
                {!loading && history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#E9B8BA]">No salary records yet.</td>
                  </tr>
                )}
                {history.map((r) => (
                  <tr key={r._id} className="border-b border-[#F7EDDF]/20">
                    <td className="py-3 pr-3">{monthName(r.payPeriod)}</td>
                    <td className="py-3 pr-3">{money(r.grossPay)}</td>
                    <td className="py-3 pr-3">{money(r.deductions)}</td>
                    <td className="py-3 pr-3">{money(r.netPay)}</td>
                    <td className="py-3 pr-3">
                      <span className="rounded-full bg-[#7A3640] px-3 py-0.5 text-[13px]">{cap(r.status)}</span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => downloadFile("", `${monthName(r.payPeriod)} payslip`)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-[#E9B8BA] transition hover:text-[#F7EDDF]"
                      >
                        <Download size={18} /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents */}
        <div className="relative min-w-0 rounded-2xl bg-[#501820] p-5 text-[#F7EDDF] sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold">Documents</h3>
            <button
              type="button"
              aria-label="Download all documents"
              onClick={downloadAll}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7A3640]/70 transition hover:bg-[#7A3640]"
            >
              <Download size={20} />
            </button>
          </div>

          <ul className="mt-4 border-t border-[#F7EDDF]/20">
            {DOCS.map((d) => {
              const isView = d.action === "View";
              const Icon = isView ? Eye : Download;
              return (
                <li
                  key={d.name}
                  className="flex items-center justify-between gap-3 border-b border-[#F7EDDF]/20 py-3 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={28} strokeWidth={1.4} className="shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-base">{d.name}</p>
                      <p className="text-[13px] text-[#E9B8BA]">{d.meta}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => (isView ? openFile(d.url, d.name) : downloadFile(d.url, d.name))}
                    className="inline-flex shrink-0 items-center gap-1.5 text-base text-[#E9B8BA] transition hover:text-[#F7EDDF]"
                  >
                    <Icon size={18} /> {d.action}
                  </button>
                </li>
              );
            })}
          </ul>

         
        </div>
      </section>
    </div>
  );
}