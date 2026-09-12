"use client";

import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { IExpenseEntry, ICategory, SortField, SortDirection } from "@/types/expenseManager";
import { cn } from "@/lib/cn";

interface ExpensesTableProps {
    entries: IExpenseEntry[];
    categories: ICategory[];
    sortField: SortField;
    sortDirection: SortDirection;
    onSort: (field: SortField) => void;
    onDelete: (id: string) => void;
    onEdit: (entry: IExpenseEntry) => void;
}

const kindBadgeStyles: Record<IExpenseEntry["kind"], string> = {
    expense: "bg-danger-bg text-danger",
    income: "bg-success-bg text-success",
    debt: "bg-warning-bg text-warning",
};

function formatCurrency(v: number) {
    return `PKR ${v.toLocaleString("en-PK")}`;
}

export default function ExpensesTable({
    entries, categories, sortField, sortDirection, onSort, onDelete, onEdit,
}: ExpensesTableProps) {
    const getCategoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? "Uncategorized";

    if (entries.length === 0) {
        return (
            <div className="rounded-brand-16 border border-dashed border-border-clr-dark bg-card-bg-clr p-10 text-center">
                <p className="para-small text-text-secondary-muted">
                    No entries yet. Add your first expense, income, or debt to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-brand-16 border border-border-clr bg-card-bg-clr">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-clr para-tiny uppercase text-text-secondary-muter">
                        <SortableHeader label="Subject" field="subject" active={sortField} direction={sortDirection} onSort={onSort} />
                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                        <th className="px-4 py-3 text-left font-semibold">Category</th>
                        <SortableHeader label="Date" field="date" active={sortField} direction={sortDirection} onSort={onSort} />
                        <SortableHeader label="Amount" field="amount" active={sortField} direction={sortDirection} onSort={onSort} align="right" />
                        <th className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) => (
                        <tr key={entry.id} className="border-b border-border-clr last:border-0 hover:bg-page-bg">
                            <td className="px-4 py-3 para-small text-text-dark">{entry.subject}</td>
                            <td className="px-4 py-3">
                                <span className={cn("rounded-full px-2 py-0.5 para-tiny font-semibold capitalize", kindBadgeStyles[entry.kind])}>
                                    {entry.kind}
                                </span>
                            </td>
                            <td className="px-4 py-3 para-small text-text-secondary">{getCategoryLabel(entry.categoryId)}</td>
                            <td className="px-4 py-3 para-small text-text-secondary-muted">
                                {new Date(entry.date).toLocaleDateString("en-GB")}
                            </td>
                            <td className={cn(
                                "px-4 py-3 text-right para-small font-semibold",
                                entry.kind === "income" ? "text-success" : "text-text-dark"
                            )}>
                                {entry.kind === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => onEdit(entry)} className="text-text-secondary-muter hover:text-primary">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => onDelete(entry.id)} className="text-text-secondary-muter hover:text-danger">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function SortableHeader({
    label, field, active, direction, onSort, align = "left",
}: {
    label: string; field: SortField; active: SortField; direction: SortDirection;
    onSort: (f: SortField) => void; align?: "left" | "right";
}) {
    return (
        <th
            onClick={() => onSort(field)}
            className={cn(
                "cursor-pointer select-none px-4 py-3 font-semibold default-transition hover:text-text-secondary",
                align === "right" ? "text-right" : "text-left"
            )}
        >
            <span className={cn("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
                {label}
                <ArrowUpDown size={11} className={active === field ? "text-primary" : "opacity-40"} />
            </span>
        </th>
    );
}