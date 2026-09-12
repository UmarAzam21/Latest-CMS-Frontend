// components/user-dashboard/expenseManager/MonthlyTrendChart.tsx
"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface MonthlyTrendChartProps {
    data: { date: string; amount: number }[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
    return (
        <div className="rounded-brand-16 border border-border-clr bg-card-bg-clr p-5">
            <h3 className="heading-h5 mb-4 text-text-dark">Daily Expenses (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-clr)" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }} />
                    <Tooltip
                        formatter={(value: number) => [`PKR ${value.toLocaleString("en-PK")}`, "Spent"]}
                        contentStyle={{ borderRadius: 12, border: "1px solid var(--border-clr)" }}
                    />
                    <Bar dataKey="amount" fill="var(--brand-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}