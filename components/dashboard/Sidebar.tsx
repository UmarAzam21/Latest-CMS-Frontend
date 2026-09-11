"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, FileText, LogOut, Lock, UserRoundPlus } from "lucide-react";
import { getNavData, getUserNavData, SERVICE_CATEGORIES, SERVICE_ICONS } from "@/data/dashboard/data";
import { ASSETS } from "@/lib/assets";
import {
  hasModuleAccess,
  isSuperAdmin,
  fetchAndStoreAdminProfile,
  setStoredAdminToken,
  setStoredAdminUser,
} from "@/lib/auth";

type SidebarProps = {
  variant?: "admin" | "user";
};

type Service = {
  value: string;
  label: string;
};

export default function Sidebar({ variant = "admin" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isUser = variant === "user";
  const NAV_ITEMS = isUser ? getUserNavData() : getNavData();

  const [collapsed, setCollapsed] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [services, setServices] = useState<Service[]>([]);
  const [enrollServicesOpen, setEnrollServicesOpen] = useState(true);
  const [openServiceCategory, setOpenServiceCategory] = useState("Registration");
  // Bumped after a fresh profile fetch so the nav list re-renders with real access data.
  const [profileVersion, setProfileVersion] = useState(0);

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    const hasAccess = item.superAdminOnly
      ? isSuperAdmin()
      : item.moduleKey
        ? hasModuleAccess(item.moduleKey, item.access ?? "read")
        : true;

    return hasAccess;
  });

  useEffect(() => {
    if (isUser) {
      fetch("/api/proxy/public/services", {
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Unable to load services");
          return response.json();
        })
        .then((data: unknown) => {
          if (!Array.isArray(data)) return;

          const serviceList = data.filter(
            (item): item is Service =>
              typeof item === "object" &&
              item !== null &&
              "value" in item &&
              "label" in item &&
              typeof item.value === "string" &&
              typeof item.label === "string",
          );

          setServices(serviceList);
        })
        .catch(() => setServices([]));

      return;
    }

    if (isUser) return;

    // Pull the real modules/permissions from the backend (GET /api/admin/me)
    // rather than relying on whatever the login response happened to store.
    // This is what makes hasModuleAccess() actually correct instead of
    // guessing from the role name/label.
    fetchAndStoreAdminProfile().then(() => {
      setProfileVersion((v) => v + 1);
    });
  }, [isUser]);

  const handleNavItemHover = (href: string, event: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width, y: rect.top + rect.height / 2 - 16 });
    setHoveredItem(href);
  };

  const handleNavItemLeave = () => {
    setHoveredItem(null);
  };

  const handleLogout = () => {
    setStoredAdminToken(null);
    setStoredAdminUser(null);
    router.push("/login");
  };

  return (
    <>
      {/* Placeholder — reserves space so page content never shifts */}
      <div className="h-screen w-[76px] shrink-0" />

      <aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-white justify-between text-black border-r border-slate-200 transition-[width,box-shadow] duration-300 ease-in-out overflow-hidden ${collapsed ? "w-[76px] shadow-none" : "w-[225px]"
          }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Header — icon slot is fixed, label fades in beside it */}
          <div className="flex items-center h-[60px] border-b border-slate-200 px-[18px] gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-light text-sm font-semibold text-black">
              <img src={ASSETS()[0].src} alt={ASSETS()[0].alt} className="w-7" />
            </div>

            <span
              className={`text-sm font-semibold tracking-wide text-3 whitespace-nowrap transition-opacity duration-200 ${collapsed ? "opacity-0" : "opacity-100 delay-100"
                }`}
            >
              {isUser ? "User Dashboard" : "Admin CMS"}
            </span>
          </div>

          <nav className="mt-4 min-h-0 min-w-0 flex-1 w-full flex-col items-stretch gap-1 overflow-x-hidden overflow-y-auto px-3" key={profileVersion}>
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    onClick={() => {
                      if (isUser && item.href === "/user-dashboard/enroll-service") {
                        setEnrollServicesOpen(true);
                      }
                    }}
                    className={`relative flex w-full items-center gap-3 rounded-md py-2.5 px-3 text-sm transition-all whitespace-nowrap ${isActive
                        ? "hover:bg-primary-light text-primary"
                        : "text-[#4B5563]"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-1.5 rounded-r-full bg-primary" />
                    )}
                    <Icon size={19} strokeWidth={1.8} className="shrink-0" />
                    <span
                      className={`transition-opacity duration-200 ${collapsed ? "opacity-0" : "opacity-100 delay-100"
                        }`}
                    >
                      {item.label}
                    </span>
                  </Link>

                  {isUser && item.href === "/user-dashboard/enroll-service" && !collapsed && services.length > 0 && (
                    <button
                      type="button"
                      aria-label={enrollServicesOpen ? "Collapse enroll services" : "Expand enroll services"}
                      aria-expanded={enrollServicesOpen}
                      onClick={() => setEnrollServicesOpen((open) => !open)}
                      className="absolute right-2 top-1.5 z-10 rounded-md p-1.5 text-[#4B5563] transition-colors hover:bg-primary-light hover:text-primary"
                    >
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${enrollServicesOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}

                  {isUser && item.href === "/user-dashboard/enroll-service" && enrollServicesOpen && !collapsed && services.length > 0 && (
                    <div className="ml-7 mt-1 min-w-0 space-y-0.5">
                      {SERVICE_CATEGORIES.map((category) => {
                        const categoryServices = services.filter((service) => category.values.includes(service.value as never));
                        if (categoryServices.length === 0) return null;

                        return (
                          <div key={category.label} className="pt-2 first:pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenServiceCategory((current) =>
                                  current === category.label ? "" : category.label,
                                )
                              }
                              className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-[10px] font-semibold uppercase tracking-wide text-[#4B5563] transition-colors hover:bg-primary-light hover:text-primary"
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                                <span className="truncate">{category.label}</span>
                              </span>
                              <ChevronDown
                                size={13}
                                className={`transition-transform duration-200 ${openServiceCategory === category.label ? "rotate-180" : ""
                                  }`}
                              />
                            </button>
                            {openServiceCategory === category.label && (
                              <div className="mt-0.5">
                                {categoryServices.map((service) => (
                                  <Link
                                    key={service.value}
                                    href={`/user-dashboard/enroll-service?service=${encodeURIComponent(service.value)}`}
                                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[#4B5563] transition-colors hover:bg-primary-light hover:text-primary"
                                  >
                                    {(() => {
                                      const ServiceIcon = SERVICE_ICONS[service.value] ?? FileText;
                                      return <ServiceIcon size={14} strokeWidth={1.8} className="shrink-0" />;
                                    })()}
                                    <span className="truncate">{service.label}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0">
          {/* {isUser && (
            <Link
              href="/user-dashboard/enroll-service"
              title={collapsed ? "Become a filer" : undefined}
              className={`group relative mx-3 mb-3 flex overflow-hidden rounded-md bg-primary-light text-primary transition-all duration-300 hover:opacity-90 ${
                collapsed
                  ? "h-[52px] items-center justify-center p-0"
                  : "min-h-[116px] flex-col items-stretch justify-between gap-4 p-4"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/80 bg-white text-primary shadow-sm">
                <UserRoundPlus size={20} strokeWidth={1.9} />
              </span>
              <div
                className={`transition-opacity duration-200 ${
                  collapsed ? "pointer-events-none absolute opacity-0" : "opacity-100 delay-100"
                }`}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-primary/50 whitespace-nowrap">
                  Not a filer yet?
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold underline-offset-2 underline whitespace-nowrap">Become a filer</p>
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="animate-sidebar-arrow"
                  />
                </div>
              </div>
            </Link>
          )} */}

          <div className="border-t border-slate-200 px-3 h-[54px] flex items-center">
            <button
              onClick={handleLogout}
              title={collapsed ? "Log out" : undefined}
              className="flex w-full items-center gap-3 rounded-md px-3 text-sm text-[#4B5563] hover:text-primary transition-colors whitespace-nowrap"
            >
              <LogOut size={19} strokeWidth={1.8} className="text-primary shrink-0" />
              <span
                className={`transition-opacity duration-200 ${collapsed ? "opacity-0" : "opacity-100 delay-100"
                  }`}
              >
                Log out
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}