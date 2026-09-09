"use client";

import { useCallback, useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from "react";
import { Bell, X, Trash2, CheckCheck, FileText, ShieldCheck, Receipt, AlertTriangle, RefreshCw } from "lucide-react";


const ICONS = {
  filing: FileText,
  compliance: ShieldCheck,
  tax: Receipt,
  alert: AlertTriangle,
} as const;

type NotificationType = keyof typeof ICONS;

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const seedNotifications: Notification[] = [];

type NotificationModalProps = {
  userId?: string;
};

type NotificationResponsePayload = Record<string, unknown> | unknown[] | null;

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
  read?: boolean;
  is_read?: boolean;
  read_at?: string | null;
};

function normalizeNotifications(data: NotificationResponsePayload): NotificationApiItem[] | null {
  if (Array.isArray(data)) return data as NotificationApiItem[];

  const payload = data as Record<string, unknown> | null;
  if (Array.isArray(payload?.data)) return payload.data as NotificationApiItem[];
  if (Array.isArray(payload?.["data"] && (payload as Record<string, unknown>).data && (payload.data as Record<string, unknown>)?.notifications)) {
    return ((payload as Record<string, unknown>).data as Record<string, unknown>).notifications as NotificationApiItem[];
  }
  if (Array.isArray(payload?.notifications)) return payload.notifications as NotificationApiItem[];
  if (Array.isArray(payload?.results)) return payload.results as NotificationApiItem[];
  if (Array.isArray(payload?.items)) return payload.items as NotificationApiItem[];
  return null;
}

export default function NotificationModal({ userId }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLoadedAt, setLastLoadedAt] = useState<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const safeUserId = userId?.trim() && userId.trim() !== "admin" ? userId.trim() : "";
  const unreadCount = notifications.filter((n) => !n.read).length;

  const loadNotifications = useCallback(async () => {
    if (!safeUserId) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const query = `?user_id=${encodeURIComponent(safeUserId)}`;
      const [listRes, unreadRes] = await Promise.all([
        fetch(`/api/proxy/notifications${query}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
        fetch(`/api/proxy/notifications/unread-count${query}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (!listRes.ok) {
        throw new Error(`Failed to load notifications: ${listRes.status}`);
      }

      const listContentType = listRes.headers.get("content-type") || "";
      if (!listContentType.includes("application/json")) {
        const responseText = await listRes.text();
        throw new Error(`Notifications returned a non-JSON response (${listRes.status}): ${responseText.slice(0, 120)}`);
      }

      const data = (await listRes.json()) as NotificationResponsePayload;
      const list = normalizeNotifications(data);

      if (!list) {
        throw new Error("Unexpected notifications response");
      }

      const nextNotifications = list.map((item: NotificationApiItem) => ({
        id: String(item.id ?? item.notification_id ?? item._id ?? item.uuid ?? item.key ?? "unknown"),
        type: (item.resource_type as NotificationType) || item.type || "alert",
        title: item.title || item.subject || item.message || "Notification",
        message: item.message || item.body || "",
        time: item.created_at || item.createdAt || item.time || "just now",
        read: Boolean(item.read ?? item.is_read ?? item.read_at ?? false),
      }));

      if (unreadRes.ok) {
        const unreadContentType = unreadRes.headers.get("content-type") || "";
        if (!unreadContentType.includes("application/json")) {
          setNotifications(nextNotifications);
          return;
        }

        const unreadPayload = (await unreadRes.json()) as Record<string, unknown> | null;
        const unreadRecord = unreadPayload && typeof unreadPayload === "object" ? unreadPayload : null;
        const unreadData =
          unreadRecord && unreadRecord.data && typeof unreadRecord.data === "object"
            ? (unreadRecord.data as Record<string, unknown>)
            : null;

        const unreadTotal = Number(
          unreadRecord?.count ??
            unreadRecord?.unread_count ??
            unreadData?.count ??
            unreadData?.unread_count ??
            0
        );

        if (Number.isFinite(unreadTotal)) {
          const unreadIds = new Set(
            nextNotifications
              .filter((n) => !n.read)
              .slice(0, Math.max(unreadTotal, 0))
              .map((n) => n.id)
          );

          setNotifications(
            nextNotifications.map((notification) => ({
              ...notification,
              read: !unreadIds.has(notification.id) || notification.read,
            }))
          );
        } else {
          setNotifications(nextNotifications);
        }
      } else {
        setNotifications(nextNotifications);
      }

      setLastLoadedAt(Date.now());
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  }, [safeUserId]);

  useEffect(() => {
    if (!open || !safeUserId) {
      return;
    }

    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, safeUserId, loadNotifications]);

  useEffect(() => {
    if (!safeUserId) {
      return;
    }

    const handleFocus = () => {
      void loadNotifications();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [safeUserId, loadNotifications]);

  useEffect(() => {
    function handleClick(e: globalThis.MouseEvent) {
      const target = e.target as Node | null;
      if (
        panelRef.current &&
        target &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    if (!safeUserId) {
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE || process.env.BACKEND_URL;
    if (!apiBase) {
      console.warn("Notifications websocket unavailable: API base URL is not configured");
      return;
    }
    const wsOrigin = apiBase.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
    const wsUrl = `${wsOrigin}/api/notifications/ws/${encodeURIComponent(safeUserId)}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.info("Notifications websocket connected", wsUrl);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as Record<string, unknown> | unknown[];
        const shouldRefresh =
          payload && typeof payload === "object" && (
            ("type" in payload && payload.type === "notification") ||
            ("event" in payload && payload.event === "notification") ||
            ("action" in payload && payload.action === "refresh") ||
            ("unread_count" in payload && payload.unread_count !== undefined)
          ) || Array.isArray(payload);

        if (shouldRefresh) {
          void loadNotifications();
        }
      } catch {
        void loadNotifications();
      }
    };

    socket.onerror = () => {
      console.warn("Notifications websocket unavailable for", safeUserId);
    };

    socket.onclose = () => {
      socketRef.current = null;
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [safeUserId, loadNotifications]);

  const markAsRead = async (id: string) => {
    if (!safeUserId) {
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    try {
      await fetch(`/api/proxy/notifications/read?user_id=${encodeURIComponent(safeUserId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const markAllAsRead = async () => {
    if (!safeUserId || notifications.length === 0) {
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await fetch(`/api/proxy/notifications/read?user_id=${encodeURIComponent(safeUserId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: notifications.map((n) => n.id) }),
      });
      await loadNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

  const deleteNotification = async (id: string, e: ReactMouseEvent<HTMLButtonElement>) => {
    if (!safeUserId) {
      return;
    }

    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
      await fetch(`/api/proxy/notifications/${encodeURIComponent(id)}?user_id=${encodeURIComponent(safeUserId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      await loadNotifications();
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        {/* Trigger */}
        <button
          ref={triggerRef}
          onClick={() => setOpen((v) => !v)}
          aria-label="Notifications"
          className="relative flex h-11 w-11 items-center justify-center transition hover:border-neutral-300 "
        >
          <Bell className="h-5 w-5 text-neutral-700" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white ring-2 ring-neutral-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Panel */}
        {open && (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 z-50 mt-2 w-[380px] h-[400px] origin-top-right overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl animate-in"
            style={{ animation: "fadeSlide 160ms ease-out" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-neutral-900">
                  Notifications
                </h2>
                <p className="text-xs text-neutral-500">
                  {loading
                    ? "Loading..."
                    : error
                      ? error
                      : lastLoadedAt
                        ? `Updated ${new Date(lastLoadedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                        : unreadCount > 0
                          ? `${unreadCount} unread`
                          : "You're all caught up"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => void loadNotifications()}
                  disabled={loading}
                  aria-label="Refresh notifications"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className="h-4 w-4" strokeWidth={2} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <CheckCheck className="h-3.5 w-3.5" strokeWidth={2} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close notifications"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
                    <Bell className="h-5 w-5 text-rose-400" strokeWidth={1.6} />
                  </div>
                  <p className="text-sm font-medium text-neutral-700">
                    Nothing here yet
                  </p>
                  <p className="text-xs text-neutral-400">
                    New updates on your filings will show up here.
                  </p>
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => {
                    const Icon = ICONS[n.type as NotificationType] ?? FileText;
                    return (
                      <li
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`group relative flex cursor-pointer gap-3 border-b border-neutral-50 px-5 py-3.5 transition hover:bg-neutral-50 ${
                          n.read ? "bg-white" : "bg-rose-50/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            n.read ? "bg-neutral-100" : "bg-rose-100"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              n.read ? "text-neutral-500" : "text-rose-600"
                            }`}
                            strokeWidth={1.8}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-[13.5px] leading-snug ${
                                n.read
                                  ? "font-medium text-neutral-600"
                                  : "font-semibold text-neutral-900"
                              }`}
                            >
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-600" />
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-neutral-500">
                            {n.message}
                          </p>
                          <p className="mt-1.5 text-[11px] text-neutral-400">
                            {n.time}
                          </p>
                        </div>

                        <button
                          onClick={(e) => deleteNotification(n.id, e)}
                          aria-label={`Delete notification: ${n.title}`}
                          className="absolute right-3 top-8 flex h-7 w-7 items-center justify-center rounded-lg text-neutral-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-neutral-100 px-5 py-2.5 text-center">
                <button className="text-xs font-medium text-neutral-500 transition hover:text-rose-600">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}