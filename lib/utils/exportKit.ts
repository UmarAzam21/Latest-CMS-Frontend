// dashboard\lib\utils\exportKit.ts

import jsPDF from "jspdf";

export const BRAND: [number, number, number] = [200, 16, 46];
export const GREEN: [number, number, number] = [22, 163, 74];
export const INK: [number, number, number] = [31, 41, 55];
export const MUTED: [number, number, number] = [107, 114, 128];

export function startPdf(title: string, subtitle: string) {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, w, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.text(title, 40, 33);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(subtitle, 40, 52);
    doc.text("FilerNow Digital Khata", w - 40, 33, { align: "right" });
    doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), w - 40, 52, { align: "right" });
    return doc;
}

export function summaryBoxes(doc: jsPDF, y: number, items: { label: string; value: string; color?: [number, number, number] }[]) {
    const margin = 40, gap = 12;
    const bw = (doc.internal.pageSize.getWidth() - margin * 2 - gap * (items.length - 1)) / items.length;
    items.forEach((it, i) => {
        const x = margin + i * (bw + gap);
        doc.setDrawColor(229, 231, 235); doc.setFillColor(249, 250, 251);
        doc.roundedRect(x, y, bw, 52, 6, 6, "FD");
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED); doc.text(it.label, x + 12, y + 18);
        doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...(it.color ?? INK)); doc.text(it.value, x + 12, y + 39);
    });
    return y + 52;
}

export function addFooters(doc: jsPDF) {
    const n = doc.getNumberOfPages();
    const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight();
    for (let i = 1; i <= n; i++) {
        doc.setPage(i);
        doc.setDrawColor(229, 231, 235); doc.line(40, h - 36, w - 40, h - 36);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...MUTED);
        doc.text("Computer-generated statement • FilerNow Digital Khata", 40, h - 22);
        doc.text(`Page ${i} of ${n}`, w - 40, h - 22, { align: "right" });
    }
    return doc;
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}