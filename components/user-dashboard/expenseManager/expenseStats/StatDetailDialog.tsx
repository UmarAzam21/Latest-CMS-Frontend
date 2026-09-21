// components/user-dashboard/expenseManager/expenseStats/StatDetailDialog.tsx

"use client";
import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { X } from "lucide-react";
import { buildTrend, weekKey } from "@/lib/utils/trend";
import { IExpenseEntry, ICategory, EntryKind } from "@/types/expenseManager";

interface StatDetailDialogProps {
    kind: EntryKind | "all" | null;
    entries: IExpenseEntry[];
    categories: ICategory[];
    onClose: () => void;
}

const TITLES: Record<string, string> = { all: "Total Balance", income: "Total Income", expense: "Total Expenses", debt: "Outstanding Debt" };
const GRAIN_CONFIG = { day: { keyFn: (d: string) => d.slice(0, 10), limit: 14 }, week: { keyFn: weekKey, limit: 8 }, month: { keyFn: (d: string) => d.slice(0, 7), limit: 6 } };

export default function StatDetailDialog({ kind, entries, categories, onClose }: StatDetailDialogProps) {
    const [granularity, setGranularity] = useState<"day" | "week" | "month">("day");
    const open = kind !== null;

    const filtered = useMemo(() => (kind === "all" || !kind ? entries : entries.filter((e) => e.kind === kind)), [entries, kind]);
    const trend = useMemo(() => {
        const { keyFn, limit } = GRAIN_CONFIG[granularity];
        return buildTrend(filtered, keyFn, limit).map((row) =>
            kind === "all" ? { ...row, amount: row.income - row.expense } : { ...row, amount: (row as any)[kind ?? "expense"] }
        );
    }, [filtered, granularity, kind]);

    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const catLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? "Uncategorized";

    return (
        <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-white p-6 shadow-card-hover max-h-[85vh] overflow-y-auto">
                    <div className="mb-5 flex items-center justify-between border-b border-border-clr pb-4">
                        <Dialog.Title className="heading-h4 text-text-dark">{TITLES[kind ?? "all"]}</Dialog.Title>
                        <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary"><X size={18} /></Dialog.Close>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="para-tiny text-text-secondary-muter">{filtered.length} entries</p>
                            <p className="heading-h3 text-text-dark">PKR {total.toLocaleString("en-PK")}</p>
                        </div>
                        <div className="flex gap-1">
                            {(["day", "week", "month"] as const).map((g) => (
                                <button key={g} onClick={() => setGranularity(g)}
                                    className={`rounded-brand-8 px-3 py-1.5 para-tiny font-semibold ${granularity === g ? "bg-primary text-white" : "bg-page-bg text-text-secondary"}`}>
                                    {g[0].toUpperCase() + g.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={trend}>
                            <defs>
                                <linearGradient id="statDialogFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#C8102E" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#C8102E" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                            <Tooltip formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString("en-PK")}`, "Amount"]} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                            <Area type="monotone" dataKey="amount" stroke="#C8102E" strokeWidth={2} fill="url(#statDialogFill)" />
                        </AreaChart>
                    </ResponsiveContainer>

                    <h4 className="heading-h6 mb-2 mt-5 text-text-dark">Recent Entries</h4>
                    <div className="flex flex-col gap-1.5">
                        {filtered.slice(0, 20).map((e) => (
                            <div key={e.id} className="flex items-center justify-between rounded-brand-8 border border-border-clr px-3 py-2">
                                <div><p className="para-small font-medium text-text-dark">{e.subject}</p><p className="para-tiny text-text-secondary-muter">{catLabel(e.categoryId)} · {new Date(e.date).toLocaleDateString("en-GB")}</p></div>
                                <span className={`para-small font-semibold ${e.kind === "income" ? "text-success" : "text-text-dark"}`}>{e.kind === "income" ? "+" : "-"}PKR {e.amount.toLocaleString("en-PK")}</span>
                            </div>
                        ))}
                        {filtered.length === 0 && <p className="para-small text-text-secondary-muted">No entries for this category yet.</p>}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}