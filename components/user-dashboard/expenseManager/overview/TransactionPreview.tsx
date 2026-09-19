"use client";
import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { IExpenseEntry, ICategory } from "@/types/expenseManager";

function fmt(v: number) { return `PKR ${v.toLocaleString("en-PK")}`; }

export default function TransactionPreview({ entries, categories }: { entries: IExpenseEntry[]; categories: ICategory[] }) {
    const recent = entries.slice(0, 5);
    const label = (id: string) => categories.find((c) => c.id === id)?.label ?? "Uncategorized";

    return (
        <div className="rounded-brand-16 border border-border-clr bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h3 className="para-small font-semibold text-text-dark">Latest Transactions</h3>
                    <p className="para-tiny text-text-secondary-muter">Your most recent activity</p>
                </div>
                <Link
                    href="/user-dashboard/expense-manager"
                    className="flex h-8 w-8 items-center justify-center rounded-brand-8 border border-border-clr text-text-secondary-muter default-transition hover:border-primary hover:text-primary"
                >
                    <ArrowUpRight size={15} />
                </Link>
            </div>

            {recent.length === 0 ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-brand-8 border border-dashed border-border-clr">
                    <p className="para-small text-text-secondary">No transactions yet</p>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    {recent.map((e) => {
                        const isIncome = e.kind === "income";
                        return (
                            <div key={e.id} className="flex items-center justify-between gap-3 rounded-brand-8 px-2 py-2 default-transition bg-page-bg hover:bg-danger-bg">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isIncome ? "bg-success-bg text-success" : e.kind === "debt" ? "bg-warning-bg text-warning" : "bg-danger-bg text-primary"}`}>
                                        {isIncome ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate para-small font-semibold text-text-dark">{e.subject}</p>
                                        <p className="para-tiny text-text-secondary-muter">
                                            {label(e.categoryId)} · {new Date(e.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                        </p>
                                    </div>
                                </div>
                                <p className={`shrink-0 para-small font-semibold ${isIncome ? "text-success" : "text-text-dark"}`}>
                                    {isIncome ? "+" : "-"}{fmt(e.amount)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
