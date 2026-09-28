import { ICategoryBreakdownItem } from "@/types/expenseManagerTy";
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
} from "lucide-react";

interface CategoryBreakdownProps {
  data: ICategoryBreakdownItem[];
}

export default function CategoryBreakdown({
  data,
}: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] flex-col rounded-brand-16 border border-border-clr bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-brand-8 bg-page-bg">
            <BarChart3 size={16} className="text-text-secondary" />
          </div>

          <div>
            <h3 className="heading-h5 text-text-dark">
              Spending by Category
            </h3>
            <p className="para-tiny text-text-secondary-muter">
              Expense distribution
            </p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-page-bg">
              <BarChart3
                size={18}
                className="text-text-secondary-muter"
              />
            </div>

            <p className="para-small font-medium text-text-secondary">
              No expenses yet
            </p>

            <p className="mt-0.5 para-tiny text-text-secondary-muter">
              Your spending breakdown will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.amount - a.amount);

  const total = sorted.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const topCategory = sorted[0];

  return (
    <div className="flex h-full min-h-0 flex-col rounded-brand-16 border border-border-clr bg-white p-3">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">

          <div>
            <h3 className="para-small font-semibold text-text-dark">
              Spending by Category
            </h3>

            <p className="para-tiny text-text-secondary-muter">
              {sorted.length} categories
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-text-secondary-muter">
            Total spending
          </p>

          <p className="mt-0.5 text-sm font-bold text-text-dark">
            PKR {total.toLocaleString("en-PK")}
          </p>
        </div>
      </div>

      {/* Top category highlight */}
      <div className="mt-3 flex items-center justify-between rounded-brand-10 bg-page-bg px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
            <ArrowUpRight
              size={14}
              className="text-primary"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-wide text-text-secondary-muter">
              Highest spending
            </p>

            <p className="truncate text-[11px] font-semibold text-text-dark">
              {topCategory.category.label}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[11px] font-bold text-text-dark">
            PKR {topCategory.amount.toLocaleString("en-PK")}
          </p>

          <p className="text-[9px] font-medium text-primary">
            {topCategory.percentOfTotal}%
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col">
          {sorted.map((item, index) => {
            const percentage = Math.min(
              100,
              item.percentOfTotal
            );

            return (
              <div
                key={item.category.id}
                className="group border-b border-border-clr py-2.5 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-3">

                  {/* Category */}
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-page-bg text-[9px] font-semibold text-text-secondary-muter">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-text-dark">
                        {item.category.label}
                      </p>

                      <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-page-bg">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="text-[11px] font-semibold text-text-dark">
                        PKR {item.amount.toLocaleString("en-PK")}
                      </p>

                      <p className="text-[9px] text-text-secondary-muter">
                        {item.percentOfTotal}% of total
                      </p>
                    </div>

                    <ChevronRight
                      size={13}
                      className="text-text-secondary-muter opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}