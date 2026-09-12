import { expenseEntriesData } from "@/data/user-dashboard/expenseEntriesData";
import { cn } from "@/lib/cn";

function formatCurrency(v: number) {
    return `PKR ${v.toLocaleString("en-PK")}`;
}

export default function RecentExpensesTable() {
    return (
        <div className="rounded-brand-16 border border-border-clr bg-card-bg-clr p-5">
            <h3 className="heading-h5 mb-4 text-text-dark">Recent Activity</h3>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border-clr para-tiny uppercase text-text-secondary-muter">
                        <th className="pb-2 text-left font-semibold">Subject</th>
                        <th className="pb-2 text-left font-semibold">Category</th>
                        <th className="pb-2 text-left font-semibold">Date</th>
                        <th className="pb-2 text-right font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {expenseEntriesData.map((entry) => (
                        <tr key={entry.id} className="border-b border-border-clr last:border-0">
                            <td className="py-3 para-small text-text-dark">{entry.subject}</td>
                            <td className="py-3">
                                <span className="rounded-full bg-page-bg px-2 py-0.5 para-tiny capitalize text-text-secondary">
                                    {entry.category}
                                </span>
                            </td>
                            <td className="py-3 para-small text-text-secondary-muted">
                                {new Date(entry.date).toLocaleDateString("en-GB")}
                            </td>
                            <td
                                className={cn(
                                    "py-3 text-right para-small font-semibold",
                                    entry.kind === "income" ? "text-success" : "text-text-dark"
                                )}
                            >
                                {entry.kind === "income" ? "+" : "-"}{formatCurrency(entry.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}