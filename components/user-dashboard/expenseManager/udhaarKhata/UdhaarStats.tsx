"use client";
import { CircleDollarSign, ArrowDownCircle, ArrowUpCircle, CheckCircle2 } from "lucide-react";
import ExpenseStatCard from "../expenseStats/ExpensesStatCard";
import { exportEntriesToCsv } from "@/lib/utils/exportCsv";
import { IExpenseEntry, ICategory, IExpenseStatItem, KHATA_LABELS } from "@/types/expenseManagerTy";

export default function UdhaarStats({ debtEntries, categories, onCtaClick }: {
    debtEntries: IExpenseEntry[]; categories: ICategory[]; onCtaClick: () => void;
}) {
    const unsettled = debtEntries.filter((d) => !d.isSettled);
    const liyaTotal = unsettled.filter((d) => d.debtDirection === "liya").reduce((s, d) => s + d.amount, 0);
    const diyaTotal = unsettled.filter((d) => d.debtDirection === "diya").reduce((s, d) => s + d.amount, 0);
    const settledCount = debtEntries.filter((d) => d.isSettled).length;

    const items: (IExpenseStatItem & { ctaLabel?: string })[] = [
        {
            id: "outstanding",
            title: "Total Udhaar Khata",
            value: `PKR ${(liyaTotal + diyaTotal).toLocaleString("en-PK")}`,
            trendDirection: "down",
            trendPercent: 0,
            trendLabel: "abhi baaki hai",
            icon: CircleDollarSign,
            chip: "red",
            isPositive: false,
            ctaLabel: KHATA_LABELS.debt.verb
        },
        {
            id: "liya",
            title: "Udhaar Liya",
            value: `PKR ${liyaTotal.toLocaleString("en-PK")}`,
            trendDirection: "down",
            trendPercent: 0,
            trendLabel: "mai ne liya",
            icon: ArrowDownCircle,
            chip: "blue",
            isPositive: false
        },
        {
            id: "diya",
            title: "Udhaar Diya",
            value: `PKR ${diyaTotal.toLocaleString("en-PK")}`,
            trendDirection: "up",
            trendPercent: 0,
            trendLabel: "mai ne diya",
            icon: ArrowUpCircle,
            chip: "purple",
            isPositive: true
        },
        {
            id: "settled",
            title: "Adaa shuda Udhaar",
            value: `${settledCount}`,
            trendDirection: "up",
            trendPercent: 0,
            trendLabel: "clear ho chuka",
            icon: CheckCircle2,
            chip: "green",
            isPositive: true
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-brand-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <ExpenseStatCard
                    key={item.id}
                    item={item}
                    onView={() => { }}
                    onExport={() =>
                        exportEntriesToCsv(
                            debtEntries,
                            categories,
                            `${item.id}-udhaar-export.csv`
                        )
                    }
                    ctaLabel={item.ctaLabel}
                    onCtaClick={item.ctaLabel ? onCtaClick : undefined}
                />
            ))}
        </div>
    );
}