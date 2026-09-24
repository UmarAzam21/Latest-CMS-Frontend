// dashboard\components\user-dashboard\expenseManager\cardsManager\CardFormDialog.tsx

import { ICard } from "@/types/expenseManagerTy";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function CardFormDialog({ editingCard, onClose, onAdd, onUpdate, open: openProp, onOpenChange, hideTrigger, }: {
    editingCard?: ICard | null;
    onClose?: () => void;
    onAdd: (card: Omit<ICard, "id">) => void;
    onUpdate: (id: string, patch: Partial<ICard>) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hideTrigger?: boolean;
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
            setLabel(editingCard.label);
            setLast4(editingCard.last4);
            setBalance(String(editingCard.balance));

            if (isControlled) {
                onOpenChange?.(true);
            } else {
                setInternalOpen(true);
            }
        }
    }, [editingCard]);

    const reset = () => {
        setLabel("");
        setLast4("");
        setBalance("");
    };

    const isValid = label.trim().length > 0 && last4.trim().length === 4 && balance.trim().length > 0;

    const handleOpenChange = (next: boolean) => {
        if (isControlled) {
            onOpenChange?.(next);
        } else {
            setInternalOpen(next);
        }

        if (!next) {
            reset();
            onClose?.();
        }
    };

    const handleSubmit = () => {
        if (!isValid) return;

        if (isEdit && editingCard) {
            onUpdate(editingCard.id, { label, last4, balance: Number(balance) });
        } else {
            onAdd({
                label,
                last4,
                balance: Number(balance),
                expiryMonth: 12,
                expiryYear: (new Date().getFullYear() % 100) + 3,
                gradient: "dark"
            });
        }

        handleOpenChange(false);
    };


    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            {!isEdit && !hideTrigger && (
                <Dialog.Trigger asChild>
                    <button className="flex items-center gap-1 rounded-brand-8 border border-border-clr px-2.5 py-1.5 para-tiny font-semibold text-text-secondary hover:bg-page-bg">
                        <Plus size={13} /> Add
                    </button>
                </Dialog.Trigger>
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <Dialog.Title className="heading-h5 text-text-dark">
                            {isEdit ? "Edit Card" : "Add Card"}
                        </Dialog.Title>
                        <Dialog.Close><X size={16} /></Dialog.Close>
                    </div>
                    <div className="flex flex-col gap-3">
                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="Card label"
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />
                        <input
                            value={last4}
                            onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            placeholder="Last 4 digits"
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />
                        <input
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            type="number"
                            placeholder="Balance"
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!isValid}
                            className="rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-40"
                        >
                            {isEdit ? "Save Changes" : "Add Card"}
                        </button>

                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}