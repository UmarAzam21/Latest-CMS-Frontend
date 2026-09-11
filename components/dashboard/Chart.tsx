"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardStats } from "@/hooks/useDashboardStats";

const defaultData = [
  { day: "Mon", users: 400 },
  { day: "Tue", users: 580 },
  { day: "Wed", users: 510 },
  { day: "Thu", users: 670 },
  { day: "Fri", users: 730 },
  { day: "Sat", users: 400 },
  { day: "Sun", users: 290 },
];

interface SiteVisitorsChartProps {
  stats?: DashboardStats | null;
  loading?: boolean;
}

export default function SiteVisitorsChart({ stats, loading }: SiteVisitorsChartProps) {
  // Generate chart data based on admin_leads total if backend doesn't provide daily breakdown
  const generateChartData = () => {
    if (stats?.users_chart_data) {
      return stats.users_chart_data;
    }

    const total = stats?.admin_leads || 0;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Distribute users across the week with some variation
    const basePerDay = Math.floor(total / 7);
    const remainder = total % 7;

    return days.map((day, index) => ({
      day,
      users: basePerDay + (index < remainder ? 1 : 0),
    }));
  };

  const displayData = generateChartData();

  // Calculate dynamic Y-axis domain
  const maxUsers = Math.max(...displayData.map(d => d.users || 0), 1);
  const yAxisMax = Math.ceil(maxUsers * 1.3); // Add 30% padding at top
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => Math.round((yAxisMax / 4) * i));

  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Users</h3>
          <p className="text-sm text-slate-500">Last 7 days</p>
        </div>

        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
          {loading ? '-' : '+12.4%'}
        </span>
      </div>

      {/* Chart */}
      <div className="mt-6 h-[220px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500">Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8102E" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#C8102E" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                domain={[0, yAxisMax]}
                ticks={yAxisTicks}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#334155", fontWeight: 600 }}
              />

              <Area
                type="monotone"
                dataKey="users"
                stroke="#C8102E"
                strokeWidth={2.5}
                fill="url(#usersGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}