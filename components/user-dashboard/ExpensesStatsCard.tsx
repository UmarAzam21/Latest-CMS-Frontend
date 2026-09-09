import { expenseStatsData } from "@/data/user-dashboard/expenseStatsData";
import ExpenseStatCard from "./ExpensesStatCard";

export default function ExpensesStatsCard() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {expenseStatsData.map((item) => (
                <ExpenseStatCard key={item.id} item={item} />
            ))}
        </div>
    );
}