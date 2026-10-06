// dashboard\components\user-dashboard\expenseManager\party\PartyLedger.tsx

import { DEBT_CATEGORY_TYPE, DEBT_TYPE_META, IExpenseEntry } from "@/types/expenseManagerTy";
import { LedgerRow, pkr } from "@/lib/utils/debt";

const COLS = "grid grid-cols-[1fr_90px_90px]";

export default function PartyLedger({ rows, onRowClick }: { rows: LedgerRow[]; onRowClick?: (e: IExpenseEntry) => void }) {
    if (!rows.length) return <p className="py-10 text-center para-small text-text-secondary-muted">Pehli entry add karein ↓</p>;
    return (
        <div className="overflow-hidden rounded-brand-12 border border-border-clr bg-white">
            <div className={`${COLS} bg-page-bg px-3 py-2 para-tiny font-semibold text-text-secondary`}>
                <span>Entries</span><span className="text-right">You Gave</span><span className="text-right">You Got</span>
            </div>
            {[...rows].reverse().map(({ entry, sign, balance }) => (
                <button key={entry.id} type="button" onClick={() => onRowClick?.(entry)}
                    className={`${COLS} w-full items-center border-t border-border-clr px-3 py-2 text-left hover:bg-page-bg`}>
                    <div className="min-w-0">
                        <p className="para-tiny text-text-secondary-muted">{entry.date}</p>
                        <p className="para-tiny text-text-dark">{DEBT_TYPE_META[DEBT_CATEGORY_TYPE[entry.categoryId]]?.label}</p>
                        {entry.description && <p className="truncate para-tiny text-text-secondary-muted">{entry.description}</p>}
                        <p className="para-tiny text-text-secondary-muted">Bal. {pkr(Math.abs(balance))}</p>
                    </div>
                    <span className="text-right para-small font-semibold text-danger">{sign > 0 ? entry.amount.toLocaleString("en-PK") : ""}</span>
                    <span className="text-right para-small font-semibold text-green-600">{sign < 0 ? entry.amount.toLocaleString("en-PK") : ""}</span>
                </button>
            ))}
        </div>
    );
}