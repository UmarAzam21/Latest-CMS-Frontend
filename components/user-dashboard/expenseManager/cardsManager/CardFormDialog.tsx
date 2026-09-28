// dashboard\components\user-dashboard\expenseManager\cardsManager\CardFormDialog.tsx

import { ICard } from "@/types/expenseManagerTy";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

const inputCls = "w-full rounded-brand-8 border border-border-clr px-2.5 py-2 para-small outline-none focus:border-primary";

export default function CardFormDialog({ editingCard, onClose, onAdd, onUpdate, open: openProp, onOpenChange, hideTrigger, disabledAdd }: {
    editingCard?: ICard | null; onClose?: () => void;
    onAdd: (card: Omit<ICard, "id">) => void;
    onUpdate: (id: string, patch: Partial<ICard>) => void;
    open?: boolean; onOpenChange?: (open: boolean) => void; hideTrigger?: boolean; disabledAdd?: boolean;
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : internalOpen;
    const [label, setLabel] = useState("");
    const [last4, setLast4] = useState("");
    const [balance, setBalance] = useState("");
    const isEdit = Boolean(editingCard);

    useEffect(() => {
        if (editingCard) {
            setLabel(editingCard.label); setLast4(editingCard.last4); setBalance(String(editingCard.balance));
            isControlled ? onOpenChange?.(true) : setInternalOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingCard]);

    const isValid = label.trim().length > 0 && last4.length === 4 && balance.trim().length > 0;

    const handleOpenChange = (next: boolean) => {
        isControlled ? onOpenChange?.(next) : setInternalOpen(next);
        if (!next) { setLabel(""); setLast4(""); setBalance(""); onClose?.(); }
    };

    const handleSubmit = () => {
        if (!isValid) return;
        if (isEdit && editingCard) {
            onUpdate(editingCard.id, { label: label.trim(), last4, balance: Number(balance) });
        } else {
            const now = new Date();
            onAdd({
                label: label.trim(), last4, balance: Number(balance),
                expiryMonth: now.getMonth() + 1,              // valid for 5 years from the day it's added
                expiryYear: (now.getFullYear() + 5) % 100,
                gradient: "dark",
            });
        }
        handleOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            {!isEdit && !hideTrigger && (
                <Dialog.Trigger asChild>
                    <button disabled={disabledAdd} title={disabledAdd ? "Max 3 cards" : undefined}
                        className="flex items-center gap-1 rounded-brand-8 border border-border-clr px-2.5 py-1.5 para-tiny font-semibold text-text-secondary hover:bg-page-bg disabled:cursor-not-allowed disabled:opacity-40">
                        <Plus size={12} /> Add
                    </button>
                </Dialog.Trigger>
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12">
                    <div className="mb-brand-8 flex items-center justify-between">
                        <Dialog.Title className="para-small font-semibold text-text-dark">{isEdit ? "Card Edit Karein" : "Naya Card"}</Dialog.Title>
                        <Dialog.Close><X size={16} /></Dialog.Close>
                    </div>
                    <div className="flex flex-col gap-brand-8">
                        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Card ka naam (jaise: Meezan Debit)" className={inputCls} />
                        <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Aakhri 4 digits (jaise: 4821)" className={inputCls} />
                        <input value={balance} onChange={(e) => setBalance(e.target.value)} type="number" placeholder="Balance (Rs.)" className={inputCls} />
                        <button onClick={handleSubmit} disabled={!isValid} className="rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-40">
                            {isEdit ? "Save Karein" : "Card Add Karein"}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}