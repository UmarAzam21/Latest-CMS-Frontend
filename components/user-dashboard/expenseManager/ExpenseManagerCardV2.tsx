"use client";

import Link from "next/link";
import { Wallet, ArrowUpRight, Plus, ArrowDownToLine, ReceiptText } from "lucide-react";
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
        <div className="expense-card-perspective h-full">
            <div className="expense-card-inner h-full">
                <div className="expense-card-face flex h-full flex-col justify-between gap-5 overflow-hidden rounded-brand-16 bg-gradient-wallet-card bg-primary p-5 text-white shadow-card-hover">
                    <div className="flex items-center justify-between border-b border-b-border-clr-dark pb-3">
                        <div className="flex items-center justify-center gap-2">
                            <span className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-white/80 p-2">
                                <img src="/filernow-wellness-icon-01.png" alt="Filernow logo" className="h-full w-full object-contain" />
                            </span>
                        </div>
                        <Link
                            href="/user-dashboard/expense-manager"
                            className="para-tiny flex items-center gap-1 font-semibold text-white/85 default-transition hover:text-white"
                        >
                            Open full tracker
                            <ArrowUpRight size={13} />
                        </Link>
                    </div>

                    <span className="heading-h2 tracking-tight">{formatCurrency(summary.balance)}</span>

                    <div className="flex items-center justify-between para-small text-white">
                        <span>Linked account •••• {summary.linkedAccountLast4}</span>
                        <span className="para-tiny">{summary.asOfLabel}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="mb-1.5 flex items-center justify-between para-tiny text-white/70">
                            <span>Income {formatCurrency(summary.totalIncome)}</span>
                            <span>Spent {formatCurrency(summary.totalExpenses)}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                            <div
                                className="h-full rounded-full bg-white default-transition"
                                style={{ width: `${percentUsed}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/15 pt-4">
                        <CardChip />
                        <span className="para-tiny text-white">Expense Manager</span>
                    </div>
                </div>

                <div className="expense-card-face expense-card-back flex h-full flex-col justify-between overflow-hidden rounded-brand-16 bg-gradient-wallet-card bg-primary p-5 text-white shadow-card-hover">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="para-tiny uppercase tracking-[0.18em] text-white/65">Quick entry</p>
                            <h3 className="heading-h5 mt-1 text-white">Manage your money</h3>
                        </div>
                        <span className="flex h-14 w-14 items-center justify-center rounded-brand-12 bg-white/80 p-2">
                            <img src="/filernow-wellness-icon-01.png" alt="Filernow logo" className="h-full w-full object-contain" />
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/user-dashboard/expense-manager?entry=expense"
                            className="flex min-h-[82px] flex-col justify-between rounded-brand-12 border border-white/20 bg-black/10 p-3 default-transition hover:bg-white hover:text-primary"
                        >
                            <ReceiptText size={19} />
                            <span className="para-small font-semibold leading-tight">Add expense</span>
                        </Link>
                        <Link
                            href="/user-dashboard/expense-manager?entry=spend"
                            className="flex min-h-[82px] flex-col justify-between rounded-brand-12 border border-white/20 bg-black/10 p-3 default-transition hover:bg-white hover:text-primary"
                        >
                            <ArrowDownToLine size={19} />
                            <span className="para-small font-semibold leading-tight">Add spend amount</span>
                        </Link>
                    </div>

                    <div className="flex items-center justify-center border-t border-white/15 pt-3">
                        <Link href="/user-dashboard/expense-manager" className="para-small flex items-center gap-1 font-semibold text-white hover:underline">
                            Full tracker <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Original two-tone motif, not a reproduction of any card network's mark.
function CardChip() {
    return (
        <div className="flex items-center">
            <span className="h-6 w-6 rounded-full bg-secondary/90x bg-secondary-light" />
            <span className="-ml-2.5 h-6 w-6 rounded-full bg-white/85 mix-blend-screen" />
        </div>
    );
}

function ExpenseManagerEmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-brand-16 border border-dashed border-border-clr-dark bg-card-bg-clr bg-primary p-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-brand-12 bg-primary-lighter bg-white/45">
                <Wallet size={20} className="text-white" strokeWidth={2} />
            </span>
            <h3 className="heading-h5 text-white">Set up Expense Manager</h3>
            <p className="para-small max-w-[220px] text-text-secondary-muted text-white/85">
                Track income and expenses in one place, and see your monthly net at a glance.
            </p>
            <Link
                href="/user-dashboard/expense-manager/setup"
                className="mt-1 flex items-center gap-1.5 rounded-brand-8 bg-primary bg-white px-4 py-2 para-small font-semibold text-text-secondary default-transition hover:opacity-90"
            >
                <Plus size={14} />
                Get Started
            </Link>
        </div>
    );
}