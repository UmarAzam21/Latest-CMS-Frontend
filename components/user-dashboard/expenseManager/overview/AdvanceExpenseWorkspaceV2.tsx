"use client";
import { useMemo, useState } from "react";
import NewExpenseDialog from "../expenseStats/NewExpenseDialog";
// import NetWorthCard from "./NetWorthCard";
import CardsSnapshot from "./CardsSnapshot";
import TransactionPreview from "./TransactionPreview";
// import CategoryRail from "./CategoryRail";
import { IExpenseEntry, ICategory, ICard } from "@/types/expenseManager";
import { ExpenseEntryFormValues } from "@/lib/schemas/expenseEntryFormSchema";
import { RangeFilter, getMonthKey, filterByRange, computeCategoryTotals, buildNetWorthSeriesMonth, buildNetWorthSeriesAllTime } from "@/lib/utils/overviewMetrics";
import NetWorthCard from "./NetworthCard";
import CategoryRail from "./CategoryRaill";

interface AdvancedExpenseWorkspaceProps {
    entries: IExpenseEntry[];
    categories: ICategory[];
    cards: ICard[];
    onSaved: (values: ExpenseEntryFormValues & { receiptImage?: string; cardId?: string }) => void;
}

export default function AdvancedExpenseWorkspaceV2({ entries, categories, cards, onSaved }: AdvancedExpenseWorkspaceProps) {
    const [range, setRange] = useState<RangeFilter>("month");
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthLabel = new Date(`${currentMonth}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const visibleEntries = useMemo(() => filterByRange(entries, range, currentMonth), [entries, range, currentMonth]);
    const income = useMemo(() => visibleEntries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0), [visibleEntries]);
    const expenses = useMemo(() => visibleEntries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0), [visibleEntries]);
    const totalCardBalance = useMemo(() => cards.reduce((s, c) => s + c.balance, 0), [cards]);

    const chartData = useMemo(
        () => range === "month" ? buildNetWorthSeriesMonth(entries, totalCardBalance, currentMonth) : buildNetWorthSeriesAllTime(entries, totalCardBalance),
        [entries, totalCardBalance, currentMonth, range]
    );

    const categoryTotals = useMemo(() => computeCategoryTotals(visibleEntries, categories), [visibleEntries, categories]);

    return (
        <section className="mt-brand-12 rounded-brand-16 border border-border-clr bg-page-bg bg-white shadow-card p-brand-12 sm:p-brand-12">
            <div className="flex flex-col gap-3 border-b border-border-clr pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="heading-h6 text-sm">Personal Finance</h2>
                    <p className="para-tiny text-text-secondary-muter">
                        {range === "month" ? monthLabel : "All-time activity"}
                    </p>
                </div>
                <NewExpenseDialog categories={categories} cards={cards} onSaved={onSaved} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,7fr)_minmax(0,3.4fr)]">
                <NetWorthCard
                    chartData={chartData}
                    income={income}
                    expenses={expenses}
                    balance={income - expenses}
                    range={range}
                    onRangeChange={setRange}
                    monthLabel={monthLabel}
                />
                <CardsSnapshot cards={cards} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <TransactionPreview entries={visibleEntries} categories={categories} />
                <CategoryRail data={categoryTotals} />
            </div>
        </section>
    );
}
