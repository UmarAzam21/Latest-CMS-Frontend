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
        title: 'Legal Cases & Consultancy',
        icon: FileText,
        iconBg: '#F5F3FF',
        iconColor: '#c8102e',
        primary: true,
        actionLabel: 'Let us help you',
      },
    ];
  }, [stats]);
  return (
    <div>
      <div className="h-[65px] border-b border-slate-200">
        <span className="text-xs text-[#4B5563]">Hi,</span>
        <h1 className="text-lg font-bold">
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
          const isPrimaryCard = Boolean(card.primary);

          return (
            <div
              key={index}
              className={`h-[106px]  rounded-lg border p-4 flex justify-between items-start ${
                isPrimaryCard
                  ? 'w-[calc(100%-2*281px)] min-w-[281px] border-[#c8102e]/20 bg-[#fef2f2] text-black'
                  : 'w-[281px] border-slate-300 bg-white text-slate-900'
              }`}
            >
              {isPrimaryCard ? (
                <>
                  <div className="flex w-full items-center justify-between gap-3 ">
                    <div className="flex flex-col  gap-2 ">
                      <img
                        src="/primary-logo.png"
                        alt="Brand logo"
                        className="h-10 w-10 object-contain"
                      />
                      <span className="text-[14px] font-semibold uppercase tracking-wide text-primary">
                        {card.title}
                      </span>
                    </div>

                    {card.actionLabel && (
                      <button
                        type="button"
                        className="inline-flex uppercase items-center rounded-md bg-primary px-5 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        {card.actionLabel}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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