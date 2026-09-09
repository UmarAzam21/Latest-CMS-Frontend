import { IconType } from "react-icons";
import { LucideIcon } from "lucide-react";

export interface IExpenseManagerStatsDataItem {
    title: string;
    value: number;
    change: string;
    changeIcon: LucideIcon | IconType;
    icon: any;
    iconBg: string;
    iconColor: string;
}

export const expenseManagerStatsData: IExpenseManagerStatsDataItem[] = [
    {
        title: 'Total Budget',
        value: 10000,
        change: 'Increase since last month',
        icon: Check,
        iconBg: '#FEF2F2',
        iconColor: '#c8102e',
    },
    {
        title: 'Monthly Income',
        value: 10000,
        change: 'Decrease since last month',
        icon: MessageSquare,
        iconBg: '#FFFBEB',
        iconColor: '#F59E0B',
    },
    {
        title: 'Monthly Expenses',
        value: 10000,
        change: 'Increase since last month',
        icon: Calendar,
        iconBg: '#FFFBEB',
        iconColor: '#c8102e',
    },
    {
        title: 'Total Debt',
        value: 10000,
        change: 'Decrease since last month',
        icon: Zap,
        iconBg: '#FFFBEB',
        iconColor: '#F59E0B',
    },
];