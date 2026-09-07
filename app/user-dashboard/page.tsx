"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, LoaderCircle } from "lucide-react";
import QuickAccess from "@/components/dashboard/QuickAccess";
import { SERVICE_ICONS } from "@/lib/data";

type Service = {
  value: string;
  label: string;
};

function getServiceAccent(value: string) {
  if (["business_ntn", "simple_ntn_registration", "business_registration", "company_registration", "filer_registration", "gst_registration"].includes(value)) {
    return { bg: "#EFF6FF", color: "#2563EB" };
  }

  if (["tax_return_filing", "fbr_notices", "wealth_statement", "dts_registration"].includes(value)) {
    return { bg: "#FFFBEB", color: "#D97706" };
  }

  if (["imp_exp_license_psw", "trade_mark_registration", "pec_registration", "chamber_membership", "pseb", "dnfbp"].includes(value)) {
    return { bg: "#F5F3FF", color: "#7C3AED" };
  }

  return { bg: "#F1F5F9", color: "#64748B" };
}

export default function DashboardOverviewPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/proxy/public/services", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) throw new Error(`Unable to load services (${response.status})`);

        const data: unknown = await response.json();
        const serviceList = Array.isArray(data)
          ? data.filter(
            (item): item is Service =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as Record<string, unknown>).value === "string" &&
              typeof (item as Record<string, unknown>).label === "string",
          )
          : [];

        if (active) setServices(serviceList);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load services.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadServices();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="h-[65px] border-b border-slate-200">
        <span className="text-xs text-[#4B5563]">Hi,</span>
        <h1 className="text-lg font-bold">
          Welcome Back, <span className="text-primary">User</span>
        </h1>
      </div>

      {error && (
        <div className="my-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-3 mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Services</h2>
        <a
          href="/user-dashboard/enroll-service"
          className="text-xs font-semibold text-[#c8102e] transition-opacity hover:opacity-75"
        >
          View all
        </a>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <LoaderCircle size={17} className="animate-spin text-primary" />
          Loading available services...
        </div>
      ) : services.length === 0 && !error ? (
        <div className="rounded-md border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          No services are currently available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="isolate grid min-w-[760px] grid-cols-5 gap-3 pt-1">
            {services.slice(0, 15).map((service) => {
              const Icon = SERVICE_ICONS[service.value] ?? BriefcaseBusiness;
              const accent = getServiceAccent(service.value);

              return (
                <a
                  key={service.value}
                  href={`/user-dashboard/enroll-service?service=${encodeURIComponent(service.value)}`}
                  className="group relative z-0 flex min-h-[106px] min-w-0 flex-col items-center justify-between rounded-lg border border-slate-300 bg-white p-3 text-center transition-all duration-200 hover:z-10 hover:-translate-y-0.5 hover:border-[#f3b6bf] hover:bg-[#fffafa] hover:shadow-[0_6px_12px_-8px_rgba(200,16,46,0.45)]"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors"
                    style={{ backgroundColor: accent.bg, color: accent.color }}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 text-sm font-semibold leading-5 text-slate-900 transition-colors group-hover:text-[#c8102e]">
                    {service.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}


      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Draft Service Forms</h2>
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => {
              const Icon = SERVICE_ICONS[service.value] ?? BriefcaseBusiness;
              const accent = getServiceAccent(service.value);

              return (
                <a
                key={service.value}
                href={`/user-dashboard/enroll-service?service=${encodeURIComponent(service.value)}`}
                className="group rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#f3b6bf] hover:bg-[#fffafa] hover:shadow-[0_6px_12px_-8px_rgba(200,16,46,0.45)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: accent.bg, color: accent.color }}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                    </div>
                    <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-[#c8102e]">
                      {service.label}
                    </p>
                  </div>
                  <ArrowRight size={15} className="shrink-0" />
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-500">Draft</span>
                  <span className="font-semibold text-slate-500 transition-colors ">0% completed</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 transition-colors ">
                  <div className="h-full w-0 rounded-full bg-[#c8102e]" />
                </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No draft service forms available.
          </div>
        )}
      </section>

      <div className="mt-6">

        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-sm font-bold">Quick Access</h1>
        </div>
        <QuickAccess variant="user" />
      </div>

    </div>
  );
}