"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Check, ChevronDown, LoaderCircle } from "lucide-react";
import { SERVICE_CATEGORIES, SERVICE_ICONS } from "@/lib/data";

type Service = {
  value: string;
  label: string;
};

export default function EnrollServicePage() {
  const searchParams = useSearchParams();
  const requestedService = searchParams.get("service");
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [openServiceCategory, setOpenServiceCategory] = useState("Registration");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/proxy/public/services", {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Unable to load services (${response.status})`);
        }

        const data: unknown = await response.json();
        const serviceList = Array.isArray(data)
          ? data.filter(
              (item): item is Service =>
                typeof item === "object" &&
                item !== null &&
                "value" in item &&
                "label" in item &&
                typeof item.value === "string" &&
                typeof item.label === "string",
            )
          : [];

        if (active) {
          setServices(serviceList);
          setSelectedService(
            serviceList.some((service) => service.value === requestedService)
              ? requestedService ?? ""
              : serviceList[0]?.value ?? "",
          );
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load services.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, [requestedService]);

  const selected = services.find((service) => service.value === selectedService);

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6 border-b border-slate-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Enroll service</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Choose a service to get started</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Select the service you need and continue with your enrollment.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-5 text-sm text-slate-500">
          <LoaderCircle size={17} className="animate-spin text-primary" />
          Loading available services...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && services.length === 0 && (
        <div className="rounded-md border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          No services are currently available.
        </div>
      )}

      {!loading && !error && services.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-md border border-slate-200 bg-white p-3">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Available services
            </p>
            <nav className="mt-1 space-y-1" aria-label="Available services">
              {SERVICE_CATEGORIES.map((category) => {
                const categoryServices = services.filter((service) => category.values.includes(service.value as never));
                if (categoryServices.length === 0) return null;

                return (
                  <div key={category.label} className="pt-3 first:pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenServiceCategory((current) =>
                          current === category.label ? "" : category.label,
                        )
                      }
                      className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-primary/60 transition-colors hover:bg-primary-light"
                    >
                      {category.label}
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${
                          openServiceCategory === category.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openServiceCategory === category.label && (
                      <div className="mt-0.5">
                        {categoryServices.map((service) => {
                          const isSelected = service.value === selectedService;

                          return (
                            <button
                              key={service.value}
                              type="button"
                              onClick={() => setSelectedService(service.value)}
                              className={`group flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-all ${
                                isSelected
                                  ? "bg-primary-light text-primary"
                                  : "text-slate-600 hover:bg-primary-light/50 hover:text-primary"
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-2.5">
                                {(() => {
                                  const ServiceIcon = SERVICE_ICONS[service.value] ?? BriefcaseBusiness;
                                  return <ServiceIcon size={16} strokeWidth={1.8} className="shrink-0" />;
                                })()}
                                <span className="truncate text-sm font-medium">{service.label}</span>
                              </span>
                              <Check
                                size={16}
                                className={isSelected ? "text-primary" : "text-transparent"}
                                strokeWidth={2}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          <div className="h-fit rounded-md border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected service</p>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">{selected?.label}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Continue with this service to submit your enrollment details and get started.
            </p>
            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
