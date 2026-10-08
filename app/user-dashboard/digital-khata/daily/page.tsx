// dashboard\app\user-dashboard\digital-khata\daily\page.tsx

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
import DataModeToggler from "@/components/user-dashboard/expenseManager/modeToggler/DataModeToggler";

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
                    <DataModeToggler store={store} />

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
                            parties={store.parties} onAddParty={store.addParty}
                        />
                    </div>
                </div>
            </div>

            <ExpensesStats
                entries={store.entries}
                categories={store.categories}
                cards={store.cards}
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

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
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

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <TrendChart
                    title="Activity"
                    dataByGranularity={{
                        day: store.stats.dailyTrend,
                        week: store.stats.weeklyTrend,
                        month: store.stats.monthlyTrend
                    }}
                    defaultGranularity="week"
                />
                {/* <DebtSummaryCardV2
                    debtEntries={debtEntries}
                    onMakePayment={store.makeDebtPayment}
                /> */}
                <DebtSummaryCardV2 debtEntries={debtEntries} parties={store.parties} />
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
                    defaultGranularity="month"
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
