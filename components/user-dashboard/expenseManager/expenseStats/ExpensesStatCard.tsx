// components/user-dashboard/expenseManager/expenseStats/ExpensesStatCard.tsx

"use client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, ArrowUp, ArrowDown, Eye, Download } from "lucide-react";
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
  onView: () => void;
  onExport: () => void;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

export default function ExpenseStatCard({ item, onView, onExport, ctaLabel, onCtaClick }: ExpenseStatCardProps) {
  const Icon = item.icon;

  return (
    <div
      className="flex flex-col gap-brand-12 rounded-brand-12 border border-border-clr bg-white p-brand-12 cursor-pointer group default-transition hover:shadow-card-hover hover:-translate-y-0.5"
      onClick={onView}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-brand-8">
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-brand-8 group-hover:scale-110 default-transition", chipStyles[item.chip])}>
            <Icon size={14} strokeWidth={2} />
          </span>
          <span className="para-tiny text-text-secondary-muted">{item.title}</span>
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label="More options"
              onClick={(e) => e.stopPropagation()}
              className="text-text-secondary-muter default-transition hover:text-text-secondary"
            >
              <MoreHorizontal size={18} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-dropdown w-44 rounded-brand-8 border border-border-clr bg-white p-1 shadow-card-hover"
            >
              <DropdownMenu.Item
                onClick={onView}
                className="flex cursor-pointer items-center gap-2 rounded-brand-8 px-2.5 py-2 para-small text-text-secondary outline-none default-transition hover:bg-page-bg"
              >
                <Eye size={14} /> View transactions
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={onExport}
                className="flex cursor-pointer items-center gap-2 rounded-brand-8 px-2.5 py-2 para-small text-text-secondary outline-none default-transition hover:bg-page-bg"
              >
                <Download size={14} /> Export CSV
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      <div className="flex flex-col justify-between gap-brand-8x gap-1">
        <span className="heading-h6 text-text-dark group-hover:text-primary default-transition">
          {item.value}
        </span>

        <div className="flex items-center justify-between gap-brand-8">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 para-tiny font-medium",
              item.isPositive ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
            )}>
              {item.trendDirection === "up" ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
              {item.trendPercent}%
            </span>
            <span className="para-tiny text-text-secondary-muter">{item.trendLabel}</span>
          </div>

          {ctaLabel && (
            <button
              onClick={(e) => { e.stopPropagation(); onCtaClick?.(); }}
              className="self-end rounded-brand-8 bg-page-bg px-2.5 py-1 para-tiny font-semibold text-primary default-transition hover:bg-primary hover:text-white"
            >
              + {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
