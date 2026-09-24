// dashboard\components\user-dashboard\expenseManager\expensesTable\ExpensesTable.tsx

"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Download, Pencil, Trash2 } from "lucide-react";
import { IExpenseEntry, ICategory, SortField, SortDirection, EntryKind, KHATA_LABELS } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { exportToCsv, exportToPdf, exportToXlsx } from "@/lib/utils/exportTransactionsData";

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

type FilterTab = "all" | EntryKind;

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
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const getCategoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? "Uncategorized";

  const counts = {
    all: entries.length,
    expense: entries.filter((e) => e.kind === "expense").length,
    income: entries.filter((e) => e.kind === "income").length,
    debt: entries.filter((e) => e.kind === "debt").length,
  };

  const filteredEntries = activeFilter === "all" ? entries : entries.filter((e) => e.kind === activeFilter);

  useEffect(() => setPage(1), [activeFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const paginatedEntries = filteredEntries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);


  return (
    <div className="rounded-brand-16 border border-border-clr bg-card-bg-clrx bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-clr p-4">
        <div>
          <h3 className="heading-h5 text-text-dark">Transactions</h3>
          <p className="para-tiny text-text-secondary-muter">
            All expenses, income, and debt entries in one place.
          </p>
        </div>

        {/* Entries Filters Tabs */}
        <div className="flex gap-8">
          <div className="flex gap-1.5">
            {showTypeFilters && (<>
              <FilterTabButton
                label="All"
                count={counts.all}
                active={activeFilter === "all"}
                onClick={() => onFilterChange("all")}
              />
              <FilterTabButton
                // label="Expenses"
                label={KHATA_LABELS.expense.noun}
                count={counts.expense}
                active={activeFilter === "expense"}
                onClick={() => onFilterChange("expense")}
              />
              <FilterTabButton
                // label="Income"
                label={KHATA_LABELS.income.noun}
                count={counts.income}
                active={activeFilter === "income"}
                onClick={() => onFilterChange("income")}
              />
              <FilterTabButton
                // label="Debt"
                label={KHATA_LABELS.debt.noun}
                count={counts.debt}
                active={activeFilter === "debt"}
                onClick={() => onFilterChange("debt")}
              />
            </>)}

          </div>

          {/* Entries Export Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1.5 rounded-brand-8 border border-border-clr px-3 py-1.5 para-tiny font-semibold text-text-secondary hover:bg-page-bg">
                <Download size={13} /> Export
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                className="z-dropdown w-40 rounded-brand-8 border border-border-clr bg-white p-1 shadow-card-hover"
              >
                <DropdownMenu.Item
                  onClick={() => exportToCsv(filteredEntries, categories, "transactions.csv")}
                  className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-small text-text-secondary hover:bg-page-bg outline-none"
                >
                  CSV
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => exportToXlsx(filteredEntries, categories, "transactions.xlsx")}
                  className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-small text-text-secondary hover:bg-page-bg outline-none"
                >
                  Excel (.xlsx)
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => exportToPdf(filteredEntries, categories, "transactions.pdf")}
                  className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-small text-text-secondary hover:bg-page-bg outline-none"
                >
                  PDF
                </DropdownMenu.Item>
              </DropdownMenu.Content>

            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="p-10 text-center">
          <p className="para-small text-text-secondary-muted">
            No {activeFilter === "all" ? "entries" : activeFilter} yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-clr para-tiny uppercase text-text-secondary-muter">
                <SortableHeader label="Subject" field="subject" active={sortField} direction={sortDirection} onSort={onSort} />
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <SortableHeader label="Date" field="date" active={sortField} direction={sortDirection} onSort={onSort} />
                <SortableHeader label="Amount" field="amount" active={sortField} direction={sortDirection} onSort={onSort} align="right" />
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* {filteredEntries.map((entry) => ( */}
              {paginatedEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-border-clr last:border-0 hover:bg-page-bg">
                  <td className="px-4 py-3 para-small text-text-dark">{entry.subject}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 para-tiny font-semibold capitalize", kindBadgeStyles[entry.kind])}>
                      {entry.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 para-small text-text-secondary">{getCategoryLabel(entry.categoryId)}</td>
                  <td className="px-4 py-3 para-small text-text-secondary-muted">
                    {new Date(entry.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className={cn(
                    "px-4 py-3 text-right para-small font-semibold",
                    entry.kind === "income" ? "text-success" : "text-text-dark"
                  )}>
                    {entry.kind === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(entry)} className="text-text-secondary-muter hover:text-primary">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => onDelete(entry.id)} className="text-text-secondary-muter hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEntries.length > PAGE_SIZE && (
            <div className="flex items-center justify-between border-t border-border-clr px-4 py-3">
              <span className="para-tiny text-text-secondary-muter">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredEntries.length)} of {filteredEntries.length}
              </span>
              <div className="flex gap-1.5">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="rounded-brand-8 border border-border-clr px-2.5 py-1 para-tiny disabled:opacity-40">Prev</button>
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                  className="rounded-brand-8 border border-border-clr px-2.5 py-1 para-tiny disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FilterTabButton({
  label, count, active, onClick,
}: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-brand-8 px-3 py-1.5 para-tiny font-semibold default-transition",
        active ? "bg-primary text-white" : "bg-page-bg text-text-secondary hover:bg-border-clr"
      )}
    >
      {label}
      <span className={cn("rounded-full px-1.5 text-[10px]", active ? "bg-white/25" : "bg-border-clr")}>
        {count}
      </span>
    </button>
  );
}

function SortableHeader({
  label, field, active, direction, onSort, align = "left",
}: {
  label: string; field: SortField; active: SortField; direction: SortDirection;
  onSort: (f: SortField) => void; align?: "left" | "right";
}) {
  return (
    <th
      onClick={() => onSort(field)}
      className={cn(
        "cursor-pointer select-none px-4 py-3 font-semibold default-transition hover:text-text-secondary",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <span className={cn("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
        {label}
        <ArrowUpDown size={11} className={active === field ? "text-primary" : "opacity-40"} />
      </span>
    </th>
  );
}