// components/user-dashboard/expenseManager/ExpensesStats.tsx
"use client";

import { Wallet, TrendingUp, TrendingDown, CircleDollarSign, Pencil } from "lucide-react";
import { IExpenseEntry, ICategory, EntryKind, IExpenseStatItem, KHATA_LABELS, ICard, MAX_CARDS } from "@/types/expenseManagerTy";
import { exportEntriesToCsv } from "@/lib/utils/exportCsv";
import ExpenseStatCard from "./ExpensesStatCard";
import { useState } from "react";
import CardFormDialog from "../cardsManager/CardFormDialog";
import DetailedEntryDialog, { EntrySavePayload } from "./DetailedEntryDialog";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import { debtBalances, debtTotals } from "@/lib/utils/debt";

interface ExpensesStatsProps {
    entries: IExpenseEntry[];
    categories: ICategory[];
    cards: ICard[];
    onViewKind: (kind: EntryKind | "all") => void;
    onSaved: (v: EntrySavePayload) => void;
    onAddCard: (card: Omit<ICard, "id">) => void;
}

const monthKey = (d: string) => d.slice(0, 7);

const shiftMonth = (key: string, offset: number) => {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function monthlyDelta(entries: IExpenseEntry[] = [], kind: EntryKind | "net") {
    if (!entries || entries.length === 0) {
        return { percent: 0, direction: "up" as const };
    }

    const now = monthKey(new Date().toISOString());
    const prev = shiftMonth(now, -1);

    const totalFor = (key: string) =>
        kind === "net"
            ? entries.filter((e) => e.kind === "income" && monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0) -
            entries.filter((e) => e.kind === "expense" && monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0)
            : entries.filter((e) => e.kind === kind && monthKey(e.date) === key).reduce((s, e) => s + e.amount, 0);

    const current = totalFor(now);
    const previous = totalFor(prev);

    if (previous === 0) {
        return { percent: 0, direction: "up" as const };
    }

    return {
        percent: Math.round((Math.abs(current - previous) / Math.abs(previous)) * 100),
        direction: (current >= previous ? "up" : "down") as "up" | "down",
    };
}


export default function ExpensesStats({ entries = [], categories = [], cards = [], onViewKind, onSaved, onAddCard }: ExpensesStatsProps) {
    const store = useExpenseManagerStore();
    const [dialogKind, setDialogKind] = useState<EntryKind | null>(null);
    const [cardDialogOpen, setCardDialogOpen] = useState(false);


    const totalIncome = entries
        .filter((e) => e.kind === "income")
        .reduce((s, e) => s + e.amount, 0);

    const totalExpenses = entries
        .filter((e) => e.kind === "expense")
        .reduce((s, e) => s + e.amount, 0);

    // const totalDebt = entries
    //     .filter((e) => e.kind === "debt" && !e.isSettled)
    //     .reduce((s, e) => s + e.amount, 0);

    const { youWillGet, youWillGive } = debtTotals(debtBalances(entries));
    const totalDebt = Math.abs(youWillGet - youWillGive); // net udhaar

    // const balance = totalIncome - totalExpenses;

    const bal = monthlyDelta(entries, "net");
    const inc = monthlyDelta(entries, "income");
    const exp = monthlyDelta(entries, "expense");
    const debt = monthlyDelta(entries, "debt");

    const cardsBalance = cards.reduce((s, c) => s + c.balance, 0);

    const items: (IExpenseStatItem & { filterKind: EntryKind | "all"; ctaLabel?: string })[] = [
        {
            id: "cardBalance",
            title: "Total Cards Balance",
            // value: `PKR ${balance.toLocaleString("en-PK")}`,
            value: `PKR ${cardsBalance.toLocaleString("en-PK")}`,
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
            <div className="grid grid-cols-1 gap-brand-12 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((item) => item.id === "cardBalance" ? (
                    <div key={item.id} className="relative group">
                        <ExpenseStatCard
                            item={item}
                            onView={() => onViewKind("all")}
                            onExport={() => exportEntriesToCsv(entries, categories, "all-export.csv")}
                            ctaLabel="Add Card"
                            onCtaClick={() => setCardDialogOpen(true)}
                        />
                        <button
                            onClick={() => setCardDialogOpen(true)}
                            disabled={cards.length >= MAX_CARDS}
                            title={cards.length >= MAX_CARDS ? `Max ${MAX_CARDS} cards` : undefined}
                            className="absolute bottom-3.5 right-brand-12 rounded-brand-8 bg-page-bg px-2 py-1.5 para-tiny font-medium text-primary hover:bg-primary default-transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            + Add Card
                            {/* <Pencil size={14} /> */}
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

            <DetailedEntryDialog
                kind={dialogKind}
                categories={categories}
                cards={cards}
                onClose={() => setDialogKind(null)}
                onSaved={onSaved}
                parties={store.parties}
                onAddParty={store.addParty}
            />
        </>
    );
}
