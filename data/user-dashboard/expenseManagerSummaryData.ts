import { IExpenseManagerSummary } from "@/types/expenseManager";

// Static placeholder — backend contract pending. Flagged in
// backend-handoff-dashboard.md: needs GET /api/expense-manager/summary
// returning this exact shape, including `isSetup` so the frontend never
// has to infer setup-state from absence of other fields.
export const expenseManagerSummaryData: IExpenseManagerSummary = {
  isSetup: true,
  balance: 177500,
  totalIncome: 320000,
  totalExpenses: 142500,
  linkedAccountLast4: "4821",
  asOfLabel: "Synced 2 hours ago",
};

// Swap `expenseManagerSummaryData` for this to preview/test the empty state
// until the real hook can report isSetup: false from the backend.
export const expenseManagerSummaryDataEmpty: IExpenseManagerSummary = {
  isSetup: false,
  balance: 0,
  totalIncome: 0,
  totalExpenses: 0,
  linkedAccountLast4: "",
  asOfLabel: "",
};