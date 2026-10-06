// dashboard\lib\utils\trend.ts

import { IExpenseEntry } from "@/types/expenseManagerTy";
import { debtSign } from "./debt";

export function buildTrend(
    entries: { date: string; kind: string; amount: number }[],
    keyFn: (d: string) => string,
    limit: number
) {
    const map = new Map<string, { expense: number; income: number; debt: number }>();

    entries.forEach((e) => {
        const key = keyFn(e.date);
        const b = map.get(key) ?? { expense: 0, income: 0, debt: 0 };
        (b as any)[e.kind] += e.amount;
        map.set(key, b);
    });

    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-limit)
        .map(([label, v]) => ({ label, ...v }));
}

export function weekKey(dateStr: string) {
    const d = new Date(dateStr);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);

    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

// export function buildDebtTrend(
//     entries: { kind: string; date: string; amount: number; debtDirection?: "liya" | "diya" }[],
//     keyFn: (d: string) => string,
//     limit: number
// ) {
//     const map = new Map<string, { liya: number; diya: number }>();
//     entries.filter((e) => e.kind === "debt").forEach((e) => {
//         const key = keyFn(e.date);
//         const b = map.get(key) ?? { liya: 0, diya: 0 };
//         if (e.debtDirection === "liya") b.liya += e.amount;
//         else if (e.debtDirection === "diya") b.diya += e.amount;
//         map.set(key, b);
//     });
//     return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-limit).map(([label, v]) => ({ label, ...v }));
// }

export function buildDebtTrend(entries: IExpenseEntry[], keyFn: (d: string) => string, limit: number) {
    const map = new Map<string, { gave: number; got: number }>();
    entries.forEach((e) => {
        const s = debtSign(e);
        if (!s) return;
        const key = keyFn(e.date);
        const b = map.get(key) ?? { gave: 0, got: 0 };
        if (s > 0) b.gave += e.amount; else b.got += e.amount;
        map.set(key, b);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-limit).map(([label, v]) => ({ label, ...v }));
}