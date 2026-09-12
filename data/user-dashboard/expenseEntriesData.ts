import { IExpenseEntry, ICategoryBreakdownItem } from "@/types/expenseManager";

// Static placeholder. Backend contract pending: GET /api/expense-manager/entries
// and POST /api/expense-manager/entries. Flag in backend-handoff-dashboard.md —
// category breakdown percentages must come from the server, not be computed
// client-side from this list, once real data volume makes that unreliable.
export const expenseEntriesData: IExpenseEntry[] = [
    { id: "e1", kind: "expense", subject: "Electricity Bill", category: "utilities", amount: 8500, date: "2026-09-08" },
    { id: "e2", kind: "expense", subject: "Grocery Run", category: "food", amount: 12300, date: "2026-09-07" },
    { id: "e3", kind: "income", subject: "Freelance Payment", category: "business", amount: 65000, date: "2026-09-05" },
    { id: "e4", kind: "expense", subject: "Fuel", category: "transport", amount: 6200, date: "2026-09-04" },
    { id: "e5", kind: "expense", subject: "Office Rent Share", category: "rent", amount: 35000, date: "2026-09-01" },
];

export const categoryBreakdownData: ICategoryBreakdownItem[] = [
    { category: "rent", label: "Rent", amount: 35000, percentOfTotal: 44 },
    { category: "food", label: "Food", amount: 18500, percentOfTotal: 23 },
    { category: "utilities", label: "Utilities", amount: 14200, percentOfTotal: 18 },
    { category: "transport", label: "Transport", amount: 9800, percentOfTotal: 12 },
    { category: "other", label: "Other", amount: 2200, percentOfTotal: 3 },
];