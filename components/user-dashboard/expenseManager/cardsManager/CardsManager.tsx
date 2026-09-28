// components/user-dashboard/expenseManager/CardsManager.tsx
"use client";
import { useState } from "react";
import { ArrowLeftRight, Settings2, Trash2, X, Pencil } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { ICard, MAX_CARDS } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";
import CardFormDialog from "./CardFormDialog";

interface CardsManagerProps {
    cards: ICard[];
    onAddCard: (card: Omit<ICard, "id">) => void;
    onUpdateCard: (id: string, patch: Partial<ICard>) => void;
    onDeleteCard: (id: string) => void;
    onTransfer: (fromId: string, toId: string, amount: number) => void;
}

const fmt = (v: number) => `PKR ${v.toLocaleString("en-PK")}`;
const expiry = (c: ICard) => `${String(c.expiryMonth).padStart(2, "0")}/${String(c.expiryYear).padStart(2, "0")}`;
const gradientStyles: Record<ICard["gradient"], string> = {
    primary: "bg-gradient-wallet-card",
    secondary: "bg-gradient-to-br from-secondary to-secondary-light",
    dark: "bg-gradient-to-br from-[#1F2937] to-[#111827]",
};
const inputCls = "w-full rounded-brand-8 border border-border-clr px-2.5 py-2 para-small outline-none focus:border-primary";

export default function CardsManager({ cards, onAddCard, onUpdateCard, onDeleteCard, onTransfer }: CardsManagerProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const total = cards.reduce((s, c) => s + c.balance, 0);
    const active = cards[activeIndex] ?? cards[0];
    const atMax = cards.length >= MAX_CARDS;

    if (!active) {
        return (
            <div className="rounded-brand-12 border border-dashed border-border-clr-dark bg-white p-brand-12 text-center">
                <p className="para-tiny mb-brand-8 text-text-secondary-muted">Abhi koi card nahi hai.</p>
                <CardFormDialog onAdd={onAddCard} onUpdate={onUpdateCard} />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col gap-brand-8 rounded-brand-12 border border-border-clr bg-white p-brand-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="para-small font-semibold text-text-dark">My Cards</h3>
                    <span className="rounded-full bg-page-bg px-2 py-0.5 para-tiny text-text-secondary-muter">{cards.length}/{MAX_CARDS}</span>
                </div>
                <CardFormDialog onAdd={onAddCard} onUpdate={onUpdateCard} disabledAdd={atMax} />
            </div>

            <p className="para-tiny text-text-secondary-muter">Total Balance: <span className="font-semibold text-text-dark">{fmt(total)}</span></p>

            <div className={cn("flex flex-col justify-between gap-brand-12 rounded-brand-12 p-brand-12 text-white", gradientStyles[active.gradient])}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="para-tiny text-white/70">{active.label}</p>
                        <p className="text-sm font-semibold">{fmt(active.balance)}</p>
                    </div>
                    <CardChip />
                </div>
                <div className="flex items-center justify-between para-tiny text-white/85">
                    <span>•••• •••• •••• {active.last4}</span>
                    <span>Exp {expiry(active)}</span>
                </div>
            </div>

            {cards.length > 1 && (
                <div className="flex justify-center gap-1.5">
                    {cards.map((c, i) => (
                        <button key={c.id} onClick={() => setActiveIndex(i)} aria-label={c.label}
                            className={cn("h-1.5 rounded-full default-transition", i === activeIndex ? "w-5 bg-primary" : "w-1.5 bg-border-clr")} />
                    ))}
                </div>
            )}

            <div className="mt-auto flex gap-brand-8">
                <ManageCardsDialog cards={cards} onDelete={onDeleteCard} onUpdateCard={onUpdateCard} />
                <TransferDialog cards={cards} onTransfer={onTransfer} />
            </div>
        </div>
    );
}

function CardChip() {
    return (
        <div className="flex items-center">
            <span className="h-5 w-5 rounded-full bg-white/85" />
            <span className="-ml-2 h-5 w-5 rounded-full bg-secondary-light mix-blend-screen" />
        </div>
    );
}

function ManageCardsDialog({ cards, onDelete, onUpdateCard }: { cards: ICard[]; onDelete: (id: string) => void; onUpdateCard: (id: string, patch: Partial<ICard>) => void }) {
    const [editingCard, setEditingCard] = useState<ICard | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    return (
        <Dialog.Root onOpenChange={(o) => !o && setConfirmId(null)}>
            <Dialog.Trigger asChild>
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-brand-8 bg-primary py-2 para-tiny font-semibold text-white hover:opacity-90">
                    <Settings2 size={13} /> Manage Cards
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12">
                    <div className="mb-brand-8 flex items-center justify-between">
                        <Dialog.Title className="para-small font-semibold text-text-dark">Cards Manage Karein</Dialog.Title>
                        <Dialog.Close><X size={16} /></Dialog.Close>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {cards.map((c) => (
                            <div key={c.id} className="flex items-center justify-between rounded-brand-8 border border-border-clr px-2.5 py-2">
                                <div>
                                    <p className="para-tiny font-semibold text-text-dark">{c.label}</p>
                                    <p className="para-tiny text-text-secondary-muter">•••• {c.last4} · {fmt(c.balance)} · Exp {expiry(c)}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {confirmId === c.id ? (
                                        <>
                                            <span className="para-tiny text-text-secondary-muter">Delete?</span>
                                            <button onClick={() => { onDelete(c.id); setConfirmId(null); }} className="rounded-brand-8 bg-danger px-2 py-1 para-tiny font-semibold text-white">Confirm</button>
                                            <button onClick={() => setConfirmId(null)} className="rounded-brand-8 border border-border-clr px-2 py-1 para-tiny font-semibold text-text-secondary">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setEditingCard(c)} className="text-text-secondary-muter hover:text-primary"><Pencil size={13} /></button>
                                            <button onClick={() => setConfirmId(c.id)} className="text-text-secondary-muter hover:text-danger"><Trash2 size={13} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Dialog.Content>
                <CardFormDialog editingCard={editingCard} onClose={() => setEditingCard(null)} onAdd={() => { }} onUpdate={onUpdateCard} />
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function TransferDialog({ cards, onTransfer }: { cards: ICard[]; onTransfer: (fromId: string, toId: string, amount: number) => void }) {
    const [open, setOpen] = useState(false);
    const [fromId, setFromId] = useState("");
    const [toId, setToId] = useState("");
    const [amount, setAmount] = useState("");

    // derived, so stale ids or same-card picks are impossible
    const from = cards.find((c) => c.id === fromId) ?? cards[0];
    const toOptions = cards.filter((c) => c.id !== from?.id);
    const to = toOptions.find((c) => c.id === toId) ?? toOptions[0];
    const value = Number(amount);
    const insufficient = Boolean(from) && value > from.balance;
    const valid = Boolean(from && to) && value > 0 && !insufficient;

    return (
        <Dialog.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) setAmount(""); }}>
            <Dialog.Trigger asChild>
                <button disabled={cards.length < 2} className="flex flex-1 items-center justify-center gap-1.5 rounded-brand-8 border border-border-clr py-2 para-tiny font-semibold text-text-secondary hover:bg-page-bg disabled:opacity-40">
                    <ArrowLeftRight size={13} /> Transfer
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-xs -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12">
                    <div className="mb-brand-8 flex items-center justify-between">
                        <Dialog.Title className="para-small font-semibold text-text-dark">Paisay Transfer Karein</Dialog.Title>
                        <Dialog.Close><X size={16} /></Dialog.Close>
                    </div>
                    <div className="flex flex-col gap-brand-8">
                        <select value={from?.id ?? ""} onChange={(e) => setFromId(e.target.value)} className={inputCls}>
                            {cards.map((c) => <option key={c.id} value={c.id}>Se: {c.label} ({fmt(c.balance)})</option>)}
                        </select>
                        <select value={to?.id ?? ""} onChange={(e) => setToId(e.target.value)} className={inputCls}>
                            {toOptions.map((c) => <option key={c.id} value={c.id}>Me: {c.label}</option>)}
                        </select>
                        <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Raqam (jaise: 5000)" className={inputCls} />
                        {insufficient && <span className="para-tiny text-danger">{from.label} me itna balance nahi hai</span>}
                        <button disabled={!valid} onClick={() => { onTransfer(from.id, to.id, value); setOpen(false); setAmount(""); }}
                            className="rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-40">
                            Transfer Karein
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}