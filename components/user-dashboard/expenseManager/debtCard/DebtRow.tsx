// dashboard\components\user-dashboard\expenseManager\debtCard\DebtRow.tsx

import { IExpenseEntry } from "@/types/expenseManagerTy";
import { useState } from "react";

export default function DebtRow({
    entry,
    onMakePayment,
}: {
    entry: IExpenseEntry;
    onMakePayment: (id: string, amount: number) => void;
}) {
    const [amount, setAmount] = useState("");

    const original = entry.originalAmount ?? entry.amount;

    const progress =
        original > 0
            ? Math.min(
                100,
                Math.round(
                    ((original - entry.amount) / original) * 100
                )
            )
            : 0;

    const handlePayment = () => {
        const payment = Number(amount);

        if (payment > 0) {
            onMakePayment(entry.id, payment);
            setAmount("");
        }
    };

    return (
        <div className="rounded-brand-8 border border-border-clr bg-page-bg/65 p-brand-8">

            {/* Debt info */}
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="truncate para-tiny font-semibold">
                        {entry.subject}
                    </h3>

                    <div className="w-full overflow-hidden rounded-full bg-page-bg">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>

                <span className="shrink-0 para-tiny font-semibold text-primary">
                    PKR {entry.amount.toLocaleString("en-PK")}
                </span>
            </div>

            {/* Payment actions */}
            <div className="mt-brand-8 flex gap-1.5">
                <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handlePayment();
                        }
                    }}
                    type="number"
                    min="0"
                    placeholder="Payment amount"
                    className="min-w-0 flex-1 rounded-brand-8 border border-border-clr bg-white px-2 para-tiny text-text-dark outline-none transition focus:border-primary/35 focus:ring-1 focus:ring-primary/10"
                />

                <button
                    onClick={handlePayment}
                    disabled={!Number(amount)}
                    className="px-2.5 py-1.5 rounded-brand-8 bg-primary para-tiny font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Pay
                </button>

                <button
                    onClick={() =>
                        onMakePayment(entry.id, entry.amount)
                    }
                    className="px-2.5 py-1.5 rounded-brand-8 border border-border-clr bg-white para-tiny font-semibold text-text-secondary transition hover:border-primary hover:text-primary"
                >
                    Settle
                </button>
            </div>
        </div>
    );
}