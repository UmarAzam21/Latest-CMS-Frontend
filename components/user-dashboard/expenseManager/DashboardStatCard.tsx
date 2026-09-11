"use client"

import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useMemo } from "react";
import { TrendingUp, MessageSquare, Zap, Users, Check, Calendar, FileText } from 'lucide-react';

type Props = {}

const DashboardStatCard = (props: Props) => {

    const { stats, loading, error } = useDashboardStats();

    const statsCards = useMemo(() => {
        if (!stats) return [];

        return [
            {
                title: 'Total Budjet',
                value: stats.active_services || 0,
                change: 'Increase since last month',
                icon: Check,
                iconBg: '#FEF2F2',
                iconColor: '#c8102e',
            },
            {
                title: 'Monthly Income',
                value: stats.pending_queries || 0,
                change: 'Decrease since last month',
                icon: MessageSquare,
                iconBg: '#FFFBEB',
                iconColor: '#F59E0B',
            },
            {
                title: 'Monthly Expenses',
                value: stats.upcoming_deadlines || 0,
                change: 'Increase since last month',
                icon: Calendar,
                iconBg: '#FFFBEB',
                iconColor: '#c8102e',
            },
            {
                title: 'Total Debt',
                value: stats.forms_in_progress || 0,
                change: 'Decrease since last month',
                icon: Zap,
                iconBg: '#FFFBEB',
                iconColor: '#F59E0B',
            },
        ];
    }, [stats]);

    return (
        <div className="bg-red-50 flex h-[129px] items-center justify-between gap-3 px-2">
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
    )
}

export default DashboardStatCard