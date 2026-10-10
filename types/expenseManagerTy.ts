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
  time?: string;
  description?: string;
  receiptImage?: string;    // object URL / base64 for now — see note below
  // debt-specific, optional so expense/income entries ignore it
  // debtDirection?: DebtDirection;
  // isSettled?: boolean;
  // originalAmount?: number;
  partyId?: string;
  createdAt?: string; // ISO timestamp, orders same-day entries in ledgers
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
    // categoryHint: "Liya ya Diya?",
    categoryHint: "Udhaar ki qism",
  },
};

export const MAX_CARDS = 3;

// export type DebtDirection = "liya" | "diya";
// export const DEBT_CATEGORY_DIRECTION: Record<string, DebtDirection> = {
//   "cat-udhaar-liya": "liya",
//   "cat-udhaar-diya": "diya",
// };
// export const DEBT_CARD_LABELS: Record<DebtDirection, string> = {
//   liya: "Udhaar kis card me aaya? (card me jama hoga, optional)",
//   diya: "Udhaar kis card se diya? (card se kam hoga, optional)",
// };

export type DebtType = "liya" | "diya" | "liya_wapis_diya" | "diya_wapis_liya" | "liya_maaf" | "diya_maaf";

// SINGLE source of truth for debt categories. sign: +1 = party owes me more, -1 = I owe more.
// Example: If you borrow money (liya), your balance drops (-1). When you repay them (liya_wapis_diya), your balance goes back up (+1) to neutralise the debt.
export const DEBT_TYPE_META: Record<
  DebtType,
  {
    categoryId: string;
    label: string;
    sign: 1 | -1;
    color: ICategory["color"];
  }
> = {
  liya: {
    categoryId: "cat-udhaar-liya",
    label: "Udhaar liya",
    sign: -1,
    color: "danger"
  },
  diya: {
    categoryId: "cat-udhaar-diya",
    label: "Udhaar diya",
    sign: 1,
    color: "info"
  },
  liya_wapis_diya: {
    categoryId: "cat-udhaar-liya-wapis-diya",
    label: "Liya udhaar wapis diya",
    sign: 1,
    color: "warning"
  },
  diya_wapis_liya: {
    categoryId: "cat-udhaar-diya-wapis-liya",
    label: "Diya udhaar wapis liya",
    sign: -1,
    color: "secondary"
  },
  liya_maaf: {
    categoryId: "cat-udhaar-liya-maaf",
    label: "Liya udhaar maaf hua",
    sign: 1,
    color: "neutral"
  },
  diya_maaf: {
    categoryId: "cat-udhaar-diya-maaf",
    label: "Diya udhaar maaf kiya",
    sign: -1,
    color: "neutral"
  },
};

export const DEBT_CATEGORY_TYPE: Record<string, DebtType> = Object.fromEntries(
  (
    Object.entries(DEBT_TYPE_META) as [
      DebtType,
      (typeof DEBT_TYPE_META)[DebtType]
    ][]
  ).map(([t, m]) => [m.categoryId, t])
);

// export type PartyType = "customer" | "supplier" | "bank";
export const PARTY_TYPES = ["customer", "supplier"] as const;
export type PartyType = (typeof PARTY_TYPES)[number];
export const PARTY_TYPE_LABELS: Record<PartyType, string> = { customer: "Customer", supplier: "Supplier" };
export interface IParty {
  id: string;
  slug: string; // used in URLs, e.g. "ali-ashraf-3fa9c"
  name: string;
  phone?: string;
  type: PartyType;
  createdAt: string;
  reminderDate?: string; // YYYY-MM-DD
}

export const DEBT_TYPE_HINTS: Record<DebtType, string> = {
  liya: "Aap ne udhaar liya, paise aap ko mile. (You Got)",
  diya: "Aap ne udhaar diya, paise aap ne diye. (You Gave)",
  liya_wapis_diya: "Aap ne liya hua udhaar wapis kiya. (You Gave)",
  diya_wapis_liya: "Aap ka diya hua udhaar wapis mila. (You Got)",
  liya_maaf: "Samne wale ne aap ka liya hua udhaar maaf kar diya. Cash nahi hilta.",
  diya_maaf: "Aap ne diya hua udhaar maaf kar diya. Cash nahi hilta.",
};