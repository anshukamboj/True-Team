import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Upload } from "lucide-react";
import { api } from "../services/api";

const LEAVE_TYPES = ["Annual Leave", "Sick Leave", "Casual Leave"];

// total days har type ke liye (yeh policy hai, database mein nahi)
const TOTALS = [
  { title: "Annual Leave", total: 20 },
  { title: "Sick Leave", total: 7 },
  { title: "Casual Leave", total: 5 },
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const iso10 = (d) => String(d).slice(0, 10);

// counts both the start day and the end day
const countDays = (start, end) => {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.round((e - s) / 86400000) + 1;
};

// "2026-08-11" -> "08/11/2026"
const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
};

const fmtLong = (date) =>
  date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

// API leave -> table row
const toRow = (l) => {
  const s = iso10(l.startDate);
  const e = iso10(l.endDate);
  const n = countDays(s, e);
  return {
    id: l._id,
    type: l.type,
    start: fmtDate(s),
    end: fmtDate(e),
    duration: `${n} ${n === 1 ? "Day" : "Days"}`,
    applied: fmtLong(new Date(l.createdAt)),
    status: cap(l.status),
    days: n,
    year: Number(s.slice(0, 4)),
  };
};

const fieldBase =
  "w-full rounded-lg border border-[#F1DCD8]/80 bg-transparent px-3 text-[15px] text-[#F7F0E6] " +
  "placeholder:text-[#D9A0A4]/70 outline-none transition focus:border-[#E9B8BA] focus:ring-1 focus:ring-[#E9B8BA]";

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[15px] font-medium text-[#F7F0E6]">
      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const color = status === "Approved" ? "bg-[#F7F0E6]" : status === "Rejected" ? "bg-[#E9B8BA]" : "bg-[#D9A0A4]";
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-0.5 text-[13px] font-medium text-[#4A1820] ${color}`}>
      {status}
    </span>
  );
}

function SummaryCard({ title, used, total }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  return (
    <div className="rounded-2xl bg-[#541D25] px-5 py-4 text-[#F7F0E6]">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-[26px] font-semibold leading-tight">
        {used}
        <span className="text-xl font-normal text-[#E9B8BA]"> / {total} Days</span>
      </p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-[#6E2F38]">
        <div className="h-full rounded-full bg-[#D9A0A4]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function LeaveManagement() {
  const formRef = useRef(null);
  const typeRef = useRef(null);
  const fileRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ type: "", start: "", end: "", reason: "", file: null });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadLeaves = async () => {
    try {
      const res = await api.get("/leaves?limit=100");
      setHistory(res.data.map(toRow));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  // is saal ke approved leave se "used" nikalo
  const thisYear = new Date().getFullYear();
  const SUMMARY = TOTALS.map((t) => ({
    ...t,
    used: history
      .filter((h) => h.type === t.title && h.status === "Approved" && h.year === thisYear)
      .reduce((sum, h) => sum + h.days, 0),
  }));
  const remaining = SUMMARY.reduce((sum, s) => sum + Math.max(0, s.total - s.used), 0);

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    typeRef.current?.focus({ preventScroll: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!form.type || !form.start || !form.end || !form.reason.trim()) {
      setError("Please fill in leave type, start date, end date and reason.");
      return;
    }
    if (form.end < form.start) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/leaves", {
        type: form.type,
        startDate: form.start,
        endDate: form.end,
        reason: form.reason.trim(),
      });

      await loadLeaves();

      setSuccess("Leave request submitted successfully.");
      setError("");
      setForm({ type: "", start: "", end: "", reason: "", file: null });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(err?.message || "Could not submit the request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-8 lg:px-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-[44px] sm:leading-tight">Leave Management</h1>
          <p className="text-lg">Apply for leave and track your requests.</p>
        </div>
        <button
          type="button"
          onClick={scrollToForm}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#D9A0A4] px-6 py-2.5 text-[17px] font-medium text-[#4A1820] transition hover:bg-[#E9B8BA]"
        >
          <Plus size={20} /> Request Leave
        </button>
      </div>

      {/* Summary cards */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        {SUMMARY.map((s) => (
          <SummaryCard key={s.title} {...s} />
        ))}
        <div className="rounded-2xl bg-[#541D25] px-5 py-4 text-[#F7F0E6]">
          <h3 className="text-lg font-semibold">Remaining Leave</h3>
          <p className="mt-1 text-[26px] font-semibold leading-tight">{remaining} Days</p>
        </div>
      </section>

      {/* Form + history */}
      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[31fr_69fr]">
        {/* Request form */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="scroll-mt-6 rounded-2xl bg-[#541D25] p-6 text-[#F7F0E6]"
        >
          <div>
            <Label htmlFor="leaveType">Leave Type</Label>
            <div className="relative">
              <select
                id="leaveType"
                ref={typeRef}
                value={form.type}
                onChange={setField("type")}
                className={`${fieldBase} h-11 cursor-pointer appearance-none pr-10 ${form.type ? "" : "text-[#D9A0A4]/80"}`}
              >
                <option value="" disabled className="text-[#4A1820]">Leave Type</option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t} className="text-[#4A1820]">{t}</option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <input
                id="startDate"
                type="date"
                value={form.start}
                onChange={setField("start")}
                className={`${fieldBase} h-11 [color-scheme:dark]`}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <input
                id="endDate"
                type="date"
                value={form.end}
                min={form.start || undefined}
                onChange={setField("end")}
                className={`${fieldBase} h-11 [color-scheme:dark]`}
              />
            </div>
          </div>

          <div className="mt-5">
            <Label htmlFor="reason">Reason</Label>
            <textarea
              id="reason"
              rows={3}
              value={form.reason}
              onChange={setField("reason")}
              className={`${fieldBase} min-h-[80px] resize-none py-2.5`}
            />
          </div>

          <div className="mt-5">
            <Label htmlFor="attachment">Attachment</Label>
            <label
              htmlFor="attachment"
              className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-[#F1DCD8]/80 px-3 text-[15px] transition hover:border-[#E9B8BA]"
            >
              <Upload size={18} className="shrink-0" />
              <span className="truncate">{form.file ? form.file.name : "Upload here"}</span>
            </label>
            <input
              id="attachment"
              ref={fileRef}
              type="file"
              className="sr-only"
              onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] || null }))}
            />
          </div>

          {error && <p role="alert" className="mt-4 text-sm text-[#E9B8BA]">{error}</p>}
          {success && <p role="status" className="mt-4 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 h-11 w-full rounded-lg bg-[#D9A0A4] text-[17px] font-medium text-[#4A1820] transition hover:bg-[#E9B8BA] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        {/* History */}
        <div className="relative min-h-[420px] rounded-2xl bg-[#541D25] p-6 text-[#F7F0E6]">
          <h3 className="text-2xl font-semibold">Leave History</h3>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
              <thead>
                <tr>
                  {["Leave Type", "Start Date", "End Date", "Duration", "Applied On", "Status"].map((h) => (
                    <th key={h} className="pb-4 pr-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#E9B8BA]">No leave requests yet.</td>
                  </tr>
                )}
                {history.map((row) => (
                  <tr key={row.id} className="border-t border-[#F7F0E6]/20 last:border-b">
                    <td className="py-3.5 pr-4">{row.type}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4">{row.start}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4">{row.end}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4">{row.duration}</td>
                    <td className="whitespace-nowrap py-3.5 pr-4">{row.applied}</td>
                    <td className="py-3.5"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

         
        </div>
      </section>
    </div>
  );
}