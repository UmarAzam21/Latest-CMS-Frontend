"use client";
import { useMemo } from "react";
import { CircleDollarSign, ArrowDownCircle, ArrowUpCircle, CheckCircle2 } from "lucide-react";
import ExpenseStatCard from "../expenseStats/ExpensesStatCard";
import { exportEntriesToCsv } from "@/lib/utils/exportCsv";
import { debtBalances, debtTotals } from "@/lib/utils/debt";
import { IExpenseEntry, ICategory, IExpenseStatItem, KHATA_LABELS } from "@/types/expenseManagerTy";

const pk = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export default function UdhaarStats({ debtEntries, categories, onCtaClick }: {
    debtEntries: IExpenseEntry[]; categories: ICategory[]; onCtaClick: () => void;
}) {
    const { get, give, settled } = useMemo(() => {
        const b = debtBalances(debtEntries);
        const { youWillGet, youWillGive } = debtTotals(b);
        return { get: youWillGet, give: youWillGive, settled: [...b.values()].filter((v) => v === 0).length };
    }, [debtEntries]);
    const net = get - give;

    const items: (IExpenseStatItem & { ctaLabel?: string })[] = [
        {
            id: "net", title: "Net Udhaar", value: pk(Math.abs(net)), trendDirection: net >= 0 ? "up" : "down", trendPercent: 0,
            trendLabel: net > 0 ? "aap ko milenge" : net < 0 ? "aap ko dene hain" : "hisaab barabar",
            icon: CircleDollarSign, chip: "red", isPositive: net >= 0, ctaLabel: KHATA_LABELS.debt.verb
        },
        {
            id: "get", title: "Aap ko milenge", value: pk(get), trendDirection: "up", trendPercent: 0, trendLabel: "you will get",
            icon: ArrowUpCircle, chip: "purple", isPositive: true
        },
        {
            id: "give", title: "Aap ko dene hain", value: pk(give), trendDirection: "down", trendPercent: 0, trendLabel: "you will give",
            icon: ArrowDownCircle, chip: "blue", isPositive: false
        },
        {
            id: "settled", title: "Settled parties", value: `${settled}`, trendDirection: "up", trendPercent: 0, trendLabel: "clear ho chuke",
            icon: CheckCircle2, chip: "green", isPositive: true
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-brand-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <ExpenseStatCard key={item.id} item={item} onView={() => { }}
                    onExport={() => exportEntriesToCsv(debtEntries, categories, `${item.id}-udhaar-export.csv`)}
                    ctaLabel={item.ctaLabel} onCtaClick={item.ctaLabel ? onCtaClick : undefined} />
            ))}
        </div>
    );
}