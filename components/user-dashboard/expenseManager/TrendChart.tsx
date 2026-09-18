// components/user-dashboard/expenseManager/TrendChart.tsx
"use client";

import { useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronDown } from "lucide-react";
import { EntryKind } from "@/types/expenseManager";

interface TrendDatum {
  label: string;
  expense: number;
  income: number;
  debt: number;
}

interface TrendChartProps {
  title: string;
  data: TrendDatum[];
  granularity: "day" | "month";
  variant?: "bar" | "pie";
}

type KindFilter = "all" | EntryKind;

const KIND_META: Record<EntryKind, { label: string; color: string }> = {
  expense: { label: "Expenses", color: "var(--brand-primary)" },
  income: { label: "Income", color: "var(--brand-secondary)" },
  debt: { label: "Debt", color: "var(--status-warning)" },
};

const PIE_COLORS = ["#C8102E", "#34B08D", "#7C3AED", "#2563EB", "#F59E0B", "#DC2626"];

function formatTick(label: string, granularity: "day" | "month") {
  if (granularity === "month") {
    const [year, month] = label.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-GB", { month: "short" });
  }
  return new Date(label).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export default function TrendChart({ title, data, granularity, variant = "bar" }: TrendChartProps) {
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  if (data.length === 0) {
    return (
      <div className="rounded-brand-16 border border-dashed border-border-clr-dark bg-white p-5">
        <h3 className="heading-h5 mb-4 text-text-dark">{title}</h3>
        <p className="para-small text-text-secondary-muted">No entries recorded yet for this period.</p>
      </div>
    );
  }

  if (variant === "pie") {
    const totalExpense = data.reduce((s, d) => s + d.expense, 0);

    return (
      <div className="rounded-brand-16 border border-border-clr bg-white p-5">
        <h3 className="heading-h5 mb-4 text-text-dark">{title}</h3>
        <div className="relative">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="expense"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
                cornerRadius={6}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`PKR ${Number(value ?? 0).toLocaleString("en-PK")}`, "Spent"]}
                labelFormatter={(v) => formatTick(v as string, granularity)}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--border-clr)", boxShadow: "0 4px 16px -4px rgba(17,17,17,0.12)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="para-tiny text-text-secondary-muter">Total</span>
            <span className="heading-h5 text-text-dark">PKR {totalExpense.toLocaleString("en-PK")}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-1.5 para-tiny text-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span>{formatTick(d.label, granularity)}</span>
              <span className="ml-auto font-semibold text-text-dark">PKR {d.expense.toLocaleString("en-PK")}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kindsToShow: EntryKind[] = kindFilter === "all" ? ["expense", "income", "debt"] : [kindFilter];

  return (
    <div className="rounded-brand-16 border border-border-clr bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="heading-h5 text-text-dark">{title}</h3>
        <div className="relative">
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as KindFilter)}
            className="appearance-none rounded-brand-8 border border-border-clr bg-white px-3 py-1.5 pr-7 para-tiny font-semibold text-text-secondary outline-none focus:border-primary"
          >
            <option value="all">All</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
            <option value="debt">Debt</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary-muter" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={330}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-clr)" />
          <XAxis dataKey="label" tickFormatter={(v) => formatTick(v, granularity)} tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }} />
          <Tooltip
            labelFormatter={(v) => formatTick(v as string, granularity)}
            formatter={(value, name) => [`PKR ${Number(value ?? 0).toLocaleString("en-PK")}`, KIND_META[name as EntryKind]?.label ?? name]}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border-clr)" }}
          />
          {kindsToShow.map((k) => <Bar key={k} dataKey={k} fill={KIND_META[k].color} radius={[6, 6, 0, 0]} name={k} />)}
        </BarChart>
      </ResponsiveContainer>
      {kindFilter === "all" && (
        <div className="mt-3 flex justify-center gap-4">
          {kindsToShow.map((k) => (
            <span key={k} className="flex items-center gap-1.5 para-tiny text-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: KIND_META[k].color }} />
              {KIND_META[k].label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
