export function buildTrend(entries: { date: string; kind: string; amount: number }[], keyFn: (d: string) => string, limit: number) {
    const map = new Map<string, { expense: number; income: number; debt: number }>();
    entries.forEach((e) => {
        const key = keyFn(e.date);
        const b = map.get(key) ?? { expense: 0, income: 0, debt: 0 };
        (b as any)[e.kind] += e.amount;
        map.set(key, b);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-limit).map(([label, v]) => ({ label, ...v }));
}

export function weekKey(dateStr: string) {
    const d = new Date(dateStr);
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}