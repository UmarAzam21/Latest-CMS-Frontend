"use client";

import ExpensesStatsCard from "@/components/user-dashboard/expenseManager/ExpensesStatsCard";
import ExpenseManagerCardV2 from "@/components/user-dashboard/expenseManager/ExpenseManagerCardV2";
import NewExpenseDialog from "@/components/user-dashboard/expenseManager/NewExpenseDialog";
import RecentExpensesTable from "@/components/user-dashboard/expenseManager/RecentExpensesTable";
import CategoryBreakdown from "@/components/user-dashboard/expenseManager/CategoryBreakdown";
// import AdvancedExpenseWorkspace from "@/components/user-dashboard/expenseManager/AdvancedExpenseWorkspace";

export default function ExpenseManagerPage() {
    return (
        <div className="flex flex-col gap-5">
            {/* <div className="flex items-center justify-between border-b border-border-clr pb-3">
                <h1 className="heading-h4 text-text-dark">Expense Manager</h1>
                <NewExpenseDialog />
            </div> */}

            {/* <ExpensesStatsCard /> */}

            <div className="w-full">
                <div className="lg:col-span-2">
                    {/* <AdvancedExpenseWorkspace /> */}
                </div>
                {/* <ExpenseManagerCardV2 /> */}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* <RecentExpensesTable />
                <CategoryBreakdown /> */}
            </div>
        </div>
    );
}