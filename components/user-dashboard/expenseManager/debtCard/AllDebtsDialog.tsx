// dashboard\components\user-dashboard\expenseManager\debtCard\AllDebtsDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CheckCircle2 } from "lucide-react";
import { IExpenseEntry } from "@/types/expenseManagerTy";
import DebtRow from "./DebtRow";

const PAGE_SIZE = 8;

export default function AllDebtsDialog({ open, onOpenChange, unsettled, onMakePayment }: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    unsettled: IExpenseEntry[];
    onMakePayment: (id: string, amount: number) => void;
}) {
    const [page, setPage] = useState(1);
    const sorted = [...unsettled].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) setPage(1);
            }}
        >
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-white p-brand-12 shadow-card-hover">
                    <div className="mb-brand-8 flex items-center justify-between border-b border-border-clr pb-brand-8">
                        <Dialog.Title className="para-small font-semibold text-text-dark">
                            Outstanding Udhaar ({sorted.length})
                        </Dialog.Title>
                        <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary">
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    {sorted.length === 0 ? (
                        <div className="flex items-center justify-center gap-1.5 rounded-brand-8 bg-success-bg px-2 py-2.5">
                            <CheckCircle2 size={14} className="text-success" />
                            <span className="para-tiny font-semibold text-success">
                                Debt free — nice work.
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="flex max-h-[420px] flex-col gap-1.5 overflow-y-auto">
                                {paged.map((entry) => (
                                    <DebtRow
                                        key={entry.id}
                                        entry={entry}
                                        onMakePayment={onMakePayment}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-brand-8 flex items-center justify-between border-t border-border-clr pt-brand-8">
                                    <span className="para-tiny text-text-secondary-muter">
                                        Page {page} of {totalPages}
                                    </span>

                                    <div className="flex gap-1.5">
                                        <button
                                            disabled={page === 1}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="rounded-brand-8 border border-border-clr px-2.5 py-1 para-tiny disabled:opacity-40 hover:bg-page-bg"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            disabled={page === totalPages}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="rounded-brand-8 border border-border-clr px-2.5 py-1 para-tiny disabled:opacity-40 hover:bg-page-bg"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}