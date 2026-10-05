"use client";
import { useState } from "react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import DebtSummaryCardV2 from "@/components/user-dashboard/expenseManager/debtCard/DebtSummaryCardV2";
import ExpensesTable from "@/components/user-dashboard/expenseManager/expensesTable/ExpensesTable";
import UdhaarStats from "@/components/user-dashboard/expenseManager/udhaarKhata/UdhaarStats";
import DebtActivityChart from "@/components/user-dashboard/expenseManager/udhaarKhata/DebtActivityChart";
import AddUdhaarButton from "@/components/user-dashboard/expenseManager/udhaarKhata/AddUdhaarButton";
import CardsManager from "@/components/user-dashboard/expenseManager/cardsManager/CardsManager";
import CardsBalanceChart from "@/components/user-dashboard/expenseManager/cardsManager/CardsBalanceChart";
import CategoryManagerDialog from "@/components/user-dashboard/expenseManager/expenseCategory/CategoryManagerDialog";
import { IExpenseEntry } from "@/types/expenseManagerTy";
import DataModeToggler from "@/components/user-dashboard/expenseManager/modeToggler/DataModeToggler";

export default function UdhaarKhataPage() {
    const store = useExpenseManagerStore();
    const [editingEntry, setEditingEntry] = useState<IExpenseEntry | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const debtEntries = store.entries.filter((e) => e.kind === "debt");

    return (
        <div className="flex flex-col gap-brand-12">
            <div className="flex items-center justify-between border-b border-border-clr pb-brand-8">
                <h1 className="heading-h6">Udhaar Khatta</h1>
                <div className="flex gap-2">

                    <DataModeToggler store={store} />

                    <div className="flex items-center gap-brand-8">
                        <CategoryManagerDialog
                            categories={store.categories}
                            onAdd={store.addCategory}
                            onDelete={store.deleteCategory}
                        />
                        <AddUdhaarButton
                            categories={store.categories}
                            cards={store.cards}
                            editingEntry={editingEntry}
                            open={addOpen}
                            onOpenChange={setAddOpen}
                            onCloseEdit={() => setEditingEntry(null)}
                            onSaved={(v) => {
                                if (editingEntry) {
                                    store.updateEntry(editingEntry.id, v);
                                } else {
                                    store.addEntry(v);
                                }
                                setAddOpen(false);
                            }}
                        />
                    </div>
                </div>
            </div>

            <UdhaarStats
                debtEntries={debtEntries}
                categories={store.categories}
                onCtaClick={() => setAddOpen(true)}
            />

            {/* <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <CardsManager cards={store.cards} onAddCard={store.addCard} onUpdateCard={store.updateCard} onDeleteCard={store.deleteCard} onTransfer={store.transferBetweenCards} />
                <CardsBalanceChart cards={store.cards} variant="area" />
            </div> */}

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <DebtActivityChart entries={debtEntries} />
                <DebtSummaryCardV2 debtEntries={debtEntries} onMakePayment={store.makeDebtPayment} />
            </div>

            <ExpensesTable
                entries={debtEntries}
                categories={store.categories}
                sortField={store.sortField}
                sortDirection={store.sortDirection}
                onSort={(field) => {
                    if (field === store.sortField) {
                        store.setSortDirection(
                            store.sortDirection === "asc" ? "desc" : "asc"
                        );
                    } else {
                        store.setSortField(field);
                        store.setSortDirection("desc");
                    }
                }}
                onDelete={store.deleteEntry}
                onEdit={setEditingEntry}
                activeFilter="debt"
                onFilterChange={() => { }}
                showTypeFilters={false}
            />
        </div>
    );
}