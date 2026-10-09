// dashboard\components\user-dashboard\expenseManager\expensesTable\ExpensesTable.tsx

"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Download, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { IExpenseEntry, ICategory, SortField, SortDirection, EntryKind, KHATA_LABELS } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { exportToCsv, exportToPdf, exportToXlsx } from "@/lib/utils/exportTransactionsData";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";

type FilterTab = "all" | EntryKind;

interface ExpensesTableProps {
  entries: IExpenseEntry[];
  categories: ICategory[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onDelete: (id: string) => void;
  onEdit: (entry: IExpenseEntry) => void;
  activeFilter: FilterTab;
  onFilterChange: (f: FilterTab) => void;
  showTypeFilters?: boolean;
}

const kindBadgeStyles: Record<EntryKind, string> = {
  expense: "bg-danger-bg text-danger",
  income: "bg-success-bg text-success",
  debt: "bg-warning-bg text-warning",
};

function formatCurrency(v: number) {
  return `PKR ${v.toLocaleString("en-PK")}`;
}

export default function ExpensesTable({
  entries, categories, sortField, sortDirection, onSort, onDelete, onEdit, activeFilter, onFilterChange, showTypeFilters = true
}: ExpensesTableProps) {
  const { parties } = useExpenseManagerStore();
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<IExpenseEntry | null>(null);

  const getCategoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? "Uncategorized";

  const counts = {
    all: entries.length,
    expense: entries.filter((e) => e.kind === "expense").length,
    income: entries.filter((e) => e.kind === "income").length,
    debt: entries.filter((e) => e.kind === "debt").length,
  };

  const filteredEntries = activeFilter === "all" ? entries : entries.filter((e) => e.kind === activeFilter);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const paginatedEntries = filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); setDeleteTarget(null); }, [activeFilter]);

  const confirmDelete = () => {
    if (deleteTarget) onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="rounded-brand-16 border border-border-clr bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-clr px-brand-12 py-brand-8">
        <div>
          <h3 className="para-small font-semibold text-text-dark">Transactions</h3>
          <p className="para-tiny text-text-secondary-muter">
            All expenses, income, and debt entries in one place.
          </p>
        </div>

        <div className="flex gap-6">
          <div className="flex gap-brand-8">
            {showTypeFilters && (<>
              <FilterTabButton label="All" count={counts.all} active={activeFilter === "all"} onClick={() => onFilterChange("all")} />
              <FilterTabButton label={KHATA_LABELS.expense.noun} count={counts.expense} active={activeFilter === "expense"} onClick={() => onFilterChange("expense")} />
              <FilterTabButton label={KHATA_LABELS.income.noun} count={counts.income} active={activeFilter === "income"} onClick={() => onFilterChange("income")} />
              <FilterTabButton label={KHATA_LABELS.debt.noun} count={counts.debt} active={activeFilter === "debt"} onClick={() => onFilterChange("debt")} />
            </>)}
          </div>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1.5 rounded-brand-8 border border-border-clr px-3.5 py-1.5 para-tiny text-[11px] font-semibold text-text-secondary-muted hover:bg-page-bg cursor-pointer default-transition">
                <Download size={13} /> Export
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content align="end" className="z-dropdown w-40 rounded-brand-8 border border-border-clr bg-white p-1 shadow-card-hover">
                <DropdownMenu.Item
                  onClick={() => exportToCsv(filteredEntries, categories, "transactions.csv", parties)}
                  className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-tiny text-text-secondary hover:bg-page-bg outline-none">CSV</DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => exportToXlsx(filteredEntries, categories, "transactions.xlsx", parties)}
                  className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-tiny text-text-secondary hover:bg-page-bg outline-none">Excel (.xlsx)</DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => exportToPdf(filteredEntries, categories, "transactions.pdf", parties)}
                  className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-tiny text-text-secondary hover:bg-page-bg outline-none">PDF</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="p-10 text-center">
          <p className="para-small text-text-secondary-muted">No {activeFilter === "all" ? "entries" : activeFilter} yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-clr para-tiny uppercase text-text-secondary-muter">
                <SortableHeader label="Subject" field="subject" active={sortField} direction={sortDirection} onSort={onSort} />
                <th className="px-brand-12 py-brand-8 text-left font-semibold">Type</th>
                <th className="px-brand-12 py-brand-8 text-left font-semibold">Category</th>
                <SortableHeader label="Date" field="date" active={sortField} direction={sortDirection} onSort={onSort} />
                <SortableHeader label="Amount" field="amount" active={sortField} direction={sortDirection} onSort={onSort} align="right" />
                <th className="px-brand-12 py-brand-8 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-border-clr last:border-0 hover:bg-page-bg">
                  <td className="px-brand-12 py-brand-8 para-tiny text-text-dark">{entry.subject}</td>
                  <td className="px-brand-12 py-brand-8">
                    <span className={cn("rounded-full px-2 py-0.5 para-tiny text-[11px] font-semibold capitalize", kindBadgeStyles[entry.kind])}>
                      {entry.kind}
                    </span>
                  </td>
                  <td className="px-brand-12 py-brand-8 para-tiny text-text-secondary">{getCategoryLabel(entry.categoryId)}</td>
                  <td className="px-brand-12 py-brand-8 para-tiny text-text-secondary-muted">{new Date(entry.date).toLocaleDateString("en-GB")}</td>
                  <td className={cn("px-brand-12 py-brand-8 text-right para-tiny font-semibold", entry.kind === "income" ? "text-success" : "text-text-secondary")}>
                    {entry.kind === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
                  </td>
                  <td className="px-brand-12 py-brand-8">
                    {/* Row is now static — no inline confirm state, so it never resizes */}
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(entry)} className="text-text-secondary-muter hover:text-primary cursor-pointer default-transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteTarget(entry)} className="text-text-secondary-muter hover:text-danger cursor-pointer default-transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* footer */}
          {filteredEntries.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-border-clr px-brand-12 py-brand-8">
              <span className="para-tiny text-text-secondary-muter">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredEntries.length)} of {filteredEntries.length}
              </span>
              <div className="flex gap-1.5">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-brand-8 border border-border-clr px-2.5 py-1 para-tiny cursor-pointer disabled:opacity-40 hover:bg-page-bg default-transition">Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-brand-8 border border-border-clr px-2.5 py-1 para-tiny cursor-pointer disabled:opacity-40 hover:bg-page-bg default-transition">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single shared confirm-delete dialog, not one per row */}
      <Dialog.Root open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-white p-brand shadow-card-hover">
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="heading-h6 text-sm font-semibold flex items-center gap-2 text-text-dark">
                <AlertTriangle size={13} className="text-danger" /> Delete entry?
              </Dialog.Title>
              <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary cursor-pointer default-transition">
                <X size={16} />
              </Dialog.Close>
            </div>

            <p className="para-tiny text-text-secondary leading-normal mb-brand-12">
              {deleteTarget && (
                <>
                  This will permanently delete{" "}
                  <span className="font-semibold text-text-dark">
                    {deleteTarget.subject}
                  </span>{" "}
                  ({formatCurrency(deleteTarget.amount)}). This can't be undone.
                </>
              )}
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-brand-8 border border-border-clr px-3.5 py-2 para-tiny font-semibold text-text-secondary hover:bg-page-bg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-brand-8 bg-danger px-3.5 py-2 para-tiny font-semibold text-white hover:opacity-90 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  );
}

function FilterTabButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-brand-8 px-3.5 py-1.25 para-tiny text-[11px] font-semibold text-text-secondary-muted default-transition cursor-pointer",
        active ? "border border-border-clr/45 bg-card-bg-clr" : "border border-border-clr/50 hover:bg-page-bg"
      )}
    >
      {label}
      <span className={cn("rounded-full w-5 h-5 flex items-center justify-center para-tiny text-[10px]", active ? "bg-border-clr" : "bg-border-card-clr/65")}>
        {count}
      </span>
    </button>
  );
}

function SortableHeader({ label, field, active, direction, onSort, align = "left" }: {
  label: string; field: SortField; active: SortField; direction: SortDirection;
  onSort: (f: SortField) => void; align?: "left" | "right";
}) {
  return (
    <th onClick={() => onSort(field)} className={cn("cursor-pointer select-none px-brand-12 py-brand-8 font-semibold default-transition hover:text-text-secondary", align === "right" ? "text-right" : "text-left")}>
      <span className={cn("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
        {label}
        <ArrowUpDown size={11} className={active === field ? "text-primary" : "opacity-40"} />
      </span>
    </th>
  );
}