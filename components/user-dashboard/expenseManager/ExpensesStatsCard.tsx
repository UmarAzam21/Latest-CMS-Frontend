// components/user-dashboard/expenseManager/ExpensesStatsCard.tsx
"use client";

import { Wallet, TrendingUp, TrendingDown, CircleDollarSign } from "lucide-react";
import { IExpenseEntry, ICategory, EntryKind, IExpenseStatItem } from "@/types/expenseManager";
import ExpenseStatCard from "./ExpensesStatCard";
import { exportEntriesToCsv } from "@/lib/utils/exportCsv";

interface ExpensesStatsCardProps {
    entries?: IExpenseEntry[];
    categories?: ICategory[];
    onViewKind: (kind: EntryKind | "all") => void;
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

export default function ExpensesStatsCard({ entries = [], categories = [], onViewKind }: ExpensesStatsCardProps) {
    // Defensively handle edge cases where array wraps as undefined from serverside props
    const safeEntries = entries || [];
    const safeCategories = categories || [];

    const totalIncome = safeEntries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
    const totalExpenses = safeEntries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
    const totalDebt = safeEntries.filter((e) => e.kind === "debt" && !e.isSettled).reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const bal = monthlyDelta(safeEntries, "net"), inc = monthlyDelta(safeEntries, "income");
    const exp = monthlyDelta(safeEntries, "expense"), debt = monthlyDelta(safeEntries, "debt");

    const items: (IExpenseStatItem & { filterKind: EntryKind | "all" })[] = [
        {
            id: "balance",
            title: "Total Balance",
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
            id: "income",
            title: "Total Income",
            value: `PKR ${totalIncome.toLocaleString("en-PK")}`,
            trendDirection: inc.direction,
            trendPercent: inc.percent,
            trendLabel: "vs last month",
            icon: TrendingUp,
            chip: "blue",
            isPositive: inc.direction === "up",
            filterKind: "income"
        },
        {
            id: "expenses",
            title: "Total Expenses",
            value: `PKR ${totalExpenses.toLocaleString("en-PK")}`,
            trendDirection: exp.direction,
            trendPercent: exp.percent,
            trendLabel: "vs last month",
            icon: TrendingDown,
            chip: "purple",
            isPositive: exp.direction === "down",
            filterKind: "expense"
        },
        {
            id: "debt",
            title: "Outstanding Debt",
            value: `PKR ${totalDebt.toLocaleString("en-PK")}`,
            trendDirection: debt.direction,
            trendPercent: debt.percent,
            trendLabel: "vs last month",
            icon: CircleDollarSign,
            chip: "red",
            isPositive: debt.direction === "down",
            filterKind: "debt"
        },
    ];


    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <ExpenseStatCard
                    key={item.id}
                    item={item}
                    onView={() => onViewKind(item.filterKind)}
                    onExport={() => exportEntriesToCsv(item.filterKind === "all" ? safeEntries : safeEntries.filter((e) => e.kind === item.filterKind), safeCategories, `${item.id}-export.csv`)}
                />
            ))}
        </div>
    );
}
