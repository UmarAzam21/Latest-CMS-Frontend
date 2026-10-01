// dashboard\components\user-dashboard\expenseManager\expenseCategory\CategoryRow.tsx

import { ICategoryBreakdownItem } from "@/types/expenseManagerTy";

export default function CategoryRow({ item, index }: { item: ICategoryBreakdownItem; index: number }) {
    const percentage = Math.min(100, item.percentOfTotal);

    return (
        <div className="group border-b border-border-clr py-2.5 first:pt-0 last:border-b-0 last:pb-0x hover:bg-page-bg">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 w-full items-center gap-brand-8">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-page-bg para-tiny font-semibold text-text-secondary-muter">
                        {index + 1}
                    </span>

                    <div className="min-w-0 w-full">
                        <p className="truncate para-tiny font-semibold text-text-secondary">
                            {item.category.label}
                        </p>
                        <div className="mt-1.5 h-1.25 w-full overflow-hidden rounded-full bg-page-bg">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <p className="para-tiny font-semibold text-text-secondary">
                        PKR {item.amount.toLocaleString("en-PK")}
                    </p>
                    <p className="para-tiny text-[11px] text-text-secondary-muter mt-1">
                        {item.percentOfTotal}% of total
                    </p>
                </div>
            </div>
        </div>
    );
}