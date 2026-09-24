// dashboard\components\user-dashboard\expenseManager\businessKhata\billbook\MakeBillDialog.tsx

"use client";
import { useState } from "react";
import { Trash2, Search, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { ICashEntry } from "@/types/businessKhataTy";
import { cn } from "@/lib/cn";

export default function CashTable({ cash, onDelete }: { cash: ICashEntry[]; onDelete: (id: string) => void }) {
    const [q, setQ] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const filtered = cash.filter((c) => {
        const mq = !q || c.category.toLowerCase().includes(q.toLowerCase()) || (c.note ?? "").toLowerCase().includes(q.toLowerCase());
        return mq && (!from || c.date >= from) && (!to || c.date <= to);
    });

    return (
        <div className="rounded-brand-16 border border-border-clr bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b border-border-clr p-3">
                <Search size={14} className="text-text-secondary-muter" />
                <input
                    placeholder="Search..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="para-small outline-none"
                />
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="ml-auto rounded-brand-8 border border-border-clr px-2 py-1 para-tiny"
                />
                <span className="para-tiny text-text-secondary-muter">to</span>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="rounded-brand-8 border border-border-clr px-2 py-1 para-tiny"
                />
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-clr para-tiny uppercase text-text-secondary-muter">
                        <th className="px-3 py-2 text-left">Direction</th>
                        <th className="px-3 py-2 text-left">Amount</th>
                        <th className="px-3 py-2 text-left">Category</th>
                        <th className="px-3 py-2 text-left">Method</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Note</th>
                        <th className="px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((c) => (
                        <tr key={c.id} className="border-b border-border-clr last:border-0">
                            <td className="px-3 py-2">
                                <span className={cn(
                                    "flex w-fit items-center gap-1 rounded-full px-2 py-0.5 para-tiny font-semibold",
                                    c.direction === "in" ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                                )}>
                                    {c.direction === "in" ? <ArrowDownCircle size={11} /> : <ArrowUpCircle size={11} />}
                                    {c.direction === "in" ? "In" : "Out"}
                                </span>
                            </td>
                            <td className="px-3 py-2 para-small font-semibold text-text-dark">
                                Rs.{c.amount.toLocaleString("en-PK")}
                            </td>
                            <td className="px-3 py-2 para-small capitalize text-text-secondary">
                                {c.category}
                            </td>
                            <td className="px-3 py-2 para-small capitalize text-text-secondary-muter">
                                {c.paymentMethod}
                            </td>
                            <td className="px-3 py-2 para-small text-text-secondary-muted">
                                {new Date(c.date).toLocaleDateString("en-GB")}
                            </td>
                            <td className="px-3 py-2 para-tiny text-text-secondary-muter">
                                {c.note ?? "—"}
                            </td>
                            <td className="px-3 py-2">
                                <button
                                    onClick={() => onDelete(c.id)}
                                    className="text-text-secondary-muter hover:text-danger"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {filtered.length === 0 && (
                <p className="p-6 text-center para-small text-text-secondary-muted">
                    No cash entries yet.
                </p>
            )}
        </div>
    );
}
