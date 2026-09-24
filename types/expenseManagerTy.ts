// dashboard\types\expenseManagerTy.ts

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
  isPositive: boolean; // NEW — whether the trend is good news; independent of arrow direction
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
  cardId?: string; // NEW — persisted so edit/delete can reconcile card balance
  kind: EntryKind;
  subject: string;
  categoryId: string;      // references ICategory.id — not a hardcoded string
  amount: number;
  date: string;             // ISO string
  description?: string;
  receiptImage?: string;    // object URL / base64 for now — see note below
  // debt-specific, optional so expense/income entries ignore it
  isSettled?: boolean;
  originalAmount?: number;
}

export type SortField = "date" | "amount" | "subject";
export type SortDirection = "asc" | "desc";

export interface ICategoryBreakdownItem {
  category: ICategory;
  amount: number;
  percentOfTotal: number;
}

export interface IExpenseManagerSummary {
  isSetup: boolean;
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  linkedAccountLast4: string;
  asOfLabel: string;
}

export interface ICard {
  id: string;
  label: string;
  balance: number;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  gradient: "primary" | "secondary" | "dark";
}

export type FilterTab = "all" | EntryKind;

// Human-facing labels only — internal kind values (expense/income/debt) stay
// English so all existing code (filters, badges, schemas) is untouched.
// export const KHATA_LABELS: Record<EntryKind, { title: string; verb: string; noun: string }> = {
//   income: { title: "Total Aamdani", verb: "Add Aamdani", noun: "Aamdani" },
//   expense: { title: "Total Kharcha", verb: "Add Kharcha", noun: "Kharcha" },
//   debt: { title: "Total Udhaar", verb: "Add Udhaar", noun: "Udhaar" },
// };

export const KHATA_LABELS: Record<EntryKind, { title: string; verb: string; noun: string; subjectLabel: string }> = {
  income: { title: "Total Aamdani", verb: "Add Aamdani", noun: "Aamdani", subjectLabel: "Kis se aamdani?" },
  expense: { title: "Total Kharcha", verb: "Add Kharcha", noun: "Kharcha", subjectLabel: "Kis cheez ka kharcha?" },
  debt: { title: "Total Udhaar", verb: "Add Udhaar", noun: "Udhaar", subjectLabel: "Kis ka udhaar?" },
};