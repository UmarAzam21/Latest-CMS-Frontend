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

export type EntryKind = "expense" | "income" | "debt";

export interface ICategory {
  id: string;
  label: string;
  color: "primary" | "secondary" | "warning" | "info" | "danger" | "neutral";
}

export interface IExpenseEntry {
  id: string;
  kind: EntryKind;
  subject: string;
  categoryId: string;      // references ICategory.id — not a hardcoded string
  amount: number;
  date: string;             // ISO string
  description?: string;
  receiptImage?: string;    // object URL / base64 for now — see note below
  // debt-specific, optional so expense/income entries ignore it
  isSettled?: boolean;
}

export type SortField = "date" | "amount" | "subject";
export type SortDirection = "asc" | "desc";

export interface ICategoryBreakdownItem {
  category: ICategory;
  label: string;
  amount: number;
  percentOfTotal: number; // server-computed, same rule as completionPercent elsewhere
}