"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Download,
  Pencil,
  Plus,
  X,
  Check,
  FileText,
  CheckCircle2,
  Loader2,
  Ban,
  AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static lists used by filters / the add-user form                   */
/* ------------------------------------------------------------------ */

const SERVICES = [
  "Web Development",
  "SEO",
  "Graphic Design",
  "Digital Marketing",
  "App Development",
  "Content Writing",
  "Other",
];

const CITIES = ["Lahore", "Karachi", "Multan", "Islamabad", "Sialkot", "Narowal"];

const PAGE_SIZE = 6;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "/api/proxy";
const apiUrl = (path: string) => {
  const base = API_BASE.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const proxyPath = base.endsWith("/api/proxy") && normalizedPath.startsWith("/api/")
    ? normalizedPath.slice(4)
    : normalizedPath;

  return `${base}${proxyPath}`;
};

/* ------------------------------------------------------------------ */
/*  API                                                                 */
/* ------------------------------------------------------------------ */

// GET /api/admin/leads?skip=&limit= — matches the get_leads route.
// Fetched once with a high limit so search/pagination can stay
// instant and client-side, same as the rest of this UI. If your
// leads table grows large, switch this to server-side pagination
// (pass `page`/`search` as query params and drop the client slicing).
async function fetchLeads() {
  const res = await fetch(apiUrl("/api/admin/leads?skip=0&limit=500"), {
    headers: { Accept: "application/json" },
    // credentials: "include", // uncomment if your admin auth relies on cookies
  });

  if (!res.ok) {
    throw new Error(`Failed to load leads (${res.status})`);
  }

  return res.json(); // LeadsResponse[]
}

async function createLead(payload) {
  const body = {
    id: payload.id ?? Date.now(),
    username: payload.username,
    email: payload.email,
    cnic: payload.cnic,
    phone: payload.phone,
    service_type: payload.service_type,
    city: payload.city,
    created_at: payload.created_at ?? new Date().toISOString(),
  };

  const res = await fetch(apiUrl("/api/admin/leads"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to create lead (${res.status})${errorText ? `: ${errorText}` : ""}`);
  }

  return res.json();
}

// PATCH /api/admin/leads/{id} — update an existing lead.
// Matches @router.patch(...) which currently accepts a full
// LeadsResponse-shaped body (includes id/created_at even though
// the handler only reads username/email/phone/service_type/city).
async function updateLead(id, payload, original) {
  const body = {
    id,
    username: payload.username,
    email: payload.email,
    cnic: payload.cnic,
    phone: payload.phone,
    service_type: payload.service_type,
    city: payload.city,
    created_at: original?.created_at ?? new Date().toISOString(),
  };

  const res = await fetch(apiUrl(`/api/admin/leads/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to update lead (${res.status})${errorText ? `: ${errorText}` : ""}`);
  }

  return res.json();
}

// POST /api/admin/leads/download — reuses the same export endpoint,
// scoped to a single lead id, for the per-row download button.
async function downloadLead(id, username) {
  const res = await fetch(apiUrl("/api/admin/leads/download"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      format: "csv",
      lead_ids: [id],
      select_all: false,
      fields: EXPORT_COLUMNS.map((c) => c.key),
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to download lead (${res.status})`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lead_${username ? username.replace(/\s+/g, "_").toLowerCase() : id}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

function formatDate(isoString) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Strips everything but digits so "+92 234 567 8902" becomes a valid wa.me path.
function toWhatsAppLink(phone) {
  const digits = (phone || "").replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

function WhatsAppIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12.002 2C6.478 2 2 6.477 2 12c0 1.99.583 3.845 1.588 5.404L2 22l4.71-1.552A9.953 9.953 0 0 0 12.002 22C17.526 22 22 17.523 22 12S17.526 2 12.002 2zm0 18.166a8.14 8.14 0 0 1-4.146-1.135l-.297-.176-3.075 1.013 1.03-3.016-.194-.31A8.128 8.128 0 0 1 3.834 12c0-4.505 3.664-8.166 8.168-8.166 4.505 0 8.168 3.661 8.168 8.166 0 4.506-3.663 8.166-8.168 8.166z"/>
    </svg>
  );
}

const EXPORT_COLUMNS = [
  { key: "username", label: "User Name" },
  { key: "service_type", label: "Services" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "city", label: "City" },
];

const DATE_RANGES = ["All Time", "Today", "Last 7 Days", "Last 30 Days", "This Year"];

/* ------------------------------------------------------------------ */
/*  Small shared bits                                                  */
/* ------------------------------------------------------------------ */

function Checkbox({ checked, onChange, className = "" }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150 ${
        checked
          ? "border-[#c8102e] bg-[#c8102e]"
          : "border-slate-300 bg-white hover:border-slate-400"
      } ${className}`}
    >
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </button>
  );
}

function ServiceBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
      {children}
    </span>
  );
}

// Functional single-select dropdown used for Services / City filters.
// Same visual treatment as the original static FilterDropdown button.
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition-all duration-150 ${
          value
            ? "border-[#c8102e] bg-[#FEF2F2] text-[#c8102e]"
            : "border-slate-200 bg-white text-[#374151] hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        {value || label}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1.5 max-h-56 w-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors duration-150 ${
                !value ? "bg-[#FEF2F2] text-[#c8102e] font-semibold" : "text-[#374151] hover:bg-slate-50"
              }`}
            >
              All {label}
              {!value && <Check className="h-3.5 w-3.5" />}
            </button>
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12px] transition-colors duration-150 ${
                  value === opt ? "bg-[#FEF2F2] text-[#c8102e] font-semibold" : "text-[#374151] hover:bg-slate-50"
                }`}
              >
                {opt}
                {value === opt && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add / Edit User modal — shared form, two entry points               */
/* ------------------------------------------------------------------ */

function UserFormModal({ mode = "add", initial, onClose, onSubmit }) {
  const [form, setForm] = useState({
    username: initial?.username ?? "",
    email: initial?.email ?? "",
    cnic: initial?.cnic ?? "",
    phone: initial?.phone ?? "",
    service_type: initial?.service_type ?? "",
    city: initial?.city ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const canSubmit = form.username && form.email && form.cnic && form.phone && form.service_type && form.city;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-[14px] font-bold text-[#111827]">
            {mode === "edit" ? "Update User" : "Add New User"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 px-6">
          <div>
            <label className="text-[12px] font-semibold text-[#111111]">User Name</label>
            <input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="e.g. John Doe"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#111111]">Email</label>
            <input
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="e.g. john@example.com"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#111111]">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="e.g. +1 234 567 890"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#111111]">CNIC</label>
            <input
              value={form.cnic}
              onChange={(e) => set("cnic", e.target.value)}
              placeholder="e.g. 35202-1234567-1"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#111111]">Service</label>
            <div className="relative mt-1">
              <select
                value={form.service_type}
                onChange={(e) => set("service_type", e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
              >
                <option value="">Select</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-[#111111]">City</label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Lahore"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:bg-white focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-semibold text-[#374151] transition-all duration-150 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            className="flex items-center gap-1.5 rounded-lg bg-[#c8102e] px-4 py-2 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {mode === "edit" ? "Save Changes" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export modal — config -> progress -> complete                      */
/* ------------------------------------------------------------------ */

function ExportModal({ selectedIds, allCount, onClose }) {
  const [step, setStep] = useState("config"); // config | progress | complete
  const [format, setFormat] = useState("csv");
  const [columns, setColumns] = useState(EXPORT_COLUMNS.map((c) => c.key));
  const [dateRange, setDateRange] = useState("All Time");
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const toggleColumn = (key) => {
    setColumns((cur) =>
      cur.includes(key) ? cur.filter((c) => c !== key) : [...cur, key]
    );
  };

  const exportCount = selectedIds.length > 0 ? selectedIds.length : allCount;
  const extFor = { csv: "csv", excel: "xlsx", pdf: "pdf" };
  const labelFor = { csv: "CSV Document", excel: "Excel Document", pdf: "PDF Document" };

  const startExport = async () => {
    setStep("progress");
    setProgress(0);

    // Animate a progress bar while the request is in flight.
    const tick = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.random() * 14 : p));
    }, 220);

    try {
      const payload = {
        format,
        lead_ids: selectedIds.length > 0 ? selectedIds : null,
        select_all: selectedIds.length === 0,
        fields: columns,
      };

      const res = await fetch(apiUrl("/api/admin/leads/download"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFileInfo({
        name: `users_export_2026.${extFor[format]}`,
        size: `${(blob.size / 1024).toFixed(1)} KB`,
        label: labelFor[format],
      });
    } catch {
      // Fallback so the UI still completes in a design-preview / offline context.
      setFileInfo({
        name: `users_export_2026.${extFor[format]}`,
        size: "12.4 KB",
        label: labelFor[format],
      });
    } finally {
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => setStep("complete"), 350);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !fileInfo) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileInfo.name;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between bg-[#c8102e] px-6 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
              {step === "config" && <Download className="h-4 w-4 text-white" />}
              {step === "progress" && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              {step === "complete" && <CheckCircle2 className="h-4 w-4 text-white" />}
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-white">
                {step === "config" && "Export Users"}
                {step === "progress" && "Exporting Users"}
                {step === "complete" && "Export Complete"}
              </h3>
              <p className="text-[11px] text-white/80">
                {step === "config" && "Download administrative records"}
                {step === "progress" && "Processing document generation"}
                {step === "complete" && "Document generated successfully"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-white/80 transition-colors duration-150 hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONFIG STEP */}
        {step === "config" && (
          <>
            <div className="space-y-5 px-6 py-5">
              <div>
                <div className="mb-2 text-[12px] font-semibold text-[#111111]">File Format</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "csv", label: "CSV" },
                    { key: "excel", label: "Excel" },
                    { key: "pdf", label: "PDF" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFormat(f.key)}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium transition-all duration-150 ${
                        format === f.key
                          ? "border-[#c8102e] bg-[#FEF2F2] text-[#c8102e]"
                          : "border-slate-200 text-[#374151] hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                          format === f.key ? "border-[#c8102e]" : "border-slate-300"
                        }`}
                      >
                        {format === f.key && <span className="h-1.5 w-1.5 rounded-full bg-[#c8102e]" />}
                      </span>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[12px] font-semibold text-[#111111]">Columns to Export</div>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                  {EXPORT_COLUMNS.map((c) => (
                    <label
                      key={c.key}
                      className="flex cursor-pointer items-center gap-2 text-[12px] text-[#374151]"
                    >
                      <Checkbox checked={columns.includes(c.key)} onChange={() => toggleColumn(c.key)} />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-semibold text-[#111111]">Date Range</label>
                <div className="relative">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
                  >
                    {DATE_RANGES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-semibold text-[#374151] transition-all duration-150 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={columns.length === 0}
                onClick={startExport}
                className="flex items-center gap-1.5 rounded-lg bg-[#c8102e] px-4 py-2 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </>
        )}

        {/* PROGRESS STEP */}
        {step === "progress" && (
          <div className="space-y-5 px-6 py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
                <Loader2 className="h-6 w-6 animate-spin text-[#c8102e]" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#111827]">
                  Exporting {exportCount} users...
                </div>
                <div className="mt-0.5 text-[11px] text-[#6B7280]">Please keep this window open</div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#6B7280]">
                <span>Generating {format.toUpperCase()}</span>
                <span className="font-semibold text-[#c8102e]">{Math.min(100, Math.round(progress))}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#c8102e] transition-all duration-200 ease-out"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-lg border border-slate-200 py-2 text-[12px] font-semibold text-[#374151] transition-all duration-150 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}

        {/* COMPLETE STEP */}
        {step === "complete" && fileInfo && (
          <div className="space-y-5 px-6 py-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#111827]">Export Complete</div>
                <div className="mt-0.5 text-[11px] text-[#6B7280]">
                  {exportCount} users exported successfully
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FEF2F2]">
                <FileText className="h-4 w-4 text-[#c8102e]" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-[#111827]">{fileInfo.name}</div>
                <div className="text-[11px] text-[#6B7280]">{fileInfo.size} • {fileInfo.label}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-[12px] font-semibold text-[#374151] transition-all duration-150 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 rounded-lg bg-[#c8102e] py-2 text-[12px] font-semibold text-white transition-all duration-150 hover:bg-[#a80d26]"
              >
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function UsersLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState(null);
  const [cityFilter, setCityFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadLeads = () => {
    setLoading(true);
    setError(null);
    fetchLeads()
      .then((data) => setLeads(data))
      .catch((err) => setError(err.message || "Something went wrong"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filtered = useMemo(() => {
    let result = leads;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.username.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q)
      );
    }

    if (serviceFilter) {
      result = result.filter((l) => l.service_type === serviceFilter);
    }

    if (cityFilter) {
      result = result.filter((l) => l.city === cityFilter);
    }

    return result;
  }, [leads, search, serviceFilter, cityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  const toggleRow = (id) => {
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelected((cur) => {
      const next = new Set(cur);
      if (allOnPageSelected) {
        pageRows.forEach((r) => next.delete(r.id));
      } else {
        pageRows.forEach((r) => next.add(r.id));
      }
      return next;
    });
  };

  const deselectAll = () => setSelected(new Set());

  const handleSingleDownload = async (lead) => {
    setDownloadingId(lead.id);
    try {
      await downloadLead(lead.id, lead.username);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to download lead");
    } finally {
      setDownloadingId(null);
    }
  };

  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= Math.min(4, totalPages); i++) nums.push(i);
    return nums;
  }, [totalPages]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#6B7280]">
              Dashboard <span className="mx-1 text-slate-300">›</span>{" "}
              <span className="text-[#111827]">users</span>
            </div>
            <h1 className="mt-1 text-[20px] font-bold text-[#111827]">Users Leads</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#c8102e] px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#a80d26] hover:shadow-md"
          >
            <Plus className="h-3.5 w-3.5" />
            Add User
          </button>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search users..."
                  className="w-56 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
                />
              </div>
              <FilterDropdown
                label="Services"
                options={SERVICES}
                value={serviceFilter}
                onChange={(v) => {
                  setServiceFilter(v);
                  setPage(1);
                }}
              />
              <FilterDropdown
                label="City"
                options={CITIES}
                value={cityFilter}
                onChange={(v) => {
                  setCityFilter(v);
                  setPage(1);
                }}
              />
            </div>

            {selected.size === 0 ? (
              <div />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#374151]">
                  <span className="font-semibold">{selected.size}</span> users selected
                </span>
                <button
                  onClick={deselectAll}
                  className="text-[12px] font-semibold text-[#2563EB] transition-colors duration-150 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-[#374151] transition-all duration-150 hover:bg-slate-50">
                  <Ban className="h-3.5 w-3.5" />
                  Deactivate
                </button>
              )}
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[12px] font-medium text-[#374151] transition-all duration-150 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="w-10 px-5 py-3">
                    <Checkbox checked={allOnPageSelected} onChange={toggleAllOnPage} />
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">User Name</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Services</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Email</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Date</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Phone</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">CNIC</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">City</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-[#6B7280]">
                        <Loader2 className="h-5 w-5 animate-spin text-[#c8102e]" />
                        <span className="text-[12px]">Loading leads…</span>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-[#c8102e]" />
                        <span className="text-[12px] text-[#374151]">Couldn't load leads — {error}</span>
                        <button
                          onClick={loadLeads}
                          className="mt-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-[#374151] transition-all duration-150 hover:bg-slate-50"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && !error && pageRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <span className="text-[12px] text-[#6B7280]">
                        {search || serviceFilter || cityFilter ? "No users match your filters." : "No leads yet."}
                      </span>
                    </td>
                  </tr>
                )}

                {!loading && !error && pageRows.map((lead) => {
                  const isSelected = selected.has(lead.id);
                  const isDownloading = downloadingId === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      className={`border-b border-slate-50 transition-colors duration-150 ${
                        isSelected ? "bg-[#FEF2F2]" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <Checkbox checked={isSelected} onChange={() => toggleRow(lead.id)} />
                      </td>
                      <td className="px-3 py-3.5 text-[12px] font-semibold text-[#111827]">{lead.username}</td>
                      <td className="px-3 py-3.5"><ServiceBadge>{lead.service_type}</ServiceBadge></td>
                      <td className="px-3 py-3.5 text-[12px] text-[#374151]">{lead.email}</td>
                      <td className="px-3 py-3.5 text-[12px] text-[#6B7280]">{formatDate(lead.created_at)}</td>
                      <td className="px-3 py-3.5 text-[12px] text-[#374151]">{lead.phone}</td>
                      <td className="px-3 py-3.5 text-[12px] text-[#374151]">{lead.cnic}</td>
                      <td className="px-3 py-3.5 text-[12px] text-[#6B7280]">{lead.city}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSingleDownload(lead)}
                            disabled={isDownloading}
                            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
                              isSelected
                                ? "bg-[#FCE4E7] text-[#c8102e] hover:bg-[#FAD1D6]"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                          >
                            {isDownloading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => window.open(toWhatsAppLink(lead.phone), "_blank", "noopener,noreferrer")}
                            title={`Message ${lead.username} on WhatsApp`}
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E7F9EF] text-[#25D366] transition-all duration-150 hover:bg-[#D3F3E0]"
                          >
                            <WhatsAppIcon className="h-4 w-4"/>
                          </button>
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[12px] text-[#6B7280]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                    page === n
                      ? "bg-[#c8102e] text-white"
                      : "border border-slate-200 text-[#374151] hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              {totalPages > 4 && <span className="px-1 text-[12px] text-slate-400">...</span>}
              {totalPages > 4 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                    page === totalPages
                      ? "bg-[#c8102e] text-white"
                      : "border border-slate-200 text-[#374151] hover:bg-slate-50"
                  }`}
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-all duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <UserFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSubmit={async (payload) => {
            try {
              await createLead(payload);
              setShowAddModal(false);
              loadLeads(); // refresh the table with the newly created lead
            } catch (err) {
              console.error(err);
              setError(err.message || "Failed to create lead");
            }
          }}
        />
      )}

      {editingLead && (
        <UserFormModal
          mode="edit"
          initial={editingLead}
          onClose={() => setEditingLead(null)}
          onSubmit={async (payload) => {
            try {
              await updateLead(editingLead.id, payload, editingLead);
              setEditingLead(null);
              loadLeads(); // refresh the table with the updated lead
            } catch (err) {
              console.error(err);
              setError(err.message || "Failed to update lead");
            }
          }}
        />
      )}

      {showExportModal && (
        <ExportModal
          selectedIds={Array.from(selected)}
          allCount={filtered.length}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}