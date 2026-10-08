// dashboard\components\user-dashboard\expenseManager\party\BalanceText.tsx

import { pkr } from "@/lib/utils/debt";

export default function BalanceText({ value, hidden }: { value: number; hidden?: boolean }) {
    const cls = value > 0 ? "text-danger" : value < 0 ? "text-green-600" : "text-text-secondary";
    const label = value > 0 ? "You will get" : value < 0 ? "You will give" : "Settled up";
    return (
        <div className="text-right">
            <p className={`para-small font-semibold ${cls}`}>{hidden ? "Rs ••••" : pkr(Math.abs(value))}</p>
            <p className="para-tiny text-text-secondary-muted">{label}</p>
        </div>
    );
}