// components/user-dashboard/expenseManager/TrendChart.tsx
"use client";
import { useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ChevronDown } from "lucide-react";
import { EntryKind } from "@/types/expenseManagerTy";

interface TrendDatum { label: string; expense: number; income: number; debt: number }
type Granularity = "day" | "week" | "month";
type KindFilter = "all" | EntryKind;

interface TrendChartProps {
  title: string;
  dataByGranularity: Record<Granularity, TrendDatum[]>;
  variant?: "bar" | "pie";
}

const KIND_META: Record<EntryKind, { label: string; color: string }> = {
  expense: { label: "Expenses", color: "var(--brand-primary)" },
  income: { label: "Income", color: "var(--brand-secondary)" },
  debt: { label: "Debt", color: "var(--status-warning)" },
};

// Minimal, on-brand palette — tints of brand-primary/secondary, no arbitrary hex.
const PIE_PALETTE = [
  "var(--brand-primary)",
  "color-mix(in srgb, var(--brand-primary) 65%, white)",
  "var(--brand-secondary)",
  "color-mix(in srgb, var(--brand-secondary) 60%, white)",
  "color-mix(in srgb, var(--text-secondary-muter) 55%, white)",
];

function formatTick(label: string, g: Granularity) {
  if (g === "month") { const [y, m] = label.split("-"); return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-GB", { month: "short" }); }
  if (g === "week") return label; // "2026-W37" is already compact
  return new Date(label).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function GranularitySelect({ value, onChange }: { value: Granularity; onChange: (g: Granularity) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value as Granularity)}
        className="appearance-none rounded-brand-8 border border-border-clr bg-white px-3 py-1.5 pr-7 para-tiny font-semibold text-text-secondary outline-none focus:border-primary">
        <option value="day">Daily</option>
        <option value="week">Weekly</option>
        <option value="month">Monthly</option>
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary-muter" />
    </div>
  );
}

export default function TrendChart({ title, dataByGranularity, variant = "bar" }: TrendChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const data = dataByGranularity[granularity];

  if (!data || data.length === 0) {
    return (
      <div className="rounded-brand-16 border border-dashed border-border-clr-dark bg-white p-5">
        <h3 className="heading-h5 mb-4 text-text-dark">{title}</h3>
        <p className="para-small text-text-secondary-muted">No entries recorded yet for this period.</p>
      </div>
    );
  }

  if (variant === "pie") {
    const total = data.reduce((s, d) => s + d.expense, 0);
    return (
      <div className="rounded-brand-16 border border-border-clr bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="heading-h5 text-text-dark">{title}</h3>
          <GranularitySelect value={granularity} onChange={setGranularity} />
        </div>
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={data} dataKey="expense" nameKey="label" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={3} cornerRadius={6} stroke="none">
                {data.map((_, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString("en-PK")}`, "Spent"]} labelFormatter={(v) => formatTick(v as string, granularity)}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--border-clr)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="para-tiny text-text-secondary-muter">Total</span>
            <span className="heading-h5 text-text-dark">PKR {total.toLocaleString("en-PK")}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-1.5 para-tiny text-text-secondary">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_PALETTE[i % PIE_PALETTE.length] }} />
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
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="heading-h5 text-text-dark">{title}</h3>
        <div className="flex gap-2">
          <GranularitySelect value={granularity} onChange={setGranularity} />
          <div className="relative">
            <select value={kindFilter} onChange={(e) => setKindFilter(e.target.value as KindFilter)}
              className="appearance-none rounded-brand-8 border border-border-clr bg-white px-3 py-1.5 pr-7 para-tiny font-semibold text-text-secondary outline-none focus:border-primary">
              <option value="all">All</option><option value="expense">Expenses</option><option value="income">Income</option><option value="debt">Debt</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary-muter" />
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-clr)" />
          <XAxis dataKey="label" tickFormatter={(v) => formatTick(v, granularity)} tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-secondary-muter)" }} />
          <Tooltip labelFormatter={(v) => formatTick(v as string, granularity)}
            formatter={(v, n) => [`PKR ${Number(v ?? 0).toLocaleString("en-PK")}`, KIND_META[n as EntryKind]?.label ?? n]}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border-clr)" }} />
          {kindsToShow.map((k) => <Bar key={k} dataKey={k} fill={KIND_META[k].color} radius={[6, 6, 0, 0]} name={k} />)}
        </BarChart>
      </ResponsiveContainer>
      {kindFilter === "all" && (
        <div className="mt-3 flex justify-center gap-4">
          {kindsToShow.map((k) => <span key={k} className="flex items-center gap-1.5 para-tiny text-text-secondary"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: KIND_META[k].color }} />{KIND_META[k].label}</span>)}
        </div>
      )}
    </div>
  );
}