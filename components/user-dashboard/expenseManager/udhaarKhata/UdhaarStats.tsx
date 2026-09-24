// dashboard\components\user-dashboard\expenseManager\udhaarKhata\UdhaarStats.tsx

"use client";
import { CircleDollarSign, CheckCircle2, ListChecks } from "lucide-react";
import ExpenseStatCard from "../expenseStats/ExpensesStatCard";
import { IExpenseEntry, ICategory, IExpenseStatItem, KHATA_LABELS } from "@/types/expenseManagerTy";

export default function UdhaarStats({ debtEntries, onCtaClick, onExportAll }: {
    debtEntries: IExpenseEntry[]; categories: ICategory[]; onCtaClick: () => void; onExportAll: () => void;
}) {
    const outstanding = debtEntries.filter((d) => !d.isSettled).reduce((s, d) => s + d.amount, 0);
    const settled = debtEntries.filter((d) => d.isSettled).reduce((s, d) => s + (d.originalAmount ?? d.amount), 0);
    const activeCount = debtEntries.filter((d) => !d.isSettled).length;

    const items: (IExpenseStatItem & { ctaLabel?: string })[] = [
        {
            id: "outstanding",
            title: "Outstanding Udhaar",
            value: `PKR ${outstanding.toLocaleString("en-PK")}`,
            trendDirection: "down",
            trendPercent: 0,
            trendLabel: "abhi baaki hai",
            icon: CircleDollarSign,
            chip: "red",
            isPositive: false,
            ctaLabel: KHATA_LABELS.debt.verb
        },
        {
            id: "settled",
            title: "Ada Shuda Udhaar",
            value: `PKR ${settled.toLocaleString("en-PK")}`,
            trendDirection: "up",
            trendPercent: 0,
            trendLabel: "clear ho chuka",
            icon: CheckCircle2,
            chip: "green",
            isPositive: true
        },
        {
            id: "count",
            title: "Active Udhaar",
            value: `${activeCount}`,
            trendDirection: "up",
            trendPercent: 0,
            trendLabel: "entries",
            icon: ListChecks,
            chip: "blue",
            isPositive: activeCount === 0
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-brand-8 sm:grid-cols-3">
            {items.map((item) => (
                <ExpenseStatCard
                    key={item.id}
                    item={item}
                    onView={() => { }}
                    onExport={onExportAll}
                    ctaLabel={item.ctaLabel}
                    onCtaClick={item.ctaLabel ? onCtaClick : undefined}
                />
            ))}
        </div>
    );
}
