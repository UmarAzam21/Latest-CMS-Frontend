// dashboard\components\user-dashboard\expenseManager\party\BalanceText.tsx

import { pkr } from "@/lib/utils/debt";

export default function BalanceText({ value, hidden }: { value: number; hidden?: boolean }) {
    const t = value > 0
        ? { amt: "text-danger", chip: "bg-danger-bg text-danger", label: "You will get" }
        : value < 0
            ? { amt: "text-success", chip: "bg-success-bg text-success", label: "You will give" }
            : { amt: "text-text-secondary", chip: "bg-page-bg text-text-secondary", label: "Settled up" };
    return (
        <div className="flex flex-col items-end gap-0.5">
            <p className={`para-small font-bold ${t.amt}`}>{hidden ? "Rs ••••" : pkr(Math.abs(value))}</p>
            <span className={`rounded-full px-2 py-0.5 para-tiny font-medium ${t.chip}`}>{t.label}</span>
        </div>
    );
}