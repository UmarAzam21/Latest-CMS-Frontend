import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IExpenseEntry, ICategory } from "@/types/expenseManagerTy";

function rows(entries: IExpenseEntry[], categories: ICategory[]) {
  const label = (id: string) => categories.find((c) => c.id === id)?.label ?? "Uncategorized";
  return entries.map((e) => [e.date, e.kind, e.subject, label(e.categoryId), e.amount]);
}
const HEADER = ["Date", "Type", "Subject", "Category", "Amount"];

export function exportToCsv(entries: IExpenseEntry[], categories: ICategory[], filename: string) {
  const csv = [HEADER, ...rows(entries, categories).map((r) => [r[0], r[1], `"${String(r[2]).replace(/"/g, '""')}"`, r[3], r[4]])].map((r) => r.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

export function exportToXlsx(entries: IExpenseEntry[], categories: ICategory[], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([HEADER, ...rows(entries, categories)]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, filename);
}

export function exportToPdf(entries: IExpenseEntry[], categories: ICategory[], filename: string) {
  const doc = new jsPDF();
  doc.text("Transactions", 14, 14);
  autoTable(doc, { head: [HEADER], body: rows(entries, categories).map((r) => r.map(String)), startY: 20 });
  doc.save(filename);
}