// dashboard\components\user-dashboard\expenseManager\expenseCategory\CategoryBreakdown.tsx

import { ICategoryBreakdownItem } from "@/types/expenseManagerTy";
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import CategoryRow from "./CategoryRow";
import AllCategoriesDialog from "./AllCategoriesDialog";
import { useState } from "react";

interface CategoryBreakdownProps {
  data: ICategoryBreakdownItem[];
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {

  if (data.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-brand-8 bg-page-bg">
            <BarChart3 size={16} className="text-text-secondary" />
          </div>

          <div>
            <h3 className="heading-h6 text-sm text-text-secondary">
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

            <p className="para-tiny font-medium text-text-secondary">
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
    (sum, item) => sum + item.amount, 0
  );

  const topCategory = sorted[0];
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div>
            <h3 className="para-small font-semibold mb-0.5">
              Spending by Category
            </h3>

            <p className="para-tiny text-text-secondary-muter">
              {sorted.length} categories
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="para-tiny text-text-secondary-muter mb-0.5">
            Total spending
          </p>

          <h3 className="mt-0.5 para-small font-bold text-text-secondary">
            PKR {total.toLocaleString("en-PK")}
          </h3>
        </div>
      </div>

      {/* Top category highlight */}
      <div className="mt-3 flex items-center justify-between rounded-brand-10 bg-page-bg p-2 rounded-brand-8">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
            <ArrowUpRight
              size={13}
              className="text-primary"
            />
          </div>

          <div className="min-w-0">
            <p className="para-tiny text-[11px] uppercase tracking-wide text-text-secondary-muter">
              Highest spending
            </p>

            <p className="truncate para-tiny font-semibold text-text-secondary mt-0.5">
              {topCategory.category.label}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="para-tiny font-bold text-text-secondary">
            PKR {topCategory.amount.toLocaleString("en-PK")}
          </p>

          <p className="para-tiny font-medium text-primary mt-0.5">
            {topCategory.percentOfTotal}%
          </p>
        </div>
      </div>

      {/* Categories lists */}
      <div className="mt-brand-12 flex flex-col">
        {sorted.slice(0, 4).map((item, index) => (
          <CategoryRow
            key={item.category.id}
            item={item}
            index={index}
          />
        ))}
      </div>

      {sorted.length > 3 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 self-center para-tiny font-semibold text-primary hover:underline cursor-pointer"
        >
          See more ({sorted.length - 3} more)
        </button>
      )}

      <AllCategoriesDialog
        open={showAll}
        onOpenChange={setShowAll}
        sorted={sorted}
        total={total}
      />

    </div>
  );
}