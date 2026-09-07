"use client";

import Link from "next/link";
import { BellRing, FileEdit, Mail, Pencil, Plus, LucideIcon } from "lucide-react";

interface QuickAction {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

const adminActions: QuickAction[] = [
  {
    title: "Edit Homepage",
    subtitle: "Update hero, sections, content",
    href: "/dashboard/pages/home",
    icon: Pencil,
    iconBg: "#FEF2F2",
    iconColor: "#DC2626",
  },
  {
    title: "View New Messages",
    subtitle: "3 unread enquiries waiting",
    href: "/dashboard/messages",
    icon: Mail,
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
  },
  {
    title: "Add New Page",
    subtitle: "Create a new site page",
    href: "/dashboard/pages/new",
    icon: Plus,
    iconBg: "#ECFDF5",
    iconColor: "#16A34A",
  },
];

const userActions: QuickAction[] = [
  {
    title: "Edit Order Documents",
    subtitle: "Update your order documents",
    href: "/user-dashboard/order",
    icon: FileEdit,
    iconBg: "#c8102e1a",
    iconColor: "#c8102e",
  },
  {
    title: "View Latest Updates",
    subtitle: "See your latest updates",
    href: "/user-dashboard",
    icon: BellRing,
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
  },
  {
    title: "Add New Service",
    subtitle: "Choose another service",
    href: "/user-dashboard/enroll-service",
    icon: Plus,
    iconBg: "#ECFDF5",
    iconColor: "#16A34A",
  },
];

interface QuickActionsProps {
  variant?: "admin" | "user";
}

export default function QuickActions({ variant = "admin" }: QuickActionsProps) {
  const actions = variant === "user" ? userActions : adminActions;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

      {actions.map((action, index) => {
        const Icon = action.icon;

        return (
          <Link
            key={index}
            href={action.href}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#f3b6bf] hover:bg-[#fffafa] hover:shadow-[0_8px_20px_-10px_rgba(200,16,46,0.45)]"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-[#fee2e2]"
              style={{ backgroundColor: action.iconBg }}
            >
              <Icon size={18} strokeWidth={2} style={{ color: action.iconColor }} />
            </div>

            <div>
              <p className="text-[13px] font-semibold text-slate-900">
                {action.title}
              </p>
              <p className="text-[11px] text-slate-500">{action.subtitle}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}