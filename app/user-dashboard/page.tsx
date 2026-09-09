"use client";

import { useMemo } from 'react';
import { TrendingUp, MessageSquare, Zap, Users, Check, Calendar, FileText } from 'lucide-react';
import DraftServices from '@/components/user-dashboard/DraftService';
import { useDashboardStats } from '@/lib/useDashboardStats';
import ExpenseManagerCard from '@/components/user-dashboard/ExpenseManager';
import MajorServices from '@/components/user-dashboard/MajorServices';

export default function DashboardOverviewPage() {
  const { stats, loading, error } = useDashboardStats();

  const statsCards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: 'Active Services',
        value: stats.active_services || 0,
        change: 'Currently enrolled',
        icon: Check,
        iconBg: '#FEF2F2',
        iconColor: '#c8102e',
      },
      {
        title: 'Pending Queries',
        value: stats.pending_queries || 0,
        change: 'Awaiting response',
        icon: MessageSquare,
        iconBg: '#FFFBEB',
        iconColor: '#F59E0B',
      },
      {
        title: 'Upcoming Deadlines',
        value: stats.upcoming_deadlines || 0,
        change: 'Awaiting response',
        icon: Calendar,
        iconBg: '#FFFBEB',
        iconColor: '#c8102e',
      },
      {
        title: 'Forms in Progress',
        value: stats.forms_in_progress || 0,
        change: 'Awaiting response',
        icon: Zap,
        iconBg: '#FFFBEB',
        iconColor: '#F59E0B',
      },
    ];
  }, [stats]);
  return (
    <div>
      <div className="h-[55px] border-b border-slate-200">
        <span className="text-xs text-[#4B5563]">Hi,</span>
        <h1 className="text-md font-bold">
          Welcome Back, <span className="text-primary">User!</span>
        </h1>
      </div>

      {error && (
        <div className="my-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex h-[129px] items-end gap-3">
        {statsCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className={`flex justify-between items-start rounded-lg p-4 h-[106px] w-[281px] border border-slate-300 bg-white text-slate-900`}
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
          <MajorServices />
        </div>
        <div className="h-full">
          <ExpenseManagerCard />
        </div>
      </div>

      <div className="mt-6">

        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-sm font-bold">Quick Access</h1>
        </div>
        <DraftServices variant="user" />
      </div>

    </div>
  );
}