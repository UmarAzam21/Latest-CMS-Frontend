"use client";
import { useState } from "react";
import { CircleDollarSign, TrendingDown, CheckCircle2 } from "lucide-react";
import { IExpenseEntry } from "@/types/expenseManagerTy";

interface DebtSummaryCardProps { debtEntries: IExpenseEntry[]; onMakePayment: (id: string, amount: number) => void }

export default function DebtSummaryCardV2({ debtEntries, onMakePayment }: DebtSummaryCardProps) {
    const unsettled = debtEntries.filter((d) => !d.isSettled);
    const settled = debtEntries.filter((d) => d.isSettled);
    const totalDebt = unsettled.reduce((s, d) => s + d.amount, 0);
    const totalOriginal = debtEntries.reduce((s, d) => s + (d.originalAmount ?? d.amount), 0);
    const paidOffPercent = totalOriginal > 0 ? Math.round(((totalOriginal - totalDebt) / totalOriginal) * 100) : 0;
    const largest = [...unsettled].sort((a, b) => b.amount - a.amount)[0];

    return (
        <div className="flex h-full flex-col gap-4 rounded-brand-16 border border-border-clr bg-white p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-brand-8 bg-warning-bg"><CircleDollarSign size={17} className="text-warning" /></span><span className="para-small font-medium text-text-secondary">Outstanding Debt</span></div>
                <span className="flex items-center gap-1 rounded-full bg-success-bg px-2 py-0.5 para-tiny font-semibold text-success"><TrendingDown size={11} />{paidOffPercent}% cleared</span>
            </div>

            <span className="heading-h2 text-text-dark">PKR {totalDebt.toLocaleString("en-PK")}</span>

            {/* settled bars versions */}
            {/* <div className="h-2 w-full overflow-hidden rounded-full bg-page-bg"><div className="h-full rounded-full bg-success" style={{ width: `${paidOffPercent}%` }} /></div> */}

            <div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-page-bg">
                    <div className="h-full rounded-full bg-success default-transition" style={{ width: `${paidOffPercent}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between para-tiny text-text-secondary-muter">
                    <span>{unsettled.length} active</span>
                    <span>{settled.length} settled</span>
                </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-border-clr pt-3">
                {unsettled.length === 0 ? (
                    <div className="flex items-center gap-1.5 rounded-brand-8 bg-success-bg px-3 py-2 para-tiny font-semibold text-success"><CheckCircle2 size={13} /> Debt free — nice work.</div>
                ) : (
                    unsettled.map((d) => <DebtRow key={d.id} entry={d} onMakePayment={onMakePayment} />)
                )}
            </div>

            {/* largest liability */}
            {largest && (
                <div className="flex items-center justify-between border-t border-border-clr pt-3">
                    <div>
                        <p className="para-tiny text-text-secondary-muter">Largest liability</p>
                        <p className="para-small font-semibold text-text-dark">{largest.subject}</p>
                    </div>
                    <span className="para-small font-semibold text-danger">
                        PKR {largest.amount.toLocaleString("en-PK")}
                    </span>
                </div>
            )}
        </div>
    );
}

function DebtRow({ entry, onMakePayment }: { entry: IExpenseEntry; onMakePayment: (id: string, amount: number) => void }) {
    const [amount, setAmount] = useState("");
    const original = entry.originalAmount ?? entry.amount;
    const progress = original > 0 ? Math.round(((original - entry.amount) / original) * 100) : 0;

    return (
        <div className="rounded-brand-8 border border-border-clr p-2.5">
            <div className="flex items-center justify-between"><p className="para-small font-semibold text-text-dark">{entry.subject}</p><span className="para-small font-semibold text-danger">PKR {entry.amount.toLocaleString("en-PK")}</span></div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-page-bg"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div>
            <div className="mt-2 flex gap-1.5">
                <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Payment amount" className="flex-1 rounded-brand-8 border border-border-clr px-2 py-1 para-tiny outline-none focus:border-primary" />
                <button onClick={() => { if (Number(amount) > 0) { onMakePayment(entry.id, Number(amount)); setAmount(""); } }} className="rounded-brand-8 bg-primary px-2.5 para-tiny font-semibold text-white">Pay</button>
                <button onClick={() => onMakePayment(entry.id, entry.amount)} className="rounded-brand-8 border border-border-clr px-2.5 para-tiny font-semibold text-text-secondary">Settle</button>
            </div>
        </div>
    );
}