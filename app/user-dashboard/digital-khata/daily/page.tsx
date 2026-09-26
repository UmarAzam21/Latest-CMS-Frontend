"use client";

import { useState } from "react";
import ExpensesTable from "@/components/user-dashboard/expenseManager/expensesTable/ExpensesTable";
import TrendChart from "@/components/user-dashboard/expenseManager/trendChart/TrendChart";
import CategoryBreakdown from "@/components/user-dashboard/expenseManager/expenseCategory/CategoryBreakdown";
import CategoryManagerDialog from "@/components/user-dashboard/expenseManager/expenseCategory/CategoryManagerDialog";
import CardsManager from "@/components/user-dashboard/expenseManager/cardsManager/CardsManager";
import CardsBalanceChart from "@/components/user-dashboard/expenseManager/cardsManager/CardsBalanceChart";
import { EntryKind, FilterTab, IExpenseEntry } from "@/types/expenseManagerTy";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import StatDetailDialog from "@/components/user-dashboard/expenseManager/expenseStats/StatDetailDialog";
import ExpensesStats from "@/components/user-dashboard/expenseManager/expenseStats/ExpensesStats";
import DebtSummaryCardV2 from "@/components/user-dashboard/expenseManager/debtCard/DebtSummaryCardV2";
import NewEntryMenu from "@/components/user-dashboard/expenseManager/expenseStats/NewEntryMenu";
import AdvancedExpenseWorkspaceV2 from "@/components/user-dashboard/expenseManager/overview/AdvanceExpenseWorkspaceV2";

export default function ExpenseManagerPage() {
    const store = useExpenseManagerStore();
    const [editingEntry, setEditingEntry] = useState<IExpenseEntry | null>(null);
    const [tableFilter, setTableFilter] = useState<FilterTab>("all");
    const [statDialogKind, setStatDialogKind] = useState<EntryKind | "all" | null>(null);

    const debtEntries = store.entries.filter((e) => e.kind === "debt");

    return (
        <div className="flex flex-col gap-brand-12">
            <div className="flex items-center justify-between border-b border-border-clr pb-brand-8">
                <h1 className="heading-h6">Digital Khatta</h1>

                <div className="flex gap-2">
                    <div className="flex items-center gap-2 para-tiny text-text-secondary-muter">
                        <span>Mode: {store.dataMode === "demo" ? "Demo" : "Blank"}</span>
                        <button onClick={store.dataMode === "demo" ? store.resetToBlank : store.loadDemoData}
                            className="rounded-brand-8 border border-border-clr px-2.5 py-2 para-tiny font-semibold hover:bg-page-bg">
                            {store.dataMode === "demo" ? "Start Fresh" : "Load Demo Data"}
                        </button>
                    </div>

                    <div className="flex items-center gap-brand-8">
                        <CategoryManagerDialog
                            categories={store.categories}
                            onAdd={store.addCategory}
                            onDelete={store.deleteCategory}
                        />

                        <NewEntryMenu
                            categories={store.categories}
                            cards={store.cards}
                            editingEntry={editingEntry}
                            onCloseEdit={() => setEditingEntry(null)}
                            onSaved={(values) => {
                                if (editingEntry) store.updateEntry(editingEntry.id, values);
                                else store.addEntry(values);
                            }}
                        />
                    </div>
                </div>
            </div>

            <ExpensesStats
                entries={store.entries}
                categories={store.categories}
                cards={store.cards}  // NEW
                onViewKind={setStatDialogKind}
                onSaved={(v) => store.addEntry({ ...v, categoryId: v.categoryId || "cat-other" })}
                onAddCard={store.addCard}
            />

            <StatDetailDialog
                kind={statDialogKind}
                entries={store.entries}
                categories={store.categories}
                onClose={() => setStatDialogKind(null)}
            />

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

            {/* <AdvancedExpenseWorkspaceV2
                entries={store.entries}
                categories={store.categories}
                cards={store.cards}
                onSaved={(values) => store.addEntry(values)}
            /> */}

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[60%_40%]">
                <TrendChart
                    title="Activity"
                    dataByGranularity={{
                        day: store.stats.dailyTrend,
                        week: store.stats.weeklyTrend,
                        month: store.stats.monthlyTrend
                    }}
                />
                <DebtSummaryCardV2
                    debtEntries={debtEntries}
                    onMakePayment={store.makeDebtPayment}
                />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <CategoryBreakdown data={store.stats.categoryBreakdown} />
                <TrendChart
                    title="Expenses by Period"
                    dataByGranularity={{
                        day: store.stats.dailyTrend,
                        week: store.stats.weeklyTrend,
                        month: store.stats.monthlyTrend
                    }}
                    variant="pie"
                />
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
