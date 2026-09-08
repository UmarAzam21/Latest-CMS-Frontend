import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Layers,
  MessageSquareText,
  Phone,
  ReceiptText,
  Scale,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { SERVICE_CATEGORIES, SERVICE_ICONS } from "@/lib/data";

const serviceLabels: Record<string, string> = {
  business_ntn: "Business NTN",
  simple_ntn_registration: "Simple NTN Registration",
  business_registration: "Business Registration",
  company_registration: "Company Registration",
  filer_registration: "Filer Registration",
  gst_registration: "GST Registration",
  tax_return_filing: "Tax Return Filing",
  fbr_notices: "FBR Notices",
  wealth_statement: "Wealth Statement",
  dts_registration: "DTS Registration",
  imp_exp_license_psw: "Import / Export License",
  trade_mark_registration: "Trademark Registration",
  pec_registration: "PEC Registration",
  chamber_membership: "Chamber Membership",
  pseb: "PSEB Registration",
  dnfbp: "DNFBP Registration",
};

const modules = [
  {
    name: "Legal Consultancy",
    caption: "Advisory workspace",
    description: "Manage consultations, bookings, and important legal documents.",
    status: "2 upcoming",
    details: ["Bookings", "Calendar", "Documents"],
    icon: Scale,
    accent: "#C8102E",
    soft: "#FDEEF0",
  },
  {
    name: "Expense Management",
    caption: "Finance workspace",
    description: "Track expenses and income with a clearer view of what needs attention.",
    status: "Up to date",
    details: ["BeFiler app", "Expenses", "Deductions"],
    icon: ReceiptText,
    accent: "#B77908",
    soft: "#FFF6E5",
  },
];



// small helper kept local so the stats array above reads cleanly
function ClipboardIcon() {
  return CheckCircle2;
}

const filingSteps = [
  { label: "Personal details confirmed", done: true },
  { label: "Income sources added", done: true },
  { label: "Supporting documents uploaded", done: false },
  { label: "Deductions reviewed", done: false },
  { label: "Return submitted", done: false },
];


const quickActions = [
  { label: "Upload a document", icon: UploadCloud, href: "/user-dashboard/enroll-service?service=tax_return_filing" },
  { label: "Book a consultation", icon: Phone, href: "/user-dashboard/enroll-service?service=filer_registration" },
  { label: "Message support", icon: MessageSquareText, href: "/user-dashboard/settings" },
];

export default function UserDashboardPage() {
  const completedSteps = filingSteps.filter((s) => s.done).length;

  return (
    <div className="mx-auto max-w-7xl pb-10">


      {/* Filing hero */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px] sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C8102E]">
              <ShieldCheck size={15} /> Tax filing 2026
            </div>
            <h2 className="mt-2.5 max-w-xl text-xl font-semibold tracking-tight text-slate-900">
              Build your return with confidence.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Complete your filing step by step, keep documents in one place, and see what still needs your attention.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/user-dashboard/enroll-service?service=tax_return_filing"
                className="flex items-center gap-2 rounded-lg bg-[#C8102E] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#A80D26]"
              >
                Continue filing <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/user-dashboard/enroll-service?service=tax_return_filing"
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <UploadCloud size={15} /> Add documents
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Filing readiness</span>
              <span className="text-lg font-semibold text-slate-900">42%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[42%] rounded-full bg-[#C8102E]" />
            </div>
            <ul className="mt-4 space-y-2.5">
              {filingSteps.map((step) => (
                <li key={step.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle2
                    size={14}
                    className={step.done ? "text-emerald-500" : "text-slate-300"}
                    strokeWidth={2}
                  />
                  <span className={step.done ? "text-slate-500 line-through" : "text-slate-700"}>{step.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-slate-400">
              {completedSteps} of {filingSteps.length} steps complete
            </p>
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          {/* Workspaces */}
          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">Your workspaces</h2>
              <p className="mt-1 text-xs text-slate-500">Start with one of your active modules.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <article
                    key={module.name}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: module.soft, color: module.accent }}
                        >
                          <Icon size={20} strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-400">{module.caption}</p>
                          <h3 className="text-base font-semibold text-slate-900">{module.name}</h3>
                        </div>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                        style={{ backgroundColor: module.soft, color: module.accent }}
                      >
                        {module.status}
                      </span>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-slate-500">{module.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {module.details.map((detail) => (
                        <span key={detail} className="rounded-md bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
                          {detail}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                      <Link
                        href="/user-dashboard/enroll-service"
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: module.accent }}
                      >
                        Open workspace <ArrowUpRight size={14} />
                      </Link>
                      <Link
                        href="/user-dashboard/settings"
                        aria-label={`Update ${module.name}`}
                        className="flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Services directory */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Available services</h2>
                <p className="mt-1 text-xs text-slate-500">Everything you can register or file from your account.</p>
              </div>
              <Link
                href="/user-dashboard/enroll-service"
                className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_CATEGORIES.map((category) => (
                <div key={category.label} className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-xs font-semibold text-slate-700">{category.label}</h3>
                  <div className="mt-2 space-y-0.5">
                    {category.values.map((value) => {
                      const Icon = SERVICE_ICONS[value] || FileText;
                      return (
                        <Link
                          key={value}
                          href={`/user-dashboard/enroll-service?service=${value}`}
                          className="flex items-center gap-2 rounded-md px-2 py-2 text-xs text-slate-600 transition-colors hover:bg-primary-light hover:text-primary"
                        >
                          <Icon size={15} strokeWidth={1.8} className="shrink-0" />
                          <span className="truncate">{serviceLabels[value]}</span>
                          <ArrowUpRight size={12} className="ml-auto shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
            <div className="mt-3 space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    <Icon size={16} strokeWidth={1.8} className="text-slate-400" />
                    {action.label}
                    <ArrowRight size={13} className="ml-auto text-slate-300" />
                  </Link>
                );
              })}
            </div>
          </section>

        </aside>
      </div>
    </div>
  );
}