import { IExpenseEntry, ICategory } from "@/types/expenseManagerTy";

export function exportEntriesToCsv(entries: IExpenseEntry[], categories: ICategory[], filename: string) {
    const label = (id: string) => categories.find((c) => c.id === id)?.label ?? "Uncategorized";
    const header = ["Date", "Type", "Subject", "Category", "Amount"];
    const rows = entries.map((e) => [e.date, e.kind, `"${e.subject.replace(/"/g, '""')}"`, label(e.categoryId), e.amount]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}