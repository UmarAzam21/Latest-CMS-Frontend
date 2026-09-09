import { LucideIcon } from "lucide-react";

export type TrendDirection = "up" | "down";
export type StatChipVariant = "green" | "blue" | "purple" | "red";

export interface IExpenseStatItem {
    id: string;
    title: string;
    value: string;          // pre-formatted currency string from backend/formatter,
    // not a raw number, currency formatting is a display
    // concern, keep it out of the component's render logic
    trendDirection: TrendDirection;
    trendPercent: number;    // e.g. 16, 2, 23, 4, sign is implied by trendDirection
    trendLabel: string;      // "Increase since last month."
    icon: LucideIcon;
    chip: StatChipVariant;
}