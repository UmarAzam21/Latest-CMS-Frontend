// dashboard\lib\utils\exportTransactionsData.ts

import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import { IExpenseEntry, ICategory, IParty } from "@/types/expenseManagerTy";
import { pkr } from "./debt";
import { BRAND, GREEN, INK, addFooters, downloadBlob, startPdf, summaryBoxes } from "./exportKit";

const HEADER = ["Date", "Type", "Party", "Subject", "Category", "Amount"];

function rows(entries: IExpenseEntry[], categories: ICategory[], parties: IParty[]): (string | number)[][] {
  const cat = (id: string) => categories.find((c) => c.id === id)?.label ?? "Uncategorized";
  const party = (id?: string) => parties.find((p) => p.id === id)?.name ?? "";
  return entries.map((e) => [e.date, e.kind, party(e.partyId), e.subject, cat(e.categoryId), e.amount]);
}

export function exportToCsv(entries: IExpenseEntry[], categories: ICategory[], filename: string, parties: IParty[] = []) {
  const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [HEADER, ...rows(entries, categories, parties)].map((r) => r.map(q).join(","));
  downloadBlob(new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" }), filename);
}

export function exportToXlsx(entries: IExpenseEntry[], categories: ICategory[], filename: string, parties: IParty[] = []) {
  const ws = XLSX.utils.aoa_to_sheet([HEADER, ...rows(entries, categories, parties)]);
  ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 18 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, filename);
}

export function exportToPdf(entries: IExpenseEntry[], categories: ICategory[], filename: string, parties: IParty[] = []) {
  const sum = (k: string) => entries.filter((e) => e.kind === k).reduce((s, e) => s + e.amount, 0);
  const income = sum("income"), expense = sum("expense");

  const doc = startPdf("Transactions Report", `${entries.length} entries`);
  const y = summaryBoxes(doc, 90, [
    { label: "TOTAL INCOME", value: pkr(income), color: GREEN },
    { label: "TOTAL EXPENSE", value: pkr(expense), color: BRAND },
    { label: "NET", value: pkr(income - expense) },
  ]);
  autoTable(doc, {
    startY: y + 16,
    head: [HEADER],
    body: rows(entries, categories, parties).map((r) => r.map((v, i) => (i === 5 ? pkr(Number(v)) : String(v)))),
    theme: "striped",
    margin: { left: 40, right: 40, bottom: 50 },
    styles: { fontSize: 8.5, cellPadding: 5, textColor: INK },
    headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: { 5: { halign: "right", fontStyle: "bold" } },
    didParseCell: (d) => { if (d.column.index === 5 && d.section === "head") d.cell.styles.halign = "right"; },
  });
  addFooters(doc).save(filename);
}