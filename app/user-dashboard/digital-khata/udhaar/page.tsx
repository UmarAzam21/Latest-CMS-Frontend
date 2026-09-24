// dashboard\app\user-dashboard\digital-khata\udhaar\page.tsx

"use client";
import { useState } from "react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import DebtSummaryCardV2 from "@/components/user-dashboard/expenseManager/debtCard/DebtSummaryCardV2";
import ExpensesTable from "@/components/user-dashboard/expenseManager/expensesTable/ExpensesTable";
import UdhaarStats from "@/components/user-dashboard/expenseManager/udhaarKhata/UdhaarStats";
import DetailedEntryDialog from "@/components/user-dashboard/expenseManager/expenseStats/DetailedEntryDialog";
import { exportEntriesToCsv } from "@/lib/utils/exportCsv";
import { EntryKind, IExpenseEntry } from "@/types/expenseManagerTy";

export default function UdhaarKhataPage() {
    const store = useExpenseManagerStore();
    const [editingEntry, setEditingEntry] = useState<IExpenseEntry | null>(null);
    const [addOpen, setAddOpen] = useState<EntryKind | null>(null);
    const debtEntries = store.entries.filter((e) => e.kind === "debt");

    return (
        <div className="flex flex-col gap-brand-12">
            <h1 className="heading-h6">Udhaar Khata</h1>

            <UdhaarStats
                debtEntries={debtEntries}
                categories={store.categories}
                onCtaClick={() => setAddOpen("debt")}
                onExportAll={() => exportEntriesToCsv(debtEntries, store.categories, "udhaar-export.csv")}
            />

            <DebtSummaryCardV2
                debtEntries={debtEntries}
                onMakePayment={store.makeDebtPayment}
            />

            <ExpensesTable
                entries={debtEntries}
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
                activeFilter="debt"
                onFilterChange={() => { }}
                showTypeFilters={false}
            />

            <DetailedEntryDialog
                kind={addOpen}
                categories={store.categories}
                cards={store.cards}
                editingEntry={editingEntry}
                onClose={() => {
                    setAddOpen(null);
                    setEditingEntry(null);
                }}
                onSaved={(v) => {
                    if (editingEntry) {
                        store.updateEntry(editingEntry.id, v);
                    } else {
                        store.addEntry({ ...v, categoryId: v.categoryId || "cat-other" });
                    }
                }}
            />
        </div>
    );
}
