// components/user-dashboard/expenseManager/DebtSummaryCard.tsx
import { CircleDollarSign } from "lucide-react";

interface DebtSummaryCardProps {
  totalDebt: number;
  debtCount: number;
}

export default function DebtSummaryCard({ totalDebt, debtCount }: DebtSummaryCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-brand-16 border border-border-clr bg-card-bg-clr p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-brand-8 bg-warning-bg">
          <CircleDollarSign size={17} className="text-warning" />
        </span>
        <span className="para-small font-medium text-text-secondary">Outstanding Debt</span>
      </div>
      <span className="heading-h2 mt-4 text-text-dark">
        PKR {totalDebt.toLocaleString("en-PK")}
      </span>
      <span className="para-tiny mt-2 text-text-secondary-muter">
        {debtCount} unsettled {debtCount === 1 ? "entry" : "entries"}
      </span>
    </div>
  );
}