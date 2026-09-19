import { IExpenseEntry, ICategory, ICategoryBreakdownItem } from "@/types/expenseManager";
import { buildTrend } from "@/lib/utils/trend";

export type RangeFilter = "all" | "month";

export function getMonthKey(date: string) { return date.slice(0, 7); }

export function filterByRange(entries: IExpenseEntry[], range: RangeFilter, monthKey: string) {
    return range === "all" ? entries : entries.filter((e) => getMonthKey(e.date) === monthKey);
}

export function computeCategoryTotals(entries: IExpenseEntry[], categories: ICategory[]): ICategoryBreakdownItem[] {
    const totals = categories
        .map((cat) => ({ category: cat, amount: entries.filter((e) => e.kind === "expense" && e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0) }))
        .filter((c) => c.amount > 0);
    const total = totals.reduce((s, c) => s + c.amount, 0);
    return totals.map((c) => ({ ...c, percentOfTotal: total > 0 ? Math.round((c.amount / total) * 100) : 0 }));
}

// Reconstructs a day-by-day balance line ending at the CURRENT total card
// balance. This is an approximation from tracked entries, not a persisted
// history — a real balance-snapshot table is a backend concern.
export function buildNetWorthSeriesMonth(entries: IExpenseEntry[], currentBalance: number, monthKey: string) {
    const [y, m] = monthKey.split("-").map(Number);
    const totalDays = new Date(y, m, 0).getDate();
    const monthEntries = entries.filter((e) => getMonthKey(e.date) === monthKey && e.kind !== "debt");
    const dailyNet = new Map<number, number>();
    monthEntries.forEach((e) => {
        const day = Number(e.date.slice(8, 10));
        dailyNet.set(day, (dailyNet.get(day) ?? 0) + (e.kind === "income" ? e.amount : -e.amount));
    });
    const totalMovement = Array.from(dailyNet.values()).reduce((s, v) => s + v, 0);
    let running = currentBalance - totalMovement;
    return Array.from({ length: totalDays }, (_, i) => {
        running += dailyNet.get(i + 1) ?? 0;
        return { day: String(i + 1).padStart(2, "0"), netWorth: running };
    });
}

export function buildNetWorthSeriesAllTime(entries: IExpenseEntry[], currentBalance: number) {
    const monthly = buildTrend(entries, (d) => d.slice(0, 7), 12);
    const totalMovement = monthly.reduce((s, m) => s + (m.income - m.expense), 0);
    let running = currentBalance - totalMovement;
    return monthly.map((m) => {
        running += m.income - m.expense;
        return { day: m.label.slice(5), netWorth: running };
    });
}