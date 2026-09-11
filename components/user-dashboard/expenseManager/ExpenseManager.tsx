import { DollarSign, ChevronRight } from "lucide-react";

interface ExpenseManagerCardProps {
  expenses?: number;
  income?: number;
  currency?: string;
}

export default function ExpenseManagerCard({
  expenses = 142500,
  income = 320000,
  currency = "PKR",
}: ExpenseManagerCardProps) {
  const net = income - expenses;

  // Progress percentage based on expenses vs income
  const progress = Math.min((expenses / income) * 100, 100);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-PK").format(amount);
  };

  return (
    <div className="flex h-full w-full max-w-[550px] flex-col rounded-xl bg-primary px-[30px] py-[30px] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold tracking-[-0.3px]">
          Expense Manager
        </h2>

        <div className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-white/15">
          <DollarSign size={20} strokeWidth={2} />
        </div>
      </div>

      {/* Total Expenses */}
      <div className="mt-[22px]">
        <div className="text-[18px] font-bold leading-[1.1] tracking-[-1px]">
          {currency} {formatAmount(expenses)}
        </div>

        <p className="mt-[8px] text-[14px] text-white/85">
          Total expenses this month
        </p>
      </div>

      {/* Income / Net */}
      <div className="mt-[26px] flex items-end justify-between">
        <div>
          <p className="text-[14px] text-white/85">Income</p>

          <p className="mt-[2px] text-[14px] font-bold">
            {currency} {formatAmount(income)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[14px] text-white/85">Net</p>

          <p className="mt-[2px] text-[25px] font-bold">
            {currency} {formatAmount(net)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-[27px]">
        <div className="h-[9px] w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <button
        type="button"
        className="mt-[11px] flex items-center gap-[6px] text-[12px] font-medium text-white transition-opacity hover:opacity-80"
      >
        Open full tracker
        <ChevronRight size={14} />
      </button>
    </div>
  );
}