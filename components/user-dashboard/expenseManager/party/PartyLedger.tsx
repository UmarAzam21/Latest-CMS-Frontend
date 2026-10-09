// dashboard\components\user-dashboard\expenseManager\party\PartyLedger.tsx

import { Inbox } from "lucide-react";
import { IExpenseEntry } from "@/types/expenseManagerTy";
import { LedgerRow, debtLabel, pkr } from "@/lib/utils/debt";
import { entryDateTime } from "@/lib/utils/dateFmt";

const GRID = "grid grid-cols-[minmax(0,1fr)_88px_88px] sm:grid-cols-[minmax(0,1fr)_130px_130px]";

export default function PartyLedger({ rows, onRowClick }: { rows: LedgerRow[]; onRowClick?: (e: IExpenseEntry) => void }) {
    if (!rows.length) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-brand-12 border border-dashed border-border-clr bg-white py-10 text-text-secondary-muted">
                <Inbox size={26} />
                <p className="para-small">Koi entry nahi mili. Neeche se pehli entry add karein.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-brand-12 border border-border-clr bg-white">
            <div className={`${GRID} border-b border-border-clr para-tiny font-semibold`}>
                <span className="px-3 py-2 text-text-secondary">Entries ({rows.length})</span>
                <span className="bg-danger-bg px-3 py-2 text-right text-danger">You Gave</span>
                <span className="bg-success-bg px-3 py-2 text-right text-success">You Got</span>
            </div>

            {[...rows].reverse().map(({ entry, sign, balance }) => {
                const amt = entry.amount.toLocaleString("en-PK");
                const balTone = balance > 0 ? "bg-danger-bg text-danger" : balance < 0 ? "bg-success-bg text-success" : "bg-page-bg text-text-secondary";
                return (
                    <button key={entry.id} type="button" onClick={() => onRowClick?.(entry)}
                        className={`${GRID} w-full cursor-pointer border-b border-border-clr text-left last:border-b-0 hover:bg-page-bg/60`}>
                        <div className="min-w-0 px-3 py-2.5">
                            <p className="para-tiny text-text-secondary-muter">{entryDateTime(entry)}</p>
                            <p className="truncate para-small font-medium text-text-dark">{debtLabel(entry.categoryId)}</p>
                            {entry.description && <p className="truncate para-tiny text-text-secondary-muted">{entry.description}</p>}
                            <span className={`mt-1 inline-block rounded-brand-8 px-1.5 py-0.5 para-tiny font-medium ${balTone}`}>
                                Bal. {pkr(Math.abs(balance))}
                            </span>
                        </div>
                        <div className="flex items-center justify-end bg-danger-bg/50 px-3">
                            {sign > 0 && <span className="para-small font-bold text-danger">{amt}</span>}
                        </div>
                        <div className="flex items-center justify-end bg-success-bg/50 px-3">
                            {sign < 0 && <span className="para-small font-bold text-success">{amt}</span>}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}