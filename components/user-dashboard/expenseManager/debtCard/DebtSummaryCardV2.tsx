// dashboard\components\user-dashboard\expenseManager\debtCard\DebtSummaryCardV2.tsx

"use client";

import { useState } from "react";
import {
    CircleDollarSign,
    TrendingDown,
    CheckCircle2,
    ArrowUpRight,
} from "lucide-react";
import { IExpenseEntry } from "@/types/expenseManagerTy";
import DebtRow from "./DebtRow";
import AllDebtsDialog from "./AllDebtsDialog";

interface DebtSummaryCardProps {
    debtEntries: IExpenseEntry[];
    onMakePayment: (id: string, amount: number) => void;
}

export default function DebtSummaryCardV2({
    debtEntries,
    onMakePayment,
}: DebtSummaryCardProps) {

    const [showAll, setShowAll] = useState(false);

    const unsettled = debtEntries.filter((d) => !d.isSettled);
    const latestUnsettled = [...unsettled]
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .slice(0, 2);
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

            {/* see all entries dialog */}
            {unsettled.length > 2 && (
                <button onClick={() => setShowAll(true)} className="mt-1.5 self-center para-tiny font-semibold text-primary hover:underline cursor-pointer">
                    See all {unsettled.length} entries
                </button>
            )}

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

            {/* All Debts Entries Dialogs */}
            <AllDebtsDialog open={showAll} onOpenChange={setShowAll} unsettled={unsettled} onMakePayment={onMakePayment} />
        </div>
    );
}
