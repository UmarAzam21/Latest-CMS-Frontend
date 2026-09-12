"use client";

import { useRef, useState } from "react";
import ExpensesTable from "@/components/user-dashboard/expenseManager/ExpensesTable";
import TrendChart from "@/components/user-dashboard/expenseManager/TrendChart";
import CategoryBreakdown from "@/components/user-dashboard/expenseManager/CategoryBreakdown";
import DebtSummaryCard from "@/components/user-dashboard/expenseManager/DebtSummaryCard";
import NewExpenseDialog from "@/components/user-dashboard/expenseManager/NewExpenseDialog";
import CategoryManagerDialog from "@/components/user-dashboard/expenseManager/CategoryManagerDialog";
import CardsManager from "@/components/user-dashboard/expenseManager/CardsManager";
import CardsBalanceChart from "@/components/user-dashboard/expenseManager/CardsBalanceChart";
import { EntryKind, FilterTab, IExpenseEntry } from "@/types/expenseManager";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import StatDetailDialog from "@/components/user-dashboard/expenseManager/StatDetailDialog";
import ExpensesStats from "@/components/user-dashboard/expenseManager/ExpensesStats";
import DebtSummaryCardV2 from "@/components/user-dashboard/expenseManager/DebtSummaryCardV2";

export default function ExpenseManagerPage() {
    const store = useExpenseManagerStore();
    const [editingEntry, setEditingEntry] = useState<IExpenseEntry | null>(null);
    const [tableFilter, setTableFilter] = useState<FilterTab>("all");
    const [statDialogKind, setStatDialogKind] = useState<EntryKind | "all" | null>(null);

    // NOTE: passing ALL debts (not just unsettled), DebtSummaryCard needs
    // both to compute its "% cleared" progress bar. Filtering to unsettled
    // only here (as before) silently broke that stat.
    const debtEntries = store.entries.filter((e) => e.kind === "debt");

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border-clr pb-3">
                <h1 className="heading-h4 text-text-dark">Expense Manager</h1>
                <div className="flex items-center gap-3">
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

                <CardsBalanceChart
                    cards={store.cards}
                    variant="area"
                />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[60%_40%]">
                <TrendChart title="Daily Activity (Last 7 Days)" data={store.stats.dailyTrend} granularity="day" />

                {/* <DebtSummaryCard debtEntries={debtEntries} /> */}

                <DebtSummaryCardV2 debtEntries={debtEntries} onMakePayment={store.makeDebtPayment} />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <CategoryBreakdown data={store.stats.categoryBreakdown} />
                <TrendChart title="Monthly Expenses (Last 6 Months)" data={store.stats.monthlyTrend} granularity="month" variant="pie" />
            </div>

            <ExpensesTable
                entries={store.entries}
                categories={store.categories}
                sortField={store.sortField}
                sortDirection={store.sortDirection}
                onSort={(field) => {
                    if (field === store.sortField) store.setSortDirection(store.sortDirection === "asc" ? "desc" : "asc");
                    else { store.setSortField(field); store.setSortDirection("desc"); }
                }}
                onDelete={store.deleteEntry}
                onEdit={setEditingEntry}
                activeFilter={tableFilter}
                onFilterChange={setTableFilter}
            />
        </div>
    );
}