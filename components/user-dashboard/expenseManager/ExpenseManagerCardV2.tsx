"use client";

import Link from "next/link";
import { Wallet, ArrowUpRight, Plus } from "lucide-react";
import { useExpenseManagerSummary } from "@/hooks/useExpenseManagerSummary";

function formatCurrency(value: number) {
    return `PKR ${value.toLocaleString("en-PK")}`;
}

export default function ExpenseManagerCardV2() {
    const { summary, loading } = useExpenseManagerSummary();

    if (!loading && !summary.isSetup) {
        return <ExpenseManagerEmptyState />;
    }

    const percentUsed =
        summary.totalIncome > 0
            ? Math.min(100, Math.round((summary.totalExpenses / summary.totalIncome) * 100))
            : 0;

    return (
        <div className="flex h-full flex-col justify-between gap-5 rounded-brand-16 bg-gradient-wallet-cardx bg-primary p-5 text-white shadow-card-hover">
            <div className="flex items-center justify-between">
                <span className="para-small font-medium text-white/70">Net Balance</span>
                <Link
                    href="/user-dashboard/expense-manager"
                    className="para-tiny flex items-center gap-1 font-semibold text-white/85 default-transition hover:text-white"
                >
                    Open full tracker
                    <ArrowUpRight size={13} />
                </Link>
            </div>

            <span className="heading-h2 tracking-tight">{formatCurrency(summary.balance)}</span>

            <div className="flex items-center justify-between para-small text-white/60">
                <span>Linked account •••• {summary.linkedAccountLast4}</span>
                <span>{summary.asOfLabel}</span>
            </div>

            <div>
                <div className="mb-1.5 flex items-center justify-between para-tiny text-white/70">
                    <span>Income {formatCurrency(summary.totalIncome)}</span>
                    <span>Spent {formatCurrency(summary.totalExpenses)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                        className="h-full rounded-full bg-white default-transition"
                        style={{ width: `${percentUsed}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/15 pt-4">
                <CardChip />
                <span className="para-tiny text-white/50">Expense Manager</span>
            </div>
        </div>
    );
}

// Original two-tone motif, not a reproduction of any card network's mark.
function CardChip() {
    return (
        <div className="flex items-center">
            <span className="h-6 w-6 rounded-full bg-secondary/90" />
            <span className="-ml-2.5 h-6 w-6 rounded-full bg-white/85 mix-blend-screen" />
        </div>
    );
}

function ExpenseManagerEmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-brand-16 border border-dashed border-border-clr-dark bg-card-bg-clr p-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-brand-12 bg-primary-lighter">
                <Wallet size={20} className="text-primary" strokeWidth={2} />
            </span>
            <h3 className="heading-h5 text-text-dark">Set up Expense Manager</h3>
            <p className="para-small max-w-[220px] text-text-secondary-muted">
                Track income and expenses in one place, and see your monthly net at a glance.
            </p>
            <Link
                href="/user-dashboard/expense-manager/setup"
                className="mt-1 flex items-center gap-1.5 rounded-brand-8 bg-primary px-4 py-2 para-small font-semibold text-white default-transition hover:opacity-90"
            >
                <Plus size={14} />
                Get Started
            </Link>
        </div>
    );
}