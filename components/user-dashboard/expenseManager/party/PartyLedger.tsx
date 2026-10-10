// dashboard\components\user-dashboard\expenseManager\party\PartyLedger.tsx

"use client";
import { useState } from "react";
import { Inbox, Pencil, Trash2 } from "lucide-react";
import { IExpenseEntry } from "@/types/expenseManagerTy";
import { LedgerRow, debtLabel, pkr } from "@/lib/utils/debt";
import { entryDateTime } from "@/lib/utils/dateFmt";

const GRID = "grid grid-cols-[minmax(0,1fr)_88px_88px] sm:grid-cols-[minmax(0,1fr)_130px_130px]";

interface Props {
    rows: LedgerRow[];
    onEdit?: (e: IExpenseEntry) => void;
    onDelete?: (id: string) => void;
}

export default function PartyLedger({ rows, onEdit, onDelete }: Props) {
    const [confirmId, setConfirmId] = useState<string | null>(null);

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
                    <div key={entry.id} className={`${GRID} border-b border-border-clr last:border-b-0`}>
                        <div className="min-w-0 px-3 py-2.5">
                            <p className="para-tiny text-text-secondary-muter">{entryDateTime(entry)}</p>
                            <p className="truncate para-small font-medium text-text-dark">{debtLabel(entry.categoryId)}</p>
                            {entry.description && <p className="truncate para-tiny text-text-secondary-muted">{entry.description}</p>}
                            <span className={`mt-1 inline-block rounded-brand-8 px-1.5 py-0.5 para-tiny font-medium ${balTone}`}>
                                Bal. {pkr(Math.abs(balance))}
                            </span>

                            {(onEdit || onDelete) && (
                                <div className="mt-1.5 flex items-center gap-3 print:hidden">
                                    {confirmId === entry.id ? (
                                        <>
                                            <span className="para-tiny text-text-secondary-muted">Entry delete karein?</span>
                                            <button type="button" onClick={() => { onDelete?.(entry.id); setConfirmId(null); }}
                                                className="cursor-pointer rounded-brand-8 bg-danger px-2 py-1 para-tiny font-semibold text-white">Haan</button>
                                            <button type="button" onClick={() => setConfirmId(null)}
                                                className="cursor-pointer rounded-brand-8 border border-border-clr px-2 py-1 para-tiny font-semibold text-text-secondary">Nahi</button>
                                        </>
                                    ) : (
                                        <>
                                            {onEdit && (
                                                <button type="button" onClick={() => onEdit(entry)}
                                                    className="flex cursor-pointer items-center gap-1 para-tiny font-semibold text-text-secondary hover:text-primary">
                                                    <Pencil size={12} /> Edit
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button type="button" onClick={() => setConfirmId(entry.id)}
                                                    className="flex cursor-pointer items-center gap-1 para-tiny font-semibold text-text-secondary hover:text-danger">
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-end bg-danger-bg/50 px-3">
                            {sign > 0 && <span className="para-small font-bold text-danger">{amt}</span>}
                        </div>
                        <div className="flex items-center justify-end bg-success-bg/50 px-3">
                            {sign < 0 && <span className="para-small font-bold text-success">{amt}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}