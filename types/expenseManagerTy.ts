// dashboard\types\expenseManagerTy.ts

import { LucideIcon } from "lucide-react";

export type TrendDirectionTy = "up" | "down";
export type StatChipVariantTy = "green" | "blue" | "purple" | "red";

export type TrendDirection = TrendDirectionTy;
export type StatChipVariant = StatChipVariantTy;

export interface IExpenseStatItem {
  id: string;
  title: string;
  value: string;          // pre-formatted currency string from backend/formatter,
  // not a raw number, currency formatting is a display
  // concern, keep it out of the component's render logic
  trendDirection: TrendDirectionTy;
  trendPercent: number;    // e.g. 16, 2, 23, 4, sign is implied by trendDirection
  trendLabel: string;      // "Increase since last month."
  isPositive: boolean; // NEW — whether the trend is good news; independent of arrow direction
  icon: LucideIcon;
  chip: StatChipVariantTy;
}

export type EntryKind = "expense" | "income" | "debt";

export interface ICategory {
  id: string;
  label: string;
  kind: EntryKind;
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
  debtDirection?: DebtDirection;
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

export const KHATA_LABELS: Record<EntryKind, {
  title: string;
  verb: string;
  noun: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  categoryHint: string;
  cardLabel?: string;
}> = {
  income: {
    title: "Total Aamdani",
    verb: "Add Aamdani",
    noun: "Aamdani",
    subjectLabel: "Kis se aamdani? (jaise: Salary, Sales)",
    subjectPlaceholder: "Ahmed se payment",
    categoryHint: "jaise: Salary, Sales",
    cardLabel: "Kis card me jama karein (optional)"
  },
  expense: {
    title: "Total Kharcha",
    verb: "Add Kharcha",
    noun: "Kharcha",
    subjectLabel: "Kis cheez ka kharcha? (jaise: Bijli, Grocery)",
    subjectPlaceholder: "Bijli ka bill",
    categoryHint: "jaise: Food, Rent",
    cardLabel: "Kis card se kharcha karein (optional)"
  },
  debt: {
    title: "Total Udhaar",
    verb: "Add Udhaar",
    noun: "Udhaar",
    subjectLabel: "Kis ka udhaar? (jaise: Ali Bhai, Bank Loan)",
    subjectPlaceholder: "Ali Bhai",
    categoryHint: "Liya ya Diya?",
  },
};

export type DebtDirection = "liya" | "diya";
export const MAX_CARDS = 3;
export const DEBT_CATEGORY_DIRECTION: Record<string, DebtDirection> = {
  "cat-udhaar-liya": "liya",
  "cat-udhaar-diya": "diya",
};
export const DEBT_CARD_LABELS: Record<DebtDirection, string> = {
  liya: "Udhaar kis card me aaya? (card me jama hoga, optional)",
  diya: "Udhaar kis card se diya? (card se kam hoga, optional)",
};