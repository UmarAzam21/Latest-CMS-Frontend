"use client";

import { MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { IExpenseStatItem, StatChipVariant } from "@/types/expenseManager";

const chipStyles: Record<StatChipVariant, string> = {
  green: "bg-chip-green-bg text-chip-green",
  blue: "bg-chip-blue-bg text-chip-blue",
  purple: "bg-chip-purple-bg text-chip-purple",
  red: "bg-chip-red-bg text-chip-red",
};

interface ExpenseStatCardProps {
  item: IExpenseStatItem;
}

export default function ExpenseStatCard({ item }: ExpenseStatCardProps) {
  const Icon = item.icon;
  const isUp = item.trendDirection === "up";

  return (
    <div className="flex flex-col gap-4 rounded-brand-12 border border-border-clr bg-white p-4 shadow-card cursor-pointer default-transition hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-brand-8",
              chipStyles[item.chip]
            )}
          >
            <Icon size={16} strokeWidth={2} />
          </span>
          <span className="para-small text-text-secondary-muted">{item.title}</span>
        </div>
        <button
          type="button"
          aria-label="More options"
          className="text-text-secondary-muter default-transition hover:text-text-secondary"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <span className="heading-h5 text-text-dark">{item.value}</span>

      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 para-tiny font-semibold",
            isUp ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
          )}
        >
          {isUp ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {item.trendPercent}%
        </span>
        <span className="para-tiny text-text-secondary-muter">{item.trendLabel}</span>
      </div>
    </div>
  );
}