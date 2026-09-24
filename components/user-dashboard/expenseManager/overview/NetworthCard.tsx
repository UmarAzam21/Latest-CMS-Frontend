"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RangeFilter } from "@/lib/utils/overviewMetrics";

function fmt(v: number) {
  return `PKR ${v.toLocaleString("en-PK")}`;
}

interface NetWorthCardProps {
  chartData: { day: string; netWorth: number }[];
  income: number;
  expenses: number;
  balance: number;
  range: RangeFilter;
  onRangeChange: (r: RangeFilter) => void;
  monthLabel: string;
}

export default function NetworthCard({
  chartData,
  income,
  expenses,
  balance,
  range,
  onRangeChange,
  monthLabel,
}: NetWorthCardProps) {
  const [metric, setMetric] = useState<"netWorth" | "income" | "expenses">("netWorth");
  const [rangeOpen, setRangeOpen] = useState(false);

  const tabs = [
    { key: "netWorth" as const, label: "Net Worth", value: balance },
    { key: "income" as const, label: "Income", value: income },
    { key: "expenses" as const, label: "Expenses", value: expenses },
  ];

  const active = tabs.find((t) => t.key === metric)!;

  return (
    <div className="h-full rounded-brand-16 border border-border-clr bg-whitex bg-page-bg p-brand-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          {/* tabs */}
          <div className="inline-flex items-center gap-1 rounded-brand-8 bg-page-bgx bg-white p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setMetric(t.key)}
                className={`rounded-brand-8 px-3 py-1.5 para-tiny font-semibold default-transition ${metric === t.key
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-dark"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* amount */}
          <p className="mt-3 heading-h6 text-text-dark">{fmt(active.value)}</p>

          <p className="mt-1 para-tiny text-text-secondary-muter">
            Income <span className="font-semibold text-success">{fmt(income)}</span> ·{" "}
            Expenses <span className="font-semibold text-danger">{fmt(expenses)}</span>
          </p>
        </div>

        {/* month dropdown */}
        <div className="relative">
          <button
            onClick={() => setRangeOpen((o) => !o)}
            className="flex items-center gap-1 rounded-brand-8 border border-border-clr px-2.5 py-1.5 bg-white para-tiny text-text-secondary hover:border-primary hover:text-primary"
          >
            {range === "month" ? monthLabel : "All time"} <ChevronDown size={13} />
          </button>

          {rangeOpen && (
            <div className="absolute right-0 z-dropdown mt-1 min-w-full rounded-brand-8 border border-border-clr bg-white p-1 shadow-card-hover">
              {([
                ["month", monthLabel],
                ["all", "All time"],
              ] as const).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => {
                    onRangeChange(v);
                    setRangeOpen(false);
                  }}
                  className={`block w-full whitespace-nowrap rounded-brand-8 px-3 py-2 text-left para-tiny ${range === v
                      ? "bg-primary font-semibold text-white"
                      : "text-text-secondary hover:bg-page-bg"
                    }`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 8, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="var(--border-clr)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              interval={Math.ceil(chartData.length / 8)}
              tick={{ fontSize: 10, fill: "var(--text-secondary-muter)" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis hide domain={["dataMin - 2000", "dataMax + 2000"]} />

            <Tooltip
              formatter={(v) => fmt(Number(v))}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border-clr)",
                fontSize: 12,
              }}
            />

            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="var(--brand-primary)"
              strokeWidth={2.5}
              fill="url(#netWorthFill)"
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
