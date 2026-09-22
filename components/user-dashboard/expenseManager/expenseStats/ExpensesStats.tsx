// components/user-dashboard/expenseManager/ExpensesStatsCard.tsx
"use client";

import { Wallet, TrendingUp, TrendingDown, CircleDollarSign } from "lucide-react";
import { IExpenseEntry, ICategory, EntryKind, IExpenseStatItem, KHATA_LABELS, ICard } from "@/types/expenseManager";
import { exportEntriesToCsv } from "@/lib/utils/exportCsv";
import ExpenseStatCard from "./ExpensesStatCard";
import { QuickEntryValues } from "@/lib/schemas/quickEntrySchema";
import { useState } from "react";
import AamdniDialog from "../khata/AamdniDialog";
import KharchaDialog from "../khata/KharchaDialog";
import UdhaarDialog from "../khata/UdhaarDialog";
import CardFormDialog from "../cardsManager/CardFormDialog";

// interface ExpensesStatsCardProps {
//     entries?: IExpenseEntry[];
//     categories?: ICategory[];
//     onViewKind: (kind: EntryKind | "all") => void;
// }
interface ExpensesStatsProps {
    entries: IExpenseEntry[];
    categories: ICategory[];
    onViewKind: (kind: EntryKind | "all") => void;
    onSaved: (v: QuickEntryValues & { kind: EntryKind }) => void;
    onAddCard: (card: Omit<ICard, "id">) => void; // NEW
}

const monthKey = (d: string) => d.slice(0, 7);
const shiftMonth = (key: string, offset: number) => {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function monthlyDelta(entries: IExpenseEntry[] = [], kind: EntryKind | "net") {
    if (!entries || entries.length === 0) return { percent: 0, direction: "up" as const };

    const now = monthKey(new Date().toISOString());
    const prev = shiftMonth(now, -1);

    const totalFor = (key: string) =>
        kind === "net"
            ? entries.filter((e) => e.kind === "income" && monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0) -
            entries.filter((e) => e.kind === "expense" && monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0)
            : entries.filter((e) => e.kind === kind && monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0);

    const current = totalFor(now), previous = totalFor(prev);
    if (previous === 0) return { percent: 0, direction: "up" as const };

    return {
        percent: Math.round((Math.abs(current - previous) / Math.abs(previous)) * 100),
        direction: (current >= previous ? "up" : "down") as "up" | "down",
    };
}

export default function ExpensesStats({ entries = [], categories = [], onViewKind, onSaved, onAddCard }: ExpensesStatsProps) {
    const [dialogKind, setDialogKind] = useState<EntryKind | null>(null);
    const [cardDialogOpen, setCardDialogOpen] = useState(false); // NEW — was missing entirely


    const totalIncome = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
    const totalExpenses = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
    const totalDebt = entries.filter((e) => e.kind === "debt" && !e.isSettled).reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpenses;
    const bal = monthlyDelta(entries, "net"), inc = monthlyDelta(entries, "income"), exp = monthlyDelta(entries, "expense"), debt = monthlyDelta(entries, "debt");

    const items: (IExpenseStatItem & { filterKind: EntryKind | "all"; ctaLabel?: string })[] = [
        {
            id: "cardBalance",
            title: "Total Cards Balance",
            value: `PKR ${balance.toLocaleString("en-PK")}`,
            trendDirection: bal.direction,
            trendPercent: bal.percent,
            trendLabel: "vs last month",
            icon: Wallet,
            chip: "green",
            isPositive: bal.direction === "up",
            filterKind: "all"
        },
        {
            id: "aamdani",
            title: KHATA_LABELS.income.title,
            value: `PKR ${totalIncome.toLocaleString("en-PK")}`,
            trendDirection: inc.direction,
            trendPercent: inc.percent,
            trendLabel: "vs last month",
            icon: TrendingUp,
            chip: "blue",
            isPositive: inc.direction === "up",
            filterKind: "income",
            ctaLabel: KHATA_LABELS.income.verb
        },
        {
            id: "kharcha",
            title: KHATA_LABELS.expense.title,
            value: `PKR ${totalExpenses.toLocaleString("en-PK")}`,
            trendDirection: exp.direction,
            trendPercent: exp.percent,
            trendLabel: "vs last month",
            icon: TrendingDown,
            chip: "purple",
            isPositive: exp.direction === "down",
            filterKind: "expense",
            ctaLabel: KHATA_LABELS.expense.verb
        },
        {
            id: "udhaar",
            title: KHATA_LABELS.debt.title,
            value: `PKR ${totalDebt.toLocaleString("en-PK")}`,
            trendDirection: debt.direction,
            trendPercent: debt.percent,
            trendLabel: "vs last month",
            icon: CircleDollarSign,
            chip: "red",
            isPositive: debt.direction === "down",
            filterKind: "debt",
            ctaLabel: KHATA_LABELS.debt.verb
        },
    ];


    return (
        <>
            <div className="grid grid-cols-1 gap-brand-8 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item) => item.id === "cardBalance" ? (
                    <div key={item.id} className="relative">
                        <ExpenseStatCard
                            item={item}
                            onView={() => onViewKind("all")}
                            onExport={() => exportEntriesToCsv(entries, categories, "all-export.csv")}
                        />
                        <button
                            onClick={() => setCardDialogOpen(true)}
                            className="absolute bottom-brand-8 right-brand-8 rounded-brand-8 bg-page-bg px-2.5 py-1 para-tiny font-semibold text-primary hover:bg-primary hover:text-white"
                        >
                            + Add Card
                        </button>
                    </div>
                ) : (
                    <ExpenseStatCard
                        key={item.id}
                        item={item}
                        onView={() => onViewKind(item.filterKind)}
                        onExport={() => exportEntriesToCsv(
                            entries.filter((e) => e.kind === item.filterKind),
                            categories,
                            `${item.id}-export.csv`
                        )}
                        ctaLabel={item.ctaLabel}
                        onCtaClick={() => setDialogKind(item.filterKind === "all" ? null : item.filterKind)}
                    />
                ))}
            </div>

            <CardFormDialog
                open={cardDialogOpen}
                onOpenChange={setCardDialogOpen}
                hideTrigger
                onAdd={onAddCard}
                onUpdate={() => { }}
            />

            <AamdniDialog categories={categories} open={dialogKind === "income"} onOpenChange={(o) => !o && setDialogKind(null)} onSaved={onSaved} />
            <KharchaDialog categories={categories} open={dialogKind === "expense"} onOpenChange={(o) => !o && setDialogKind(null)} onSaved={onSaved} />
            <UdhaarDialog categories={categories} open={dialogKind === "debt"} onOpenChange={(o) => !o && setDialogKind(null)} onSaved={onSaved} />
        </>
    );
}
