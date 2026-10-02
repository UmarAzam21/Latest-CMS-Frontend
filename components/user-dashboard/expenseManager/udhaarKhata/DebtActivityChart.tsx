"use client";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChevronDown, BarChart3 } from "lucide-react";
import { IExpenseEntry } from "@/types/expenseManagerTy";
import { buildDebtTrend, weekKey } from "@/lib/utils/trend";

type Granularity = "day" | "week" | "month";

function formatTick(label: string, g: Granularity) {
    if (g === "month") {
        const [y, m] = label.split("-");
        return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-GB", {
            month: "short"
        });
    }
    if (g === "week") {
        return label;
    }
    return new Date(label).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short"
    });
}

function formatAmount(v: number) {
    if (v >= 1_000_000) {
        return `${(v / 1_000_000).toFixed(1)}M`;
    }
    if (v >= 1000) {
        return `${(v / 1000).toFixed(0)}K`;
    }
    return String(v);
}

export default function DebtActivityChart({ entries }: { entries: IExpenseEntry[] }) {
    const [granularity, setGranularity] = useState<Granularity>("week");

    const data = useMemo(() => {
        if (granularity === "day") return buildDebtTrend(entries, (d) => d.slice(0, 10), 7);
        if (granularity === "week") return buildDebtTrend(entries, weekKey, 8);
        return buildDebtTrend(entries, (d) => d.slice(0, 7), 6);
    }, [entries, granularity]);

    if (data.length === 0) {
        return (
            <div className="flex h-full min-h-[255px] flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">
                <div><h3 className="para-small font-semibold text-text-dark">Udhaar Activity</h3><p className="para-tiny text-text-secondary-muter">Liya vs Diya</p></div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-page-bg"><BarChart3 size={18} className="text-text-secondary-muter" /></div>
                        <p className="para-tiny font-medium text-text-secondary">No udhaar activity yet</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="para-small font-semibold text-text-dark">
                        Udhaar Activity
                    </h3>
                    <p className="para-tiny text-text-secondary-muter">Liya vs Diya</p>
                </div>

                <div className="relative">
                    <select
                        value={granularity}
                        onChange={(e) => setGranularity(e.target.value as Granularity)}
                        className="h-7 appearance-none rounded-brand-8 border border-border-clr bg-page-bg pl-2.5 pr-7 para-tiny font-semibold text-text-secondary outline-none focus:border-primary"
                    >
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>

                    <ChevronDown
                        size={11}
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary-muter"
                    />
                </div>
            </div>

            {/* chart */}
            <div className="mt-2 flex-1">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                        data={data}
                        margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
                        barGap={3}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="var(--border-clr)"
                        />
                        <XAxis
                            dataKey="label"
                            tickFormatter={(v) => formatTick(v, granularity)}
                            tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }}
                            axisLine={false}
                            tickLine={false}
                            dy={6}
                        />
                        <YAxis
                            tickFormatter={(v) => formatAmount(Number(v))}
                            tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }}
                            axisLine={false}
                            tickLine={false}
                            width={38}
                        />
                        <Tooltip
                            cursor={{ fill: "var(--page-bg-clr)" }}
                            formatter={(v, name) => [
                                `PKR ${Number(v ?? 0).toLocaleString("en-PK")}`,
                                name === "liya" ? "Udhaar Liya" : "Udhaar Diya"
                            ]}
                            contentStyle={{
                                borderRadius: 10,
                                border: "1px solid var(--border-clr)",
                                fontSize: 12
                            }}
                        />
                        <Bar
                            dataKey="liya"
                            fill="var(--status-info)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={24}
                            name="liya"
                        />
                        <Bar
                            dataKey="diya"
                            fill="var(--status-danger)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={24}
                            name="diya"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-brand-12 border-t border-border-clr/85 pt-brand-8">
                <span className="flex items-center gap-1.5 para-tiny font-medium text-text-secondary-muted">
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: "var(--status-info)" }}
                    />
                    Udhaar Liya
                </span>

                <span className="flex items-center gap-1.5 para-tiny font-medium text-text-secondary-muted">
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: "var(--status-danger)" }}
                    />
                    Udhaar Diya
                </span>
            </div>
        </div>
    );
}