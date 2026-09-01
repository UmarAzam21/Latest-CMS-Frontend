"use client";

import { useState, useEffect, useCallback } from "react";
import { getAdminAuthHeaders } from "@/lib/auth";


const MESSAGES_API = "/api/proxy/admin";
const TICKETS_API = "/api/proxy/admin/tickets";
const ADMIN_API = "/api/proxy/admin";

const NAV_ITEMS = [
  { key: "inbox", label: "Inbox", icon: "inbox" },
  { key: "unread", label: "Unread", icon: "mail" },
  { key: "replied", label: "Replied", icon: "reply" },
  { key: "starred", label: "Starred", icon: "star" },
  { key: "archived", label: "Archived", icon: "archive" },
  { key: "close", label: "Close", icon: "trash" },
];

const ICONS = {
  inbox: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V6a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6v2.25m-18 0v9.75A2.25 2.25 0 0 0 5.25 20.25h13.5A2.25 2.25 0 0 0 21 18V8.25m-18 0h5.379a1.5 1.5 0 0 1 1.06.44l.622.62a1.5 1.5 0 0 0 1.06.44h3.758a1.5 1.5 0 0 0 1.06-.44l.622-.62a1.5 1.5 0 0 1 1.06-.44H21" />
  ),
  mail: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  ),
  reply: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 6 6v3" />
  ),
  star: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.48 3.499 2.031 4.116a.562.562 0 0 0 .424.308l4.54.66c.46.067.643.632.31.955l-3.286 3.203a.563.563 0 0 0-.162.498l.776 4.522c.078.457-.402.806-.813.59l-4.06-2.135a.563.563 0 0 0-.524 0l-4.06 2.135c-.41.216-.89-.133-.813-.59l.776-4.522a.562.562 0 0 0-.162-.498l-3.286-3.203c-.334-.323-.15-.888.31-.955l4.54-.66a.563.563 0 0 0 .424-.308l2.031-4.116c.206-.417.79-.417.996 0Z" />
  ),
  archive: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375C2.754 3.75 2.25 4.254 2.25 4.875v1.5c0 .621.504 1.125 1.125 1.125Z" />
  ),
  trash: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  ),
  starOutline: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.48 3.499 2.031 4.116a.562.562 0 0 0 .424.308l4.54.66c.46.067.643.632.31.955l-3.286 3.203a.563.563 0 0 0-.162.498l.776 4.522c.078.457-.402.806-.813.59l-4.06-2.135a.563.563 0 0 0-.524 0l-4.06 2.135c-.41.216-.89-.133-.813-.59l.776-4.522a.562.562 0 0 0-.162-.498l-3.286-3.203c-.334-.323-.15-.888.31-.955l4.54-.66a.563.563 0 0 0 .424-.308l2.031-4.116c.206-.417.79-.417.996 0Z" />
  ),
  archiveOutline: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6.5 3.75h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  ),
  trashOutline: (
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  ),
  phone: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.187.417l-.97 1.293a11.263 11.263 0 0 1-6.238-6.238l1.293-.97a1.125 1.125 0 0 0 .417-1.187L8.964 3.102a1.125 1.125 0 0 0-1.091-.852H6.5A2.25 2.25 0 0 0 2.25 6.75Z" />
  ),
  calendar: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008Z" />
  ),
  send: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.77 59.77 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.874L5.999 12Zm0 0h7.5" />
  ),
  refresh: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  ),
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      {ICONS[name as keyof typeof ICONS]}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers: adapt whatever shape the backend returns into what the UI expects.
// Adjust the field fallbacks below once you confirm the real response shape.
// ---------------------------------------------------------------------------
const PALETTE = ["#c8102e", "#1f2937"];

type TicketStatus = "new" | "replied" | "closed" | string;

export interface Ticket {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  preview: string;
  date: string;
  listDate: string;
  status: TicketStatus;
  unread: boolean;
  replied: boolean;
  closed: boolean;
  starred: boolean;
  tag: string;
  initials: string;
  color: string;
  replyTo: string;
  messages?: Array<{ id: number | string; direction: string; sender_email: string; body: string; created_at?: string }>;
}

// Shape of a raw ticket object as it might come back from the API.
// Loosened intentionally since the real backend schema isn't confirmed yet.
type RawTicket = Record<string, any>;

function initialsFrom(name = ""): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

function colorFrom(seed = ""): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function formatDate(value?: string | number | Date): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function normalizeTicket(raw: RawTicket): Ticket {
  const id = raw.id ?? raw.ticket_id ?? raw._id;
  const customer = raw.customer ?? raw.user ?? {};
  const name =
    raw.name ??
    raw.full_name ??
    raw.sender_name ??
    customer?.name ??
    customer?.email ??
    "Unknown";
  const email = raw.email ?? raw.sender_email ?? customer?.email ?? "";
  const phone = raw.phone ?? raw.phone_number ?? customer?.phone ?? "";
  const subject = raw.subject ?? raw.title ?? "(no subject)";

  const rawMessages = Array.isArray(raw.messages)
    ? raw.messages
    : Array.isArray(raw.message_history)
      ? raw.message_history
      : [];

  const lastMsg = rawMessages.length ? rawMessages[rawMessages.length - 1] : null;
  const body = raw.message ?? raw.body ?? raw.content ?? lastMsg?.body ?? "";
  const status = String(raw.status ?? (raw.replied ? "replied" : "new")).toLowerCase();
  const createdAt = raw.created_at ?? raw.createdAt ?? raw.date ?? raw.timestamp ?? raw.updated_at;
  const starred = Boolean(raw.starred ?? raw.is_starred ?? false);

  const messagesList = rawMessages
    .map((m: any) => ({
      id: m.id ?? m.message_id,
      direction: String(m.direction ?? m.message_direction ?? "inbound").toLowerCase(),
      sender_email: m.sender_email ?? m.email ?? customer?.email ?? "",
      body: m.body ?? m.message ?? m.content ?? "",
      created_at: m.created_at ?? m.createdAt ?? m.timestamp,
    }))
    .sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());

  return {
    id,
    name,
    email,
    phone,
    subject,
    body,
    preview: body ? `${body.slice(0, 48)}${body.length > 48 ? "..." : ""}` : "",
    date: formatDate(createdAt),
    listDate: formatDate(createdAt),
    status,
    unread: status === "new" || status === "open",
    replied: status === "replied" || status === "answered",
    closed: status === "closed" || status === "resolved",
    starred,
    tag: status === "replied" || status === "answered" ? "REPLIED" : status === "closed" || status === "resolved" ? "CLOSED" : "NEW",
    initials: initialsFrom(name),
    color: colorFrom(email || name),
    replyTo: raw.reply_to ?? raw.replyTo ?? email,
    messages: messagesList,
  };
}

async function apiRequestFrom(baseUrl: string, path: string, options: RequestInit = {}): Promise<any> {
  const authHeaders = getAdminAuthHeaders();
  const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;
  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: "application/json",
      ...(isFormDataBody ? {} : { "Content-Type": "application/json" }),
      ...authHeaders,
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text ? text.slice(0, 200) : "Request failed";
    throw new Error(`${res.status}|${msg}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

async function apiRequest(path: string, options: RequestInit = {}): Promise<any> {
  return apiRequestFrom(MESSAGES_API, path, options);
}

function getAccessMessage(action: string, err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const lower = raw.toLowerCase();
  const statusMatch = raw.match(/\b(400|401|403|404|409|422|429|500|502|503|504)\b/);
  const status = statusMatch ? Number(statusMatch[1]) : null;

  if (status === 401 || lower.includes("unauthorized") || lower.includes("authentication credentials were not provided")) {
    return `You don't have access to ${action}. Please contact your admin.`;
  }

  if (status === 403 || lower.includes("forbidden")) {
    return `You don't have access to ${action}. Please contact your admin.`;
  }

  if (status === 400 || status === 404 || status === 409 || status === 422 || status === 429) {
    return `The request for ${action} was rejected by the server. Please check the message data and try again.`;
  }

  if (status && status >= 500) {
    return `The server is currently unable to ${action}. Please try again in a moment.`;
  }

  return `Something went wrong while trying to ${action}. Please try again.`;
}

export default function MessageInbox() {
  const [activeNav, setActiveNav] = useState("inbox");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [query, setQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [messages, setMessages] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  // Load ticket list — GET /admin
  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("");
      const rawList = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.tickets)
            ? data.tickets
            : Array.isArray(data?.results)
              ? data.results
              : data && typeof data === "object"
                ? [data]
                : [];

      const normalized = rawList.map(normalizeTicket);
      setMessages(normalized);
      if (normalized.length && selectedId === null) {
        setSelectedId(normalized[0].id);
      }
    } catch (err) {
      setError(getAccessMessage("view messages", err));
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = messages.filter((m) => {
    if (activeNav === "close") return m.closed;
    if (activeNav === "archived") return false; // no archive endpoint yet
    if (m.closed) return false; // closed tickets only show under "Close"
    if (activeNav === "unread" && !m.unread) return false;
    if (activeNav === "replied" && !m.replied) return false;
    if (activeNav === "starred" && !m.starred) return false;
    if (query && !`${m.name} ${m.subject}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const navCounts: Record<string, number> = {
    inbox: messages.filter((m) => !m.closed).length,
    unread: messages.filter((m) => m.unread).length,
    replied: messages.filter((m) => m.replied).length,
    starred: messages.filter((m) => m.starred).length,
    archived: 0,
    close: messages.filter((m) => m.closed).length,
  };

  // Select a message — GET /admin/messages/{message_id}
  const selectMessage = async (id: string | number) => {
    setSelectedId(id);
    setReplyText("");
    setDetailLoading(true);
    try {
      const detail = await apiRequest(`/${id}`);
      const normalizedDetail = normalizeTicket(detail.ticket ?? detail);
      const replyTo = normalizedDetail.replyTo;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, ...normalizedDetail, unread: false, replyTo } : m
        )
      );
    } catch {
      // The inbox list already contains the ticket payload. Do not show a misleading
      // access-denied message when the backend detail endpoint is unavailable or the
      // ticket detail fetch is not required for the list to render correctly.
      setError(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Starring has no backend endpoint yet — kept local-only.
  const toggleStar = (id: string | number) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)));
  };

  // Send reply — POST /admin/tickets/{ticket_id}/reply
  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    setSending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("body", replyText);
      await apiRequestFrom(TICKETS_API, `/${selected.id}/reply`, {
        method: "POST",
        body: formData,
      });
      const updatedTicket = await apiRequestFrom(TICKETS_API, `/${selected.id}`);
      const normalizedTicket = normalizeTicket(updatedTicket.ticket ?? updatedTicket);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selected.id ? { ...m, ...normalizedTicket, unread: false } : m
        )
      );
      setReplyText("");
    } catch (err) {
      setError(getAccessMessage("send messages", err));
    } finally {
      setSending(false);
    }
  };

  // Close ticket — POST /admin/tickets/{ticket_id}/close
  const closeTicket = async (id: string | number) => {
    setError(null);
    try {
      await apiRequestFrom(TICKETS_API, `/${id}/close`, { method: "POST" });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, closed: true, tag: "CLOSED", status: "closed" } : m))
      );
    } catch (err) {
      setError(getAccessMessage("close this message", err));
    }
  };

  // Pull new mail in — POST /admin/process-imap, then refresh the list
  const refreshFromImap = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await apiRequestFrom(ADMIN_API, "/process-imap", { method: "POST" });
      await loadTickets();
    } catch (err) {
      setError(getAccessMessage("refresh messages", err));
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-[#111111] border border-slate-200">
      {/* Nav column */}
      <div className="flex w-48 shrink-0 flex-col border-r border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-[12px] font-bold tracking-wide">MESSAGES</span>
          <button
            onClick={refreshFromImap}
            disabled={refreshing}
            title="Check for new mail"
            className="text-slate-400 transition-colors duration-150 hover:text-[#c8102e] disabled:opacity-40"
          >
            <Icon name="refresh" className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.key;
            const count = navCounts[item.key];
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[12px] font-semibold transition-all duration-150 ${
                  isActive ? "bg-[#FEF2F2] text-[#c8102e]" : "text-[#374151] hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </span>
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold transition-colors duration-150 ${
                      isActive ? "bg-[#c8102e] text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Message list column */}
      <div className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-3">
          <div className="relative">
            <Icon
              name="mail"
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
            />
          </div>
        </div>

        {error && (
          <div className="border-b border-red-100 bg-red-50 px-3 py-2 text-[11px] text-red-600">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-slate-50">
          {loading && (
            <div className="p-6 text-center text-[12px] text-slate-400">Loading messages...</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-center text-[12px] text-slate-400">No messages here.</div>
          )}
          {!loading &&
            filtered.map((m) => {
              const isSelected = selectedId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => selectMessage(m.id)}
                  className={`relative flex w-full flex-col items-start gap-1 border-b border-slate-100 px-3 py-3 text-left transition-all duration-150 ${
                    isSelected ? "bg-white" : "hover:bg-[#FEF2F2]"
                  }`}
                >
                  {isSelected && <span className="absolute left-0 top-0 h-full w-0.5 bg-[#c8102e]" />}
                  <div className="flex w-full items-start gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate uppercase text-[12px] ${m.unread ? "font-bold" : "font-semibold"} text-[#111827]`}>
                          {m.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-slate-400">{m.listDate}</span>
                      </div>
                      <div className="truncate text-[12px] font-semibold text-[#374151] uppercase">{m.subject}</div>
                      <div className="truncate text-[12px] text-slate-500">{m.preview}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {m.tag && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                              m.tag === "NEW"
                                ? "bg-[#FEF2F2] text-[#c8102e]"
                                : m.tag === "REPLIED"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {m.tag}
                          </span>
                        )}
                        {m.starred && (
                          <svg viewBox="0 0 24 24" fill="#f59e0b" className="h-3 w-3">
                            <path d="m11.48 3.499 2.031 4.116a.562.562 0 0 0 .424.308l4.54.66c.46.067.643.632.31.955l-3.286 3.203a.563.563 0 0 0-.162.498l.776 4.522c.078.457-.402.806-.813.59l-4.06-2.135a.563.563 0 0 0-.524 0l-4.06 2.135c-.41.216-.89-.133-.813-.59l.776-4.522a.562.562 0 0 0-.162-.498l-3.286-3.203c-.334-.323-.15-.888.31-.955l4.54-.66a.563.563 0 0 0 .424-.308l2.031-4.116c.206-.417.79-.417.996 0Z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Detail + reply column */}
      <div className="flex flex-1 flex-col bg-white">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center bg-slate-50 text-[12px] text-slate-400">
            {loading ? "Loading..." : "Select a message to view it"}
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-[12px] uppercase font-bold text-[#111827]">{selected.subject}</h2>
                <p className="mt-0.5 text-[12px] text-slate-400">{selected.date}</p>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <button
                  onClick={() => toggleStar(selected.id)}
                  className="transition-colors duration-150 hover:text-amber-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={selected.starred ? "#f59e0b" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`h-4 w-4 ${selected.starred ? "text-amber-500" : ""}`}
                  >
                    {ICONS.starOutline}
                  </svg>
                </button>
                <button className="transition-colors duration-150 hover:text-[#c8102e]">
                  <Icon name="archiveOutline" className="h-4 w-4" />
                </button>
                <button
                  onClick={() => closeTicket(selected.id)}
                  disabled={selected.closed}
                  title="Close ticket"
                  className="transition-colors duration-150 hover:text-[#c8102e] disabled:opacity-40"
                >
                  <Icon name="trashOutline" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {detailLoading ? (
                <div className="text-[12px] text-slate-400">Loading ticket...</div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                      style={{ backgroundColor: selected.color }}
                    >
                      {selected.initials}
                    </div>
                    <div>
                      <div className="text-[12px] font-bold uppercase text-[#111827]">{selected.name}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Icon name="mail" className="h-3 w-3" />
                          {selected.email}
                        </span>
                        {selected.phone && (
                          <span className="flex items-center gap-1">
                            <Icon name="phone" className="h-3 w-3" />
                            {selected.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Icon name="calendar" className="h-3 w-3" />
                          {selected.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <div className="max-h-[360px] overflow-y-auto px-1 py-2">
                      {selected.messages && selected.messages.length ? (
                        selected.messages.map((msg) => {
                          const isOutbound = String(msg.direction).toLowerCase() === "outbound";
                          return (
                            <div
                              key={msg.id}
                              className={`mb-2 flex ${isOutbound ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[78%] break-words rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                                  isOutbound ? "bg-[#c8102e] text-white" : "bg-white border border-slate-200 text-[#374151]"
                                }`}
                              >
                                <div className="whitespace-pre-wrap">{msg.body}</div>
                                <div className="mt-1 text-[11px] text-slate-400 text-right">{formatDate(msg.created_at)}</div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed text-[#374151]">
                          {selected.body}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white px-6 py-4">
              <p className="mb-2 text-[12px] text-slate-500">
                Replying to:{" "}
                <span className="font-semibold text-[#111827]">{selected.replyTo || selected.email}</span>
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[12px] outline-none transition-all duration-150 focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 hover:border-slate-300"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim() || sending}
                  className="flex items-center gap-1.5 rounded-lg bg-[#c8102e] px-4 py-2 text-[12px] font-bold text-white transition-all duration-150 hover:bg-[#a80d26] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="send" className="h-3.5 w-3.5" />
                  {sending ? "Sending..." : "Send Reply"}
                </button>
                <button
                  onClick={() => setReplyText("")}
                  className="text-[12px] font-semibold text-slate-500 transition-colors duration-150 hover:text-[#111827]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}