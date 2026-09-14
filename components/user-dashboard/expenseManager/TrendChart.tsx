// components/user-dashboard/expenseManager/TrendChart.tsx
"use client";

import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

interface TrendChartProps {
  title: string;
  data: { label: string; amount: number }[];
  granularity: "day" | "month";
  variant?: "bar" | "pie";
}

const PIE_COLORS = ["var(--brand-primary)", "var(--brand-secondary)", "var(--chip-purple)", "var(--chip-blue)", "var(--chip-red)", "var(--chip-green)"];

function formatTick(label: string, granularity: "day" | "month") {
  if (granularity === "month") {
    const [year, month] = label.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-GB", { month: "short" });
  }
  return new Date(label).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function TrendChart({ title, data, granularity, variant = "bar" }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-brand-16 border border-dashed border-border-clr-dark bg-white p-5">
        <h3 className="heading-h5 mb-4 text-text-dark">{title}</h3>
        <p className="para-small text-text-secondary-muted">No expenses recorded yet for this period.</p>
      </div>
    );
  }

  return (
    <div className="rounded-brand-16 border border-border-clr bg-white p-5">
      <h3 className="heading-h5 mb-4 text-text-dark">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        {variant === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              label={(entry) => formatTick(entry.label, granularity)}
              labelLine={false}
            >
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip
              formatter={(value) => [`PKR ${Number(value ?? 0).toLocaleString("en-PK")}`, "Spent"]}
              labelFormatter={(v) => formatTick(v as string, granularity)}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--border-clr)" }}
            />
            <Legend
              formatter={(v) => formatTick(v as string, granularity)}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-clr)" />
            <XAxis dataKey="label" tickFormatter={(v) => formatTick(v, granularity)} tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }} />
            <Tooltip
              labelFormatter={(v) => formatTick(v as string, granularity)}
              formatter={(value) => [`PKR ${Number(value ?? 0).toLocaleString("en-PK")}`, "Spent"]}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--border-clr)" }}
            />
            <Bar dataKey="amount" fill="var(--brand-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}