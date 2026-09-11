"use client";
import { useEffect, useState } from "react";
import {
  ActivitySquare,
  AlertTriangle,
  Bell,
  Globe,
  Mail,
  Pencil,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import { getCurrentAdminUser } from "@/lib/auth";
import { DashboardStats } from "@/hooks/useDashboardStats";

interface RecentActivityProps {
  stats?: DashboardStats | null;
  loading?: boolean;
}

type RecentNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  href: string;
  type?: string;
};

type NotificationApiItem = {
  id?: string | number;
  notification_id?: string | number;
  _id?: string | number;
  uuid?: string | number;
  key?: string | number;
  resource_type?: string;
  type?: string;
  title?: string;
  subject?: string;
  message?: string;
  body?: string;
  created_at?: string;
  createdAt?: string;
  time?: string;
  url?: string;
  href?: string;
  link?: string;
  action_url?: string;
  route?: string;
};

function getNotificationList(data: unknown): NotificationApiItem[] {
  if (Array.isArray(data)) return data as NotificationApiItem[];

  if (data && typeof data === "object") {
    const payload = data as Record<string, unknown>;
    const nestedData = payload.data;

    if (Array.isArray(nestedData)) return nestedData as NotificationApiItem[];
    if (nestedData && typeof nestedData === "object" && Array.isArray((nestedData as Record<string, unknown>).notifications)) {
      return (nestedData as Record<string, unknown>).notifications as NotificationApiItem[];
    }

    for (const key of ["notifications", "results", "items"]) {
      if (Array.isArray(payload[key])) return payload[key] as NotificationApiItem[];
    }
  }

  return [];
}

function getNotificationHref(item: NotificationApiItem): string {
  if (item.url || item.href || item.link || item.action_url || item.route) {
    return item.url || item.href || item.link || item.action_url || item.route || "/dashboard";
  }

  switch ((item.resource_type || item.type || "").toLowerCase()) {
    case "content":
    case "page":
      return "/dashboard/content";
    case "media":
      return "/dashboard/media";
    case "user":
    case "users":
      return "/dashboard/users";
    case "message":
    case "messages":
      return "/dashboard/messages";
    default:
      return "/dashboard";
  }
}

function formatNotificationTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function getActivityVisual(item: RecentNotification) {
  const context = `${item.type || ""} ${item.title} ${item.message}`.toLowerCase();

  if (context.includes("profile") || context.includes("avatar") || context.includes("user")) {
    return { icon: User, iconBg: "#EFF6FF", iconColor: "#2563EB" };
  }

  if (context.includes("upload") || context.includes("media") || context.includes("image") || context.includes("logo")) {
    return { icon: Upload, iconBg: "#ECFDF5", iconColor: "#16A34A" };
  }

  if (context.includes("publish") || context.includes("page")) {
    return { icon: Globe, iconBg: "#F5F3FF", iconColor: "#7C3AED" };
  }

  if (context.includes("message") || context.includes("mail")) {
    return { icon: Mail, iconBg: "#FEF2F2", iconColor: "#DC2626" };
  }

  if (context.includes("add") || context.includes("new") || context.includes("section")) {
    return { icon: Plus, iconBg: "#EFF6FF", iconColor: "#2563EB" };
  }

  if (context.includes("update") || context.includes("edit") || context.includes("headline")) {
    return { icon: Pencil, iconBg: "#FEF2F2", iconColor: "#DC2626" };
  }

  if (context.includes("search") || context.includes("meta") || context.includes("seo")) {
    return { icon: Search, iconBg: "#FFFBEB", iconColor: "#D97706" };
  }

  if (context.includes("compliance")) {
    return { icon: ShieldCheck, iconBg: "#ECFDF5", iconColor: "#16A34A" };
  }

  if (context.includes("tax")) {
    return { icon: Receipt, iconBg: "#FFFBEB", iconColor: "#D97706" };
  }

  if (context.includes("alert")) {
    return { icon: AlertTriangle, iconBg: "#FEF2F2", iconColor: "#DC2626" };
  }

  return { icon: item.type === "activity" ? ActivitySquare : Bell, iconBg: "#F1F5F9", iconColor: "#64748B" };
}

export default function RecentActivity({ loading }: RecentActivityProps) {
  const [notifications, setNotifications] = useState<RecentNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(() => Boolean(getCurrentAdminUser()?.email));

  useEffect(() => {
    let mounted = true;
    const userId = getCurrentAdminUser()?.email?.trim() || "";

    if (!userId) {
      return () => {
        mounted = false;
      };
    }

    async function loadNotifications() {
      try {
        const response = await fetch(`/api/proxy/notifications?user_id=${encodeURIComponent(userId)}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Unable to load notifications");

        const items = getNotificationList(await response.json());
        if (mounted) {
          setNotifications(items.slice(0, 5).map((item, index) => ({
            id: String(item.id ?? item.notification_id ?? item._id ?? item.uuid ?? item.key ?? index),
            title: item.title || item.subject || item.message || "Notification",
            message: item.message || item.body || "",
            time: formatNotificationTime(String(item.created_at || item.createdAt || item.time || "Just now")),
            href: getNotificationHref(item),
            type: item.resource_type || item.type,
          })));
        }
      } catch {
        if (mounted) setNotifications([]);
      } finally {
        if (mounted) setNotificationsLoading(false);
      }
    }

    void loadNotifications();
    return () => {
      mounted = false;
    };
  }, []);

  const activityList = notifications;
  const showLoading = loading || notificationsLoading;

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm ">
      <h3 className="text-base font-bold text-slate-900 text-[13px]">Recent Activity</h3>

      {showLoading ? (
        <div className="mt-5 text-center text-sm text-slate-500">Loading...</div>
      ) : (
        <div className="mt-5 flex flex-col">
          {activityList.map((item, index) => {
            const { icon: Icon, iconBg, iconColor } = getActivityVisual(item);
            const isLast = index === activityList.length - 1;

            return (
              <a
                href={item.href}
                key={index}
                className={`flex items-start gap-3 py-2 ${!isLast ? "border-b border-slate-100" : ""
                  }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: iconBg }}
                >
                  <Icon size={16} strokeWidth={2} style={{ color: iconColor }} />
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {[item.message, item.time].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </a>
            );
          })}
          {!activityList.length && <p className="py-5 text-center text-sm text-slate-500">No recent notifications</p>}
        </div>
      )}
    </div>
  );
}