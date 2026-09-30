"use client";

import { useState } from "react";
import {
    CircleDollarSign,
    TrendingDown,
    CheckCircle2,
    ArrowUpRight,
} from "lucide-react";
import { IExpenseEntry } from "@/types/expenseManagerTy";

interface DebtSummaryCardProps {
    debtEntries: IExpenseEntry[];
    onMakePayment: (id: string, amount: number) => void;
}

export default function DebtSummaryCardV2({
    debtEntries,
    onMakePayment,
}: DebtSummaryCardProps) {
    const unsettled = debtEntries.filter((d) => !d.isSettled);
    const latestUnsettled = [...unsettled]
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .slice(0, 3);
    const settled = debtEntries.filter((d) => d.isSettled);

    const totalDebt = unsettled.reduce((sum, d) => sum + d.amount, 0);

    const totalOriginal = debtEntries.reduce(
        (sum, d) => sum + (d.originalAmount ?? d.amount),
        0
    );

    const paidOffPercent =
        totalOriginal > 0
            ? Math.min(
                100,
                Math.round(
                    ((totalOriginal - totalDebt) / totalOriginal) * 100
                )
            )
            : 0;

    const largest = [...unsettled].sort(
        (a, b) => b.amount - a.amount
    )[0];

    return (
        <div className="flex h-full min-h-0 flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                    <div>
                        <h3 className="para-small font-semibold text-text-dark">
                            Outstanding Debt
                        </h3>

                        <p className="mt-0.5 para-tiny text-text-secondary-muter">
                            PKR {totalDebt.toLocaleString("en-PK")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-success-bg px-2 py-1">
                    <TrendingDown
                        size={11}
                        className="text-success"
                    />
                    <span className="para-tiny font-medium text-success">
                        {paidOffPercent}% cleared
                    </span>
                </div>
            </div>

            {/* Progress */}
            <div className="mt-3">
                <div className="flex items-center justify-between para-tiny text-text-secondary-muter">
                    <span>
                        {unsettled.length} active
                    </span>

                    <span>
                        {settled.length} settled
                    </span>
                </div>

                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-page-bg">
                    <div
                        className="h-full rounded-full bg-success transition-all duration-300"
                        style={{
                            width: `${paidOffPercent}%`,
                        }}
                    />
                </div>
            </div>

            {/* Debt List */}
            <div className="mt-3 flex min-h-0 flex-1 flex-col gap-1.5">
                {unsettled.length === 0 ? (
                    <div className="flex items-center justify-center gap-1.5 rounded-brand-8 bg-success-bg px-2 py-2.5">
                        <CheckCircle2
                            size={14}
                            className="text-success"
                        />

                        <span className="para-tiny font-semibold text-success">
                            Debt free — nice work.
                        </span>
                    </div>
                ) : (
                    latestUnsettled.map((entry) => (
                        <DebtRow
                            key={entry.id}
                            entry={entry}
                            onMakePayment={onMakePayment}
                        />
                    ))
                )}
            </div>

            {/* Footer */}
            {largest && (
                <div className="flex items-center justify-between border-t border-border-clr/75 mt-2.5 pt-2.5">
                    <div className="flex items-center gap-1.5">
                        <ArrowUpRight
                            size={14}
                            className="text-danger"
                        />

                        <div>
                            <p className="para-tiny text-[11px] leading-none text-text-secondary-muter mb-1">
                                Largest liability
                            </p>

                            <p className="mt-0.5 max-w-[150px] truncate para-tiny font-semibold text-text-dark">
                                {largest.subject}
                            </p>
                        </div>
                    </div>

                    <span className="para-small font-bold text-danger">
                        PKR {largest.amount.toLocaleString("en-PK")}
                    </span>
                </div>
            )}
        </div>
    );
}

function DebtRow({
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