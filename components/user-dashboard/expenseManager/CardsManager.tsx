// components/user-dashboard/expenseManager/CardsManager.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, ArrowLeftRight, Settings2, Trash2, X, Pencil } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { ICard } from "@/types/expenseManager";
import { cn } from "@/lib/cn";

interface CardsManagerProps {
    cards: ICard[];
    onAddCard: (card: Omit<ICard, "id">) => void;
    onDeleteCard: (id: string) => void;
    onTransfer: (fromId: string, toId: string, amount: number) => void;
}

const gradientStyles: Record<ICard["gradient"], string> = {
    primary: "bg-gradient-wallet-card",
    secondary: "bg-gradient-to-br from-secondary to-secondary-light",
    dark: "bg-gradient-to-br from-[#1F2937] to-[#111827]",
};

export default function CardsManager({ cards, onAddCard, onUpdateCard, onDeleteCard, onTransfer }: CardsManagerProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [editingCard, setEditingCard] = useState<ICard | null>(null);
    const totalBalance = cards.reduce((s, c) => s + c.balance, 0);
    const active = cards[activeIndex] ?? cards[0];

    if (!active) {
        return (
            <div className="rounded-brand-16 border border-dashed border-border-clr-dark bg-white p-6 text-center">
                <p className="para-small mb-3 text-text-secondary-muted">No cards added yet.</p>
                <CardFormDialog onAdd={onAddCard} onUpdate={onUpdateCard} />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col gap-4 rounded-brand-16 border border-border-clr bg-white p-5">
            <div className="flex items-center justify-between">
                <h3 className="heading-h5 text-text-dark">My Cards</h3>
                <CardFormDialog onAdd={onAddCard} onUpdate={onUpdateCard} />
            </div>

            <div>
                <p className="para-tiny text-text-secondary-muter">Total Balance</p>
                <p className="heading-h3 text-text-dark">PKR {totalBalance.toLocaleString("en-PK")}</p>
            </div>

            <div className={cn("flex flex-col justify-between rounded-brand-16 p-4 text-white", gradientStyles[active.gradient])}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="para-tiny text-white/70">{active.label}</p>
                        <p className="heading-h4">PKR {active.balance.toLocaleString("en-PK")}</p>
                    </div>
                    <CardChip />
                </div>
                <div className="mt-6 flex items-center justify-between para-small text-white/85">
                    <span>•••• •••• •••• {active.last4}</span>
                    <span>{String(active.expiryMonth).padStart(2, "0")}/{active.expiryYear}</span>
                </div>
            </div>

            {cards.length > 1 && (
                <div className="flex justify-center gap-1.5">
                    {cards.map((c, i) => (
                        <button
                            key={c.id}
                            onClick={() => setActiveIndex(i)}
                            className={cn("h-1.5 rounded-full default-transition", i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border-clr")}
                        />
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <ManageCardsDialog cards={cards} onDelete={onDeleteCard} />
                <TransferDialog cards={cards} onTransfer={onTransfer} />
                <CardFormDialog editingCard={editingCard} onClose={() => setEditingCard(null)} onAdd={() => {}} onUpdate={onUpdateCard} />
            </div>
        </div>
    );
}

function CardChip() {
    return (
        <div className="flex items-center">
            <span className="h-6 w-6 rounded-full bg-white/85" />
            <span className="-ml-2.5 h-6 w-6 rounded-full bg-secondary-light mix-blend-screen" />
        </div>
    );
}

function CardFormDialog({ editingCard, onClose, onAdd, onUpdate }: {
    editingCard?: ICard | null; onClose?: () => void;
    onAdd: (card: Omit<ICard, "id">) => void; onUpdate: (id: string, patch: Partial<ICard>) => void;
}) {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState(""); const [last4, setLast4] = useState(""); const [balance, setBalance] = useState("");
    const isEdit = Boolean(editingCard);

    useEffect(() => {
        if (editingCard) {
            setLabel(editingCard.label); setLast4(editingCard.last4); setBalance(String(editingCard.balance)); setOpen(true);
        }
    }, [editingCard]);

    const reset = () => { setLabel(""); setLast4(""); setBalance(""); };
    const isValid = label.trim().length > 0 && last4.trim().length === 4 && balance.trim().length > 0;

    const handleOpenChange = (next: boolean) => { setOpen(next); if (!next) { reset(); onClose?.(); } };

    const handleSubmit = () => {
        if (!isValid) return;
        if (isEdit && editingCard) onUpdate(editingCard.id, { label, last4, balance: Number(balance) });
        else onAdd({ label, last4, balance: Number(balance), expiryMonth: 12, expiryYear: (new Date().getFullYear() % 100) + 3, gradient: "dark" });
        handleOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            {!isEdit && (
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
                        <Dialog.Title className="heading-h5 text-text-dark">{isEdit ? "Edit Card" : "Add Card"}</Dialog.Title>
                        <Dialog.Close><X size={16} /></Dialog.Close>
                    </div>
                    <div className="flex flex-col gap-3">
                        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Card label" className="rounded-brand-8 border border-border-clr px-3 py-2 para-small" />
                        <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="Last 4 digits" className="rounded-brand-8 border border-border-clr px-3 py-2 para-small" />
                        <input value={balance} onChange={(e) => setBalance(e.target.value)} type="number" placeholder="Balance" className="rounded-brand-8 border border-border-clr px-3 py-2 para-small" />
                        <button onClick={handleSubmit} disabled={!isValid} className="rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-40">
                            {isEdit ? "Save Changes" : "Add Card"}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function ManageCardsDialog({ cards, onDelete }: { cards: ICard[]; onDelete: (id: string) => void }) {
    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-brand-8 bg-primary py-2.5 para-small font-semibold text-white hover:opacity-90">
                    <Settings2 size={14} /> Manage Cards
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <Dialog.Title className="heading-h5 text-text-dark">Manage Cards</Dialog.Title>
                        <Dialog.Close><X size={16} /></Dialog.Close>
                    </div>
                    <div className="flex flex-col gap-2">
                        {cards.map((c) => (
                            <div key={c.id} className="flex items-center justify-between rounded-brand-8 border border-border-clr px-3 py-2">
                                <div>
                                    <p className="para-small font-semibold text-text-dark">{c.label}</p>
                                    <p className="para-tiny text-text-secondary-muter">•••• {c.last4} — PKR {c.balance.toLocaleString("en-PK")}</p>
                                </div>
                                <button onClick={() => setEditingCard(c)} className="text-text-secondary-muter hover:text-primary">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => onDelete(c.id)} className="text-text-secondary-muter hover:text-danger">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function TransferDialog({ cards, onTransfer }: { cards: ICard[]; onTransfer: (fromId: string, toId: string, amount: number) => void }) {
    const [fromId, setFromId] = useState(cards[0]?.id ?? "");
    const [toId, setToId] = useState(cards[1]?.id ?? "");
    const [amount, setAmount] = useState("");

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button
                    disabled={cards.length < 2}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-brand-8 border border-border-clr py-2.5 para-small font-semibold text-text-secondary hover:bg-page-bg disabled:opacity-40"
                >
                    <ArrowLeftRight size={14} /> Transfer
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <Dialog.Title className="heading-h5 text-text-dark">Transfer Funds</Dialog.Title>
                        <Dialog.Close><X size={16} /></Dialog.Close>
                    </div>
                    <div className="flex flex-col gap-3">
                        <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="rounded-brand-8 border border-border-clr px-3 py-2 para-small">
                            {cards.map((c) => <option key={c.id} value={c.id}>From: {c.label}</option>)}
                        </select>
                        <select value={toId} onChange={(e) => setToId(e.target.value)} className="rounded-brand-8 border border-border-clr px-3 py-2 para-small">
                            {cards.map((c) => <option key={c.id} value={c.id}>To: {c.label}</option>)}
                        </select>
                        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Amount"
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small" />
                        <Dialog.Close asChild>
                            <button
                                disabled={!amount || fromId === toId}
                                onClick={() => onTransfer(fromId, toId, Number(amount))}
                                className="rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-40"
                            >
                                Confirm Transfer
                            </button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}