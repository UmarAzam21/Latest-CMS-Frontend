import { categoryBreakdownData } from "@/data/user-dashboard/expenseEntriesData";

export default function CategoryBreakdown() {
    return (
        <div className="rounded-brand-16 border border-border-clr bg-card-bg-clr p-5">
            <h3 className="heading-h5 mb-4 text-text-dark">Spending by Category</h3>
            <div className="flex flex-col gap-3.5">
                {categoryBreakdownData.map((item) => (
                    <div key={item.category}>
                        <div className="mb-1 flex items-center justify-between para-small text-text-secondary">
                            <span>{item.label}</span>
                            <span className="font-semibold text-text-dark">
                                PKR {item.amount.toLocaleString("en-PK")}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-page-bg">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${item.percentOfTotal}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}