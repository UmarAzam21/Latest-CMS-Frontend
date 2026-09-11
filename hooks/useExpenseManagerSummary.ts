import { useState } from "react";
import { IExpenseManagerSummary } from "@/types/expenseManager";
import { expenseManagerSummaryData, expenseManagerSummaryDataEmpty } from "@/data/user-dashboard/expenseManagerSummaryData";

// Shape matches useDashboardStats intentionally — same loading/error contract
// so this can be swapped for a real fetch without touching the component.
export function useExpenseManagerSummary() {
  const [summary] = useState<IExpenseManagerSummary>(expenseManagerSummaryData);
  // const [summary] = useState<IExpenseManagerSummary>(expenseManagerSummaryDataEmpty);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { summary, loading, error };
}