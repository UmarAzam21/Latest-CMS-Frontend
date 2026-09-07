"use client";

import { useMemo } from 'react';
import { TrendingUp, MessageSquare, Zap, Users } from 'lucide-react';
import RecentActivity from "@/components/dashboard/Activity";
import SiteVisitorsChart from "@/components/dashboard/Chart";
import QuickAccess from "@/components/dashboard/QuickAccess";
import { useDashboardStats } from '@/lib/useDashboardStats';

export default function DashboardOverviewPage() {
  const { stats, loading, error } = useDashboardStats();

  // Transform API stats into card format
  const statsCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: 'Total Pages',
        value: stats.total_pages || 0,
        change: 'Pages published',
        icon: TrendingUp,
        iconBg: '#FEF2F2',
        iconColor: '#c8102e',
      },
      {
        title: 'New Messages',
        value: stats.new_messages || 0,
        change: 'Unread messages',
        icon: MessageSquare,
        iconBg: '#F0F9FF',
        iconColor: '#0EA5E9',
      },
      {
        title: 'SEO Health',
        value: `${stats.seo_health_score || 0}%`,
        change: 'Score',
        icon: Zap,
        iconBg: '#FFFBEB',
        iconColor: '#F59E0B',
      },
      {
        title: 'Users',
        value: stats.admin_leads || 0,
        change: 'Active users',
        icon: Users,
        iconBg: '#F0FDF4',
        iconColor: '#22C55E',
      },
    ];
  }, [stats]);

  return (
    <div>
      <div className="h-[65px] border-b border-slate-200">
        <span className="text-xs text-[#4B5563]">Hi,</span>
        <h1 className="text-lg font-bold">
          Welcome Back, <span className="text-primary">Admin!</span>
        </h1>
      </div>

      {error && (
        <div className="my-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="h-[129px] flex items-end gap-3">
        {statsCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="w-[281px] h-[106px] bg-white rounded-lg border border-slate-300 flex justify-between items-start p-4"
            >
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#4B5563]">
                  {card.title}
                </span>

                <span className="text-xl font-semibold">
                  {loading ? '-' : card.value}
                </span>

                <span className="text-[11px] font-semibold text-[#4B5563]">
                  {card.change}
                </span>
              </div>

              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: card.iconBg }}
              >
                <Icon size={20} strokeWidth={1.8} style={{ color: card.iconColor }} />
              </div>
            </div>
          );
        })}
      </div>

    <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
  <div className="h-full lg:col-span-2">
    <SiteVisitorsChart stats={stats} loading={loading} />
  </div>
  <div className="h-full">
    <RecentActivity stats={stats} loading={loading} />
  </div>
</div>
 
<div className="mt-6">
  
        <div className="mb-3 flex items-center justify-between">
            <h1 className="text-sm font-bold">Quick Access</h1>
        </div>
  <QuickAccess />
</div>

    </div>
  );
}