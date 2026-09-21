"use client";

import { useState } from "react";
import ExpensesTable from "@/components/user-dashboard/expenseManager/ExpensesTable";
import TrendChart from "@/components/user-dashboard/expenseManager/TrendChart";
import CategoryBreakdown from "@/components/user-dashboard/expenseManager/expenseCategory/CategoryBreakdown";
import NewExpenseDialog from "@/components/user-dashboard/expenseManager/expenseStats/NewExpenseDialog";
import CategoryManagerDialog from "@/components/user-dashboard/expenseManager/expenseCategory/CategoryManagerDialog";
import CardsManager from "@/components/user-dashboard/expenseManager/cardsManager/CardsManager";
import CardsBalanceChart from "@/components/user-dashboard/expenseManager/cardsManager/CardsBalanceChart";
import { EntryKind, FilterTab, IExpenseEntry } from "@/types/expenseManager";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import StatDetailDialog from "@/components/user-dashboard/expenseManager/expenseStats/StatDetailDialog";
import ExpensesStats from "@/components/user-dashboard/expenseManager/expenseStats/ExpensesStats";
import DebtSummaryCardV2 from "@/components/user-dashboard/expenseManager/DebtSummaryCardV2";

export default function ExpenseManagerPage() {
    const store = useExpenseManagerStore();
    const [editingEntry, setEditingEntry] = useState<IExpenseEntry | null>(null);
    const [tableFilter, setTableFilter] = useState<FilterTab>("all");
    const [statDialogKind, setStatDialogKind] = useState<EntryKind | "all" | null>(null);

    const debtEntries = store.entries.filter((e) => e.kind === "debt");

    return (
        <div className="flex flex-col gap-brand-12">
            <div className="flex items-center justify-between border-b border-border-clr pb-brand-8">
                <h1 className="heading-h6 text-sm leading-tight">Digital Khatta</h1>
                <div className="flex items-center gap-brand-8">
                    <CategoryManagerDialog categories={store.categories} onAdd={store.addCategory} onDelete={store.deleteCategory} />
                    <NewExpenseDialog
                        categories={store.categories}
                        cards={store.cards}
                        editingEntry={editingEntry}
                        onClose={() => setEditingEntry(null)}
                        onSaved={(values) => {
                            if (editingEntry) store.updateEntry(editingEntry.id, values);
                            else store.addEntry(values);
                        }}
                    />
                </div>
            </div>

            <ExpensesStats entries={store.entries} categories={store.categories} onViewKind={setStatDialogKind} />
            <StatDetailDialog kind={statDialogKind} entries={store.entries} categories={store.categories} onClose={() => setStatDialogKind(null)} />

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[40%_60%]">
                <CardsManager
                    cards={store.cards}
                    onAddCard={store.addCard}
                    onUpdateCard={store.updateCard}
                    onDeleteCard={store.deleteCard}
                    onTransfer={store.transferBetweenCards}
                />
                <CardsBalanceChart cards={store.cards} variant="area" />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[60%_40%]">
                {/* <TrendChart title="Daily Activity (Last 7 Days)" data={store.stats.dailyTrend} granularity="day" /> */}
                <TrendChart title="Activity" dataByGranularity={{ day: store.stats.dailyTrend, week: store.stats.weeklyTrend, month: store.stats.monthlyTrend }} />
                <DebtSummaryCardV2 debtEntries={debtEntries} onMakePayment={store.makeDebtPayment} />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <CategoryBreakdown data={store.stats.categoryBreakdown} />
                {/* <TrendChart title="Monthly Expenses (Last 6 Months)" data={store.stats.monthlyTrend} granularity="month" variant="pie" /> */}
                <TrendChart title="Expenses by Period" dataByGranularity={{ day: store.stats.dailyTrend, week: store.stats.weeklyTrend, month: store.stats.monthlyTrend }} variant="pie" />
            </div>

            <ExpensesTable
                entries={store.entries}
                categories={store.categories}
                sortField={store.sortField}
                sortDirection={store.sortDirection}
                onSort={(field) => {
                    if (field === store.sortField) {
                        store.setSortDirection(store.sortDirection === "asc" ? "desc" : "asc");
                    } else {
                        store.setSortField(field);
                        store.setSortDirection("desc");
                    }
                }}
                onDelete={store.deleteEntry}
                onEdit={setEditingEntry}
                activeFilter={tableFilter}
                onFilterChange={setTableFilter}
            />
        </div>
    );
}