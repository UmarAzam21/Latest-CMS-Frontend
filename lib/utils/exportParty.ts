// dashboard\lib\utils\exportParty.ts

import * as XLSX from "xlsx";
import autoTable from "jspdf-autotable";
import { DEBT_CATEGORY_TYPE, DEBT_TYPE_META, IParty, PARTY_TYPE_LABELS } from "@/types/expenseManagerTy";
import { LedgerRow, pkr } from "./debt";
import { BRAND, GREEN, INK, addFooters, downloadBlob, startPdf, summaryBoxes } from "./exportKit";

type Range = { from?: string; to?: string };
const HEAD = ["Date", "Details", "You Gave", "You Got", "Balance"];

const typeLabel = (r: LedgerRow) => DEBT_TYPE_META[DEBT_CATEGORY_TYPE[r.entry.categoryId]]?.label ?? "Udhaar";
const details = (r: LedgerRow) => [typeLabel(r), r.entry.description].filter(Boolean).join(" — ");
const balLabel = (b: number) => (b === 0 ? "Rs 0" : `${pkr(Math.abs(b))} ${b > 0 ? "get" : "give"}`);
const netText = (n: number) => (n > 0 ? `${pkr(n)} (you will get)` : n < 0 ? `${pkr(-n)} (you will give)` : "Settled up");
const rangeText = ({ from, to }: Range) => (from || to ? `${from || "start"} to ${to || "today"}` : "All dates");
const totals = (rows: LedgerRow[]) => ({
    gave: rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0),
    got: rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0),
});

// rows = filtered rows to print; net = party's overall balance
export function buildPartyPdf(party: IParty, rows: LedgerRow[], net: number, range: Range = {}) {
    const { gave, got } = totals(rows);
    const doc = startPdf(
        `Statement: ${party.name}`,
        `${PARTY_TYPE_LABELS[party.type]}${party.phone ? ` • ${party.phone}` : ""} • ${rangeText(range)}`
    );
    const y = summaryBoxes(doc, 90, [
        { label: "YOU GAVE", value: pkr(gave), color: BRAND },
        { label: "YOU GOT", value: pkr(got), color: GREEN },
        { label: net > 0 ? "YOU WILL GET" : net < 0 ? "YOU WILL GIVE" : "SETTLED UP", value: pkr(Math.abs(net)), color: net > 0 ? BRAND : net < 0 ? GREEN : INK },
    ]);

    autoTable(doc, {
        startY: y + 16,
        head: [HEAD],
        body: rows.map((r) => [r.entry.date, details(r), r.sign > 0 ? pkr(r.entry.amount) : "", r.sign < 0 ? pkr(r.entry.amount) : "", balLabel(r.balance)]),
        foot: [["", "Total", pkr(gave), pkr(got), balLabel(net)]],
        theme: "striped",
        margin: { left: 40, right: 40, bottom: 50 },
        styles: { fontSize: 9, cellPadding: 6, textColor: INK },
        headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
        footStyles: { fillColor: [243, 244, 246], textColor: INK, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
            2: { halign: "right", textColor: BRAND, fontStyle: "bold" },
            3: { halign: "right", textColor: GREEN, fontStyle: "bold" },
            4: { halign: "right" },
        },
        didParseCell: (d) => { if (d.column.index >= 2 && d.section !== "body") d.cell.styles.halign = "right"; },
    });
    return addFooters(doc);
}

export const exportPartyPdf = (p: IParty, rows: LedgerRow[], net: number, range: Range, filename: string) =>
    buildPartyPdf(p, rows, net, range).save(filename);

export function exportPartyXlsx(party: IParty, rows: LedgerRow[], net: number, range: Range, filename: string) {
    const { gave, got } = totals(rows);
    const ws = XLSX.utils.aoa_to_sheet([
        [`Statement: ${party.name}`],
        ["Type", PARTY_TYPE_LABELS[party.type]], ["Phone", party.phone ?? ""], ["Period", rangeText(range)], [],
        ["Date", "Details", "You Gave", "You Got", "Balance (+ get / - give)"],
        ...rows.map((r) => [r.entry.date, details(r), r.sign > 0 ? r.entry.amount : "", r.sign < 0 ? r.entry.amount : "", r.balance]),
        [], ["", "Total", gave, got, net],
    ]);
    ws["!cols"] = [{ wch: 12 }, { wch: 42 }, { wch: 14 }, { wch: 14 }, { wch: 24 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statement");
    XLSX.writeFile(wb, filename);
}

const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
export function exportPartyCsv(party: IParty, rows: LedgerRow[], net: number, filename: string) {
    const { gave, got } = totals(rows);
    const lines = [
        HEAD,
        ...rows.map((r) => [r.entry.date, details(r), r.sign > 0 ? r.entry.amount : "", r.sign < 0 ? r.entry.amount : "", r.balance]),
        ["", "Total", gave, got, net],
    ].map((r) => r.map(q).join(","));
    downloadBlob(new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" }), filename); // BOM = Excel opens it correctly
}

export function partySummaryText(party: IParty, rows: LedgerRow[], net: number) {
    const { gave, got } = totals(rows);
    return [
        `*${party.name} ka Khata*`,
        `You Gave: ${pkr(gave)}`,
        `You Got: ${pkr(got)}`,
        `*Net: ${netText(net)}*`,
        `Entries: ${rows.length}`,
        ``,
        `— FilerNow Digital Khata`,
    ].join("\n");
}

export type PartyListRow = { party: IParty; balance: number };
const LIST_HEAD = ["Party", "Type", "Phone", "Status", "Amount"];
const statusOf = (b: number) => (b > 0 ? "You will get" : b < 0 ? "You will give" : "Settled");
const listBody = (rows: PartyListRow[]) =>
    rows.map(({ party: p, balance: b }) => [p.name, PARTY_TYPE_LABELS[p.type], p.phone ?? "", statusOf(b), Math.abs(b)]);
const listTotals = (rows: PartyListRow[]) => ({
    get: rows.filter((r) => r.balance > 0).reduce((s, r) => s + r.balance, 0),
    give: rows.filter((r) => r.balance < 0).reduce((s, r) => s - r.balance, 0),
});

export function exportPartyListCsv(rows: PartyListRow[], filename: string) {
    const lines = [LIST_HEAD, ...listBody(rows)].map((r) => r.map(q).join(","));
    downloadBlob(new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" }), filename);
}

export function exportPartyListXlsx(rows: PartyListRow[], filename: string) {
    const ws = XLSX.utils.aoa_to_sheet([LIST_HEAD, ...listBody(rows)]);
    ws["!cols"] = [{ wch: 26 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Parties");
    XLSX.writeFile(wb, filename);
}

export function exportPartyListPdf(rows: PartyListRow[], filename: string) {
    const { get, give } = listTotals(rows);
    const doc = startPdf("Party List", `${rows.length} parties`);
    const y = summaryBoxes(doc, 90, [
        { label: "YOU WILL GET", value: pkr(get), color: BRAND },
        { label: "YOU WILL GIVE", value: pkr(give), color: GREEN },
        { label: "NET", value: pkr(Math.abs(get - give)) },
    ]);
    autoTable(doc, {
        startY: y + 16,
        head: [LIST_HEAD],
        body: listBody(rows).map((r) => r.map((v, i) => (i === 4 ? pkr(Number(v)) : String(v)))),
        theme: "striped",
        margin: { left: 40, right: 40, bottom: 50 },
        styles: { fontSize: 9, cellPadding: 6, textColor: INK },
        headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: { 4: { halign: "right", fontStyle: "bold" } },
        didParseCell: (d) => { if (d.column.index === 4 && d.section === "head") d.cell.styles.halign = "right"; },
    });
    addFooters(doc).save(filename);
}