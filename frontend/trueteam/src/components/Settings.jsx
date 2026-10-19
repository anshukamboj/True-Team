import { useEffect, useState } from "react";
import {
  Upload, MoreHorizontal, Check, AlertCircle, Pencil, Power, Trash2,
} from "lucide-react";

const SUBNAV = [
  { group: "Organization", items: [
    { label: "Company Profile", section: "company-profile" },
    { label: "Departments", section: "departments-card" },
    { label: "Locations" },
  ]},
  { group: "People", items: [
    { label: "Roles & Permissions" },
    { label: "Employee Policies" },
  ]},
  { group: "System", items: [
    { label: "Notifications" },
    { label: "Security", section: "security-card" },
    { label: "Integrations" },
  ]},
  { group: "Appearance", items: [
    { label: "Theme Preferences" },
  ]},
];

const INITIAL_PROFILE = {
  name: "Empower HR Corp",
  industry: "SaaS & Tech",
  email: "hr@empower.com",
  phone: "+1 555-0199",
  website: "empowerhr.com",
  address: "100 Plaza Way",
};

const INITIAL_DEPTS = [
  { id: 1, name: "Engineering", manager: "Sarah Connor", employees: 48, active: true },
  { id: 2, name: "Marketing",   manager: "Marcus Vance", employees: 16, active: true },
  { id: 3, name: "HR & Admin",  manager: "Aisha Patel",  employees: 8,  active: true },
  { id: 4, name: "Product",     manager: "Daniel Kim",   employees: 12, active: true },
];

// settings are kept in the browser for now (demo)
const STORAGE_KEY = "empower_company_settings";
const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
};

/* ------------------------------------------------------------------ */
/* Small components                                                    */
/* ------------------------------------------------------------------ */
function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#fff" />
      <circle cx="23.5" cy="13.5" r="5" fill="#D9A5AA" />
      <path d="M12.5 19.5c0 7 5 12.5 11 12.5-3-4-3-8 0-11.5-4 1.2-8 0-11-1z" fill="#4B101B" />
    </svg>
  );
}

function Field({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] text-[#F3DEDA]">{label}</label>
      <input
        id={id}
        name={id}
        aria-invalid={!!error}
        className={`h-10 w-full rounded-lg border bg-white/[0.03] px-3 text-sm text-[#F7EFE2] outline-none transition placeholder:text-white/40 focus:border-[#D9A5AA] focus:ring-2 focus:ring-[#D9A5AA]/40 ${error ? "border-red-300" : "border-white/20"}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-200">{error}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition ${checked ? "border-[#D9A5AA] bg-[#D9A5AA]" : "border-white/30 bg-[#2f0a12]"}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-[#F7EFE2] shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

const Card = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-6 rounded-2xl bg-[#4B101B] p-5 text-[#F7EFE2] sm:p-6">
    <h2 className="mb-4 text-[22px] font-bold leading-tight">{title}</h2>
    {children}
  </section>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function SettingsPage() {
  const saved = load();

  const [activeSub, setActiveSub] = useState("Company Profile");
  const [form, setForm] = useState(saved.profile || INITIAL_PROFILE);
  const [errors, setErrors] = useState({});
  const [logo, setLogo] = useState(saved.logo || "");
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success' | 'error', text }

  const [depts, setDepts] = useState(saved.depts || INITIAL_DEPTS);
  const [rowMenu, setRowMenu] = useState(null); // id of the department with open menu
  const [sec, setSec] = useState({ twofa: false, sessions: false, basic: false });
  const [toast, setToast] = useState("");

  // hide messages after a few seconds
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  // close the row menu on outside click or Escape
  useEffect(() => {
    const click = (e) => { if (!e.target.closest("[data-row-menu]")) setRowMenu(null); };
    const esc = (e) => e.key === "Escape" && setRowMenu(null);
    document.addEventListener("mousedown", click);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", click);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const persist = (patch) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile: form, logo, depts, ...patch }));
    } catch { /* storage full, ignore */ }
  };

  /* ---- company form ---- */
  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };

  const validate = (v) => {
    const er = {};
    Object.entries(v).forEach(([k, val]) => { if (!val.trim()) er[k] = "This field is required"; });
    if (!er.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) er.email = "Enter a valid email address";
    if (!er.phone && !/^[+()\d\s-]{6,}$/.test(v.phone)) er.phone = "Enter a valid phone number";
    return er;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = validate(form);
    setErrors(er);
    if (Object.keys(er).length) {
      setBanner({ type: "error", text: "Please fix the highlighted fields." });
      return;
    }
    setSaving(true);
    try {
      // TODO: await fetch("/api/company", { method: "PUT", body: JSON.stringify(form) })
      await new Promise((r) => setTimeout(r, 600));
      persist({ profile: form });
      setBanner({ type: "success", text: "Company profile saved successfully." });
    } catch {
      setBanner({ type: "error", text: "Could not save changes. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  /* ---- logo ---- */
  const onLogo = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setBanner({ type: "error", text: "Please choose an image file." });
    if (file.size > 2 * 1024 * 1024) return setBanner({ type: "error", text: "Image must be smaller than 2 MB." });

    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result);
      persist({ logo: reader.result });
      setToast("Logo updated");
    };
    reader.readAsDataURL(file);
  };

  /* ---- departments ---- */
  const updateDepts = (next, msg) => {
    setDepts(next);
    persist({ depts: next });
    setRowMenu(null);
    if (msg) setToast(msg);
  };

  const editManager = (d) => {
    const m = window.prompt(`New manager for ${d.name}:`, d.manager);
    if (m && m.trim()) updateDepts(depts.map((x) => (x.id === d.id ? { ...x, manager: m.trim() } : x)), "Manager updated");
    else setRowMenu(null);
  };

  const toggleDept = (d) =>
    updateDepts(depts.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x)), `${d.name} is now ${d.active ? "inactive" : "active"}`);

  const deleteDept = (d) => {
    if (window.confirm(`Delete ${d.name}?`)) updateDepts(depts.filter((x) => x.id !== d.id), "Department deleted");
    else setRowMenu(null);
  };

  /* ---- security toggles ---- */
  const flip = (key, label) =>
    setSec((s) => {
      const value = !s[key];
      setToast(`${label} ${value ? "enabled" : "disabled"}`);
      return { ...s, [key]: value };
    });

  /* ---- settings menu ---- */
  const goSub = (item) => {
    setActiveSub(item.label);
    if (item.section) {
      document.getElementById(item.section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setToast(`${item.label} is coming soon.`);
    }
  };

  return (
    <div className="px-4 pb-16 pt-6 sm:px-8 lg:px-10">
      {/* header */}
      <p className="text-[15px] text-[#B58A8E]">Settings / Organization Management</p>
      <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#4B101B] sm:text-4xl">Settings &amp; Organization</h1>
      <p className="mt-2 text-[15px]">Manage your company profile, organizational structure, and preferences.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[170px_minmax(0,1fr)] min-[1360px]:grid-cols-[190px_minmax(0,1.12fr)_minmax(0,1fr)]">

        {/* settings menu */}
        <nav
          aria-label="Settings sections"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:row-span-2 lg:mx-0 lg:block lg:overflow-visible lg:px-0 lg:pb-0 min-[1360px]:row-span-1"
        >
          {SUBNAV.map(({ group, items }) => (
            <div key={group} className="contents lg:mb-6 lg:block">
              <h3 className="mb-2 mt-1 hidden px-3.5 text-[13px] font-bold uppercase tracking-wide lg:block">{group}</h3>
              {items.map((item) => {
                const on = activeSub === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => goSub(item)}
                    aria-current={on ? "true" : undefined}
                    className={`relative shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-left text-sm transition lg:block lg:w-full lg:rounded-md lg:border-0 lg:px-3.5 lg:py-[7px] lg:text-[15px] lg:hover:bg-[#4B101B]/5 ${
                      on
                        ? "border-[#4B101B] bg-[#4B101B] font-semibold text-[#F7EFE2] lg:bg-transparent lg:text-[#2a0d12]"
                        : "border-[#E6D6C4] bg-[#F4E9DB]"
                    }`}
                  >
                    {on && <span className="absolute -left-0.5 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded bg-[#D9A5AA] lg:block" />}
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Company Profile */}
        <Card id="company-profile" title="Company Profile">
          <form onSubmit={onSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_140px]">
              <div className="space-y-4">
                <Field id="name" label="Company Name" value={form.name} onChange={onChange} error={errors.name} autoComplete="organization" />
                <Field id="industry" label="Industry" value={form.industry} onChange={onChange} error={errors.industry} />
              </div>

              {/* logo upload */}
              <div className="flex items-center gap-4 max-sm:order-first sm:flex-col sm:gap-1.5">
                <span className="text-[13px] text-[#F3DEDA] sm:self-end">Company Logo</span>
                <div className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-[#F7EFE2] sm:mt-1">
                  {logo
                    ? <img src={logo} alt="Company logo preview" className="h-full w-full object-cover" />
                    : <LogoMark className="h-14 w-14" />}
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[13px] transition hover:bg-white/10">
                  <Upload size={14} /> Upload
                  <input type="file" accept="image/*" onChange={onLogo} className="sr-only" aria-label="Upload company logo" />
                </label>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="email" type="email" label="Email" value={form.email} onChange={onChange} error={errors.email} autoComplete="email" />
              <Field id="phone" type="tel" label="Phone" value={form.phone} onChange={onChange} error={errors.phone} autoComplete="tel" />
            </div>
            <div className="mt-4 space-y-4">
              <Field id="website" label="Website" value={form.website} onChange={onChange} error={errors.website} />
              <Field id="address" label="Address" value={form.address} onChange={onChange} error={errors.address} autoComplete="street-address" />
            </div>

            {banner && (
              <div
                role={banner.type === "error" ? "alert" : "status"}
                className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${banner.type === "error" ? "bg-red-900/60 text-red-100" : "bg-emerald-800/60 text-emerald-100"}`}
              >
                {banner.type === "error" ? <AlertCircle size={16} /> : <Check size={16} />} {banner.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-5 h-11 w-full rounded-lg bg-[#D9A5AA] text-[15px] font-medium text-[#2a0d12] transition hover:bg-[#e6b8bc] disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </Card>

        {/* right column */}
        <div className="flex min-w-0 flex-col gap-6">

          {/* Departments */}
          <Card id="departments-card" title="Departments">
            <div className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,1.25fr)_66px_58px_52px] gap-2 pb-3 text-[13px] text-[#EAD5D3] sm:grid">
              <span>Department</span><span>Manager</span><span>Employees</span><span>Status</span><span className="text-center">Actions</span>
            </div>

            <ul>
              {depts.map((d) => (
                <li
                  key={d.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-0.5 border-t border-white/10 py-3 text-sm sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.25fr)_66px_58px_52px] sm:gap-2 sm:text-[13.5px]"
                >
                  <span className="order-1 font-semibold sm:order-none sm:font-normal">{d.name}</span>

                  <span className="order-4 col-span-3 text-[#EAD5D3] sm:order-none sm:col-span-1 sm:text-inherit">
                    <span className="text-xs opacity-70 sm:hidden">Manager: </span>{d.manager}
                  </span>

                  <span className="order-5 col-span-3 text-[#EAD5D3] sm:order-none sm:col-span-1 sm:text-inherit">
                    <span className="text-xs opacity-70 sm:hidden">Employees: </span>{d.employees}
                  </span>

                  <span className="order-2 sm:order-none">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[12.5px] ${d.active ? "bg-[#2f6b3f] text-[#d9f2df]" : "bg-[#6b3a44] text-[#e8cdd0]"}`}>
                      {d.active ? "Active" : "Inactive"}
                    </span>
                  </span>

                  <span className="relative order-3 flex justify-center sm:order-none" data-row-menu>
                    <button
                      type="button"
                      aria-label={`Actions for ${d.name}`}
                      aria-haspopup="menu"
                      aria-expanded={rowMenu === d.id}
                      onClick={() => setRowMenu(rowMenu === d.id ? null : d.id)}
                      className="rounded-md p-1.5 transition hover:bg-white/15"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {rowMenu === d.id && (
                      <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-[#E6D6C4] bg-[#FFF8F1] p-1.5 text-[#2a0d12] shadow-xl">
                        <button role="menuitem" onClick={() => editManager(d)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#ECD5CA]">
                          <Pencil size={14} /> Edit manager
                        </button>
                        <button role="menuitem" onClick={() => toggleDept(d)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#ECD5CA]">
                          <Power size={14} /> {d.active ? "Mark inactive" : "Mark active"}
                        </button>
                        <button role="menuitem" onClick={() => deleteDept(d)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </span>
                </li>
              ))}

              {depts.length === 0 && (
                <li className="border-t border-white/10 py-4 text-sm text-[#EAD5D3]">No departments left.</li>
              )}
            </ul>
          </Card>

          {/* Security */}
          <Card id="security-card" title="Security Quick Access">
            {[
              ["twofa", "2FA"],
              ["sessions", "Active sessions"],
              ["basic", "Basic notifications"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-2.5 text-[15px]">
                <span>{label}</span>
                <Toggle checked={sec[key]} label={label} onChange={() => flip(key, label)} />
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* message at the bottom */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#4B101B] px-5 py-3 text-sm text-[#F7EFE2] shadow-xl transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
      >
        {toast}
      </div>
    </div>
  );
}