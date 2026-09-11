
"use client";

import Link from "next/link";
import { FileEdit, Plus, LucideIcon } from "lucide-react";

interface DraftService {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  progress: number;
}

const draftServices: DraftService[] = [
  {
    title: "Tax Filing",
    subtitle: "Complete your tax filing form",
    href: "/user-dashboard/order/tax-filing",
    icon: FileEdit,
    iconBg: "#c8102e1a",
    iconColor: "#c8102e",
    progress: 75,
  },
  {
    title: "Business Registration",
    subtitle: "Complete your business registration",
    href: "/user-dashboard/order/business-registration",
    icon: FileEdit,
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    progress: 45,
  },
  {
    title: "NTN Registration",
    subtitle: "Complete your NTN registration",
    href: "/user-dashboard/order/ntn",
    icon: FileEdit,
    iconBg: "#ECFDF5",
    iconColor: "#16A34A",
    progress: 90,
  },
];

interface QuickActionsProps {
  variant?: "admin" | "user";
}

export default function QuickActions({
  variant = "user",
}: QuickActionsProps) {
  // Keep admin version if required
  if (variant === "admin") {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {draftServices.map((service, index) => {
        const Icon = service.icon;

        return (
          <Link
            key={index}
            href={service.href}
            className="group rounded-xl border border-slate-200 bg-white p-4  transition-all hover:border-[#f3b6bf] hover:bg-[#fffafa] hover:shadow-[0_8px_20px_-10px_rgba(200,16,46,0.45)]"
          >
            {/* Top Content */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: service.iconBg }}
              >
                <Icon
                  size={18}
                  strokeWidth={2}
                  style={{ color: service.iconColor }}
                />
              </div>

              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-900">
                  {service.title}
                </p>

                <p className="truncate text-[11px] text-slate-500">
                  {service.subtitle}
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  Form completion
                </span>

                <span className="text-[11px] font-semibold text-[#c8102e]">
                  {service.progress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#c8102e] transition-all duration-500"
                  style={{
                    width: `${service.progress}%`,
                  }}
                />
              </div>

              {/* Status */}
              <p className="mt-1.5 text-[10px] text-slate-400">
                {service.progress === 100
                  ? "Form completed"
                  : `${100 - service.progress}% remaining`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
