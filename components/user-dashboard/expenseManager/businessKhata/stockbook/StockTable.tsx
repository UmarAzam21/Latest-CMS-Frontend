// dashboard\components\user-dashboard\expenseManager\businessKhata\stockbook\StockTable.tsx

"use client";
import { useState } from "react";
import { Trash2, Search } from "lucide-react";
import { IStockItem } from "@/types/businessKhataTy";

export default function StockTable({ stock, onDelete }: { stock: IStockItem[]; onDelete: (id: string) => void }) {
    const [q, setQ] = useState("");
    const filtered = stock.filter((s) => s.itemName.toLowerCase().includes(q.toLowerCase()));

    return (
        <div className="rounded-brand-16 border border-border-clr bg-white">
            <div className="flex items-center gap-2 border-b border-border-clr p-3">
                <Search size={14} className="text-text-secondary-muter" />
                <input
                    placeholder="Search items..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full para-small outline-none"
                />
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-clr para-tiny uppercase text-text-secondary-muter">
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-left">Rates</th>
                        <th className="px-3 py-2 text-left">Qty</th>
                        <th className="px-3 py-2 text-left">Supplier</th>
                        <th className="px-3 py-2"></th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((s) => (
                        <tr key={s.id} className="border-b border-border-clr last:border-0">
                            <td className="px-3 py-2 para-small text-text-dark">
                                {s.itemName}
                            </td>
                            <td className="px-3 py-2 para-small text-text-secondary">
                                Rs.{s.buyingRate} → Rs.{s.sellingRate}
                            </td>
                            <td className="px-3 py-2 para-small">
                                {s.quantity} {s.unit}
                            </td>
                            <td className="px-3 py-2 para-small text-text-secondary-muter">
                                {s.supplierName}
                            </td>
                            <td className="px-3 py-2">
                                <button
                                    onClick={() => onDelete(s.id)}
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
                    No items yet.
                </p>
            )}
        </div>
    );
}
