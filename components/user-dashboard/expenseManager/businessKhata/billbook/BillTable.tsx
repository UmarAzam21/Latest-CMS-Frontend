// dashboard\components\user-dashboard\expenseManager\businessKhata\billbook\BillTable.tsx

"use client";
import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { IBill } from "@/types/businessKhataTy";

export default function BillTable({ bills, onDelete }: { bills: IBill[]; onDelete: (id: string) => void }) {
    const [q, setQ] = useState("");
    const filtered = bills.filter((b) => b.customerName.toLowerCase().includes(q.toLowerCase()));

    return (
        <div className="rounded-brand-16 border border-border-clr bg-white">
            <div className="flex items-center gap-2 border-b border-border-clr p-3">
                <Search size={14} className="text-text-secondary-muter" />
                <input
                    placeholder="Search customer..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full para-small outline-none"
                />
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-clr para-tiny uppercase text-text-secondary-muter">
                        <th className="px-3 py-2 text-left">Customer</th>
                        <th className="px-3 py-2 text-left">Items</th>
                        <th className="px-3 py-2 text-left">Total</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((b) => (
                        <tr key={b.id} className="border-b border-border-clr last:border-0">
                            <td className="px-3 py-2 para-small text-text-dark">
                                {b.customerName}
                                <br />
                                <span className="para-tiny text-text-secondary-muter">
                                    {b.customerContact}
                                </span>
                            </td>
                            <td className="px-3 py-2 para-small">
                                {b.items.length} item(s)
                            </td>
                            <td className="px-3 py-2 para-small font-semibold text-text-dark">
                                Rs.{b.total.toLocaleString("en-PK")}
                            </td>
                            <td className="px-3 py-2 para-small text-text-secondary-muted">
                                {new Date(b.date).toLocaleDateString("en-GB")}
                            </td>
                            <td className="px-3 py-2">
                                <button
                                    onClick={() => onDelete(b.id)}
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
                    No bills yet.
                </p>
            )}
        </div>
    );
}
