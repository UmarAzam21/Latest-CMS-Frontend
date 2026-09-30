// components/user-dashboard/expenseManager/CardFormDialog.tsx
"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftRight, Pencil, Plus, Settings2, Trash2, X } from "lucide-react";
import { ICard, MAX_CARDS } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";
import ATMCard, { ATMCardData, gradientStyles } from "../expenseStats/ATMCard";

interface CardFormDialogProps {
    onAdd: (card: Omit<ICard, "id">) => void;
    onUpdate: (id: string, patch: Partial<ICard>) => void;
    /** disables the "Add" trigger (e.g. max cards reached) */
    disabledAdd?: boolean;
    /** Pass a card (or null) to use the dialog in controlled "edit" mode */
    editingCard?: ICard | null;
    onClose?: () => void;
}

const inputCls = "w-full rounded-brand-8 border border-border-clr px-2.5 py-2 para-tiny outline-none focus:border-primary";
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const GRADIENTS: { key: ICard["gradient"]; label: string }[] = [
    { key: "primary", label: "Red" },
    { key: "secondary", label: "Green" },
    { key: "dark", label: "Dark" },
];

function CardFormDialog({ onAdd, onUpdate, disabledAdd, editingCard, onClose }: CardFormDialogProps) {
    const controlled = editingCard !== undefined; // edit mode is opened by the parent
    const [open, setOpen] = useState(false);
    const isOpen = controlled ? editingCard !== null : open;

    const handleOpenChange = (o: boolean) => {
        if (controlled) {
            if (!o) onClose?.();
        } else {
            setOpen(o);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            {!controlled && (
                <Dialog.Trigger asChild>
                    <button
                        disabled={disabledAdd}
                        className="flex items-center gap-1 rounded-brand-8 border border-border-clr px-brand-8 py-1.5 para-tiny font-semibold text-text-secondary cursor-pointer hover:bg-page-bg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={14} /> Add
                    </button>
                </Dialog.Trigger>
            )}

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content
                    aria-describedby={undefined}
                    className="fixed left-1/2 top-1/2 z-modal max-h-[92vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-brand-12 bg-white p-brand"
                >
                    <div className="mb-brand-8 flex items-center justify-between">
                        <Dialog.Title className="para-small font-semibold text-text-dark">
                            {editingCard ? "Card Edit Karein" : "Naya Card Add Karein"}
                        </Dialog.Title>
                        <Dialog.Close aria-label="Close">
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    {/* Mounted only while open, so every open starts with fresh state */}
                    <CardForm
                        key={editingCard?.id ?? "new"}
                        initial={editingCard ?? null}
                        onCancel={() => handleOpenChange(false)}
                        onSubmit={(data) => {
                            if (editingCard) onUpdate(editingCard.id, data);
                            else onAdd(data);
                            handleOpenChange(false);
                        }}
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function CardForm({
    initial,
    onSubmit,
    onCancel,
}: {
    initial: ICard | null;
    onSubmit: (data: Omit<ICard, "id">) => void;
    onCancel: () => void;
}) {
    const [label, setLabel] = useState(initial?.label ?? "");
    const [balance, setBalance] = useState(initial ? String(initial.balance) : "");
    const [last4, setLast4] = useState(initial?.last4 ?? "");
    const [month, setMonth] = useState(initial ? String(initial.expiryMonth) : "");
    const [year, setYear] = useState(initial ? String(initial.expiryYear) : "");
    const [gradient, setGradient] = useState<ICard["gradient"]>(initial?.gradient ?? "primary");
    const [showBack, setShowBack] = useState(false);

    // two-digit years, current year + 12; keep an existing card's year even if it falls outside
    const currentYY = new Date().getFullYear() % 100;
    const years = Array.from({ length: 13 }, (_, i) => currentYY + i);

    if (initial && !years.includes(initial.expiryYear)) {
        years.push(initial.expiryYear);
    }

    years.sort((a, b) => a - b);

    const balanceNum = balance === "" ? 0 : Number(balance);

    const valid =
        label.trim().length > 0 &&
        /^\d{4}$/.test(last4) &&
        month !== "" &&
        year !== "" &&
        balanceNum >= 0;

    // this object is what the live preview renders, so it updates on every keystroke
    const preview: ATMCardData = {
        gradient,
        label,
        balance: balance === "" ? undefined : balanceNum,
        last4,
        expiryMonth: month === "" ? undefined : Number(month),
        expiryYear: year === "" ? undefined : Number(year),
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({
            label: label.trim(),
            balance: balanceNum,
            last4,
            expiryMonth: Number(month),
            expiryYear: Number(year),
            gradient,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-brand-12">
            {/* LIVE PREVIEW */}
            <div className="flex justify-center rounded-brand-12 bg-page-bg py-brand-12">
                <ATMCard card={preview} flipped={showBack} animateIn={true} className="max-w-[270px]" />
            </div>

            <div className="flex flex-col gap-brand-8">
                <Field label="Bank / Card ka naam">
                    <input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        maxLength={24}
                        placeholder="jaise: Meezan Bank"
                        className={inputCls}
                    />
                </Field>

                <div className="grid grid-cols-2 gap-brand-8">
                    <Field label="Balance (PKR)">
                        <input
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            onFocus={() => setShowBack(true)}
                            onBlur={() => setShowBack(false)}
                            type="number"
                            min={0}
                            inputMode="decimal"
                            placeholder="0"
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Card ke aakhri 4 digits">
                        <input
                            value={last4}
                            onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="1289"
                            className={cn(inputCls, "font-mono tracking-widest")}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-brand-8">
                    <Field label="Expiry Month">
                        <select value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls}>
                            <option value="">MM</option>
                            {MONTHS.map((m) => (
                                <option key={m} value={m}>
                                    {String(m).padStart(2, "0")}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Expiry Year">
                        <select value={year} onChange={(e) => setYear(e.target.value)} className={inputCls}>
                            <option value="">YY</option>
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {String(y).padStart(2, "0")}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Card ka color">
                    <div className="flex gap-2.5">
                        {GRADIENTS.map((g) => (
                            <button
                                key={g.key}
                                type="button"
                                onClick={() => setGradient(g.key)}
                                aria-label={g.label}
                                aria-pressed={gradient === g.key}
                                className={cn(
                                    "h-8 w-12 rounded-brand-8 default-transition cursor-pointer",
                                    gradientStyles[g.key],
                                    gradient === g.key ? "ring-1 ring-primary ring-offset-1" : "opacity-80 hover:opacity-100"
                                )}
                            />
                        ))}
                    </div>
                </Field>
            </div>

            <div className="mt-auto flex gap-brand-8">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-8 flex-1 rounded-brand-8 border border-border-clr para-tiny font-semibold text-text-secondary cursor-pointer hover:bg-page-bg"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!valid}
                    className="h-8 flex-1 rounded-brand-8 bg-primary para-tiny font-semibold text-white cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {initial ? "Update Karein" : "Card Add Karein"}
                </button>
            </div>
        </form>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="para-tiny font-medium text-text-secondary-muter">{label}</span>
            {children}
        </label>
    );
}

interface CardsManagerProps {
    cards: ICard[];
    onAddCard: (card: Omit<ICard, "id">) => void;
    onUpdateCard: (id: string, patch: Partial<ICard>) => void;
    onDeleteCard: (id: string) => void;
    onTransfer: (fromId: string, toId: string, amount: number) => void;
}

export default function CardsManager({ cards, onAddCard, onUpdateCard, onDeleteCard, onTransfer }: CardsManagerProps) {
    const [editingCard, setEditingCard] = useState<ICard | null>(null);
    const [selectedCardId, setSelectedCardId] = useState("");
    const [transferOpen, setTransferOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [fromId, setFromId] = useState("");
    const [toId, setToId] = useState("");
    const [amount, setAmount] = useState("");
    // confirm before card delete
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const atMax = cards.length >= MAX_CARDS;
    const from = cards.find((card) => card.id === fromId) ?? cards[0];
    const destinations = cards.filter((card) => card.id !== from?.id);
    const to = destinations.find((card) => card.id === toId) ?? destinations[0];
    const activeCard = cards.find((card) => card.id === selectedCardId) ?? cards[cards.length - 1];
    const transferAmount = Number(amount);
    const canTransfer = Boolean(from && to) && transferAmount > 0 && transferAmount <= (from?.balance ?? 0);

    return (
        <section className="flex h-full flex-col gap-brand-12 rounded-brand-12 border border-border-clr bg-white p-brand-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h3 className="para-small font-semibold text-text-dark">
                        My Cards
                    </h3>

                    <p className="para-tiny text-text-secondary-muter">
                        Link and manage your payment cards.
                    </p>
                </div>
                <CardFormDialog onAdd={onAddCard} onUpdate={onUpdateCard} disabledAdd={atMax} />
            </div>

            {/* Card + dots: takes the leftover height and stays centered */}
            {activeCard ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-brand-12 py-brand-12x">
                    <ATMCard card={activeCard} className="mx-auto" />

                    {cards.length > 1 && (
                        <div className="flex justify-center gap-1.5" aria-label="Choose card">
                            {cards.map((card) => (
                                <button
                                    key={card.id}
                                    type="button"
                                    aria-label={`Show ${card.label}`}
                                    aria-pressed={card.id === activeCard.id}
                                    onClick={() => setSelectedCardId(card.id)}
                                    className={`h-2 rounded-full cursor-pointer default-transition ${card.id === activeCard.id
                                        ? "w-5 bg-primary"
                                        : "w-2 bg-border-clr hover:bg-primary"
                                        }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <p className="flex flex-1 items-center justify-center para-tiny text-text-secondary-muter">
                    Abhi koi card nahi hai.
                </p>
            )}

            <CardFormDialog editingCard={editingCard} onClose={() => setEditingCard(null)} onAdd={onAddCard} onUpdate={onUpdateCard} />

            {/* Actions */}
            <div className="flex gap-brand-8">
                <button
                    type="button"
                    disabled={cards.length === 0}
                    onClick={() => setManageOpen(true)}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-brand-8 bg-primary para-tiny font-semibold text-white hover:opacity-90 disabled:opacity-40"
                >
                    <Settings2 size={13} /> Manage Cards
                </button>

                <button
                    type="button"
                    disabled={cards.length < 2}
                    onClick={() => setTransferOpen(true)}
                    className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-brand-8 border border-slate-200 para-tiny font-semibold text-black bg-[#fafafa]"
                >
                    <ArrowLeftRight size={13} /> Transfer
                </button>
            </div>

            {manageOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="manage-cards-title"
                    className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4"
                >
                    <div className="w-full max-w-sm rounded-brand-12 bg-white p-brand">
                        <div className="mb-brand-8 flex items-center justify-between">
                            <h2 id="manage-cards-title" className="para-small font-semibold text-text-dark">
                                Cards Manage Karein
                            </h2>
                            <button
                                type="button"
                                aria-label="Close manage cards"
                                onClick={() => setManageOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            {cards.map((card) => (
                                <div
                                    key={card.id}
                                    className="flex items-center justify-between rounded-brand-8 border border-border-clr px-2.5 py-2"
                                >
                                    <div>
                                        <p className="para-tiny font-semibold text-text-dark">
                                            {card.label}
                                        </p>
                                        <p className="para-tiny text-text-secondary-muter">
                                            •••• {card.last4} · PKR {card.balance.toLocaleString("en-PK")}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            aria-label={`Edit ${card.label}`}
                                            onClick={() => {
                                                setManageOpen(false);
                                                setEditingCard(card);
                                            }}
                                            className="text-text-secondary-muter hover:text-primary"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        {
                                            confirmId === card.id ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="para-tiny text-text-secondary-muter">Delete?</span>
                                                    <button
                                                        type="button"
                                                        aria-label={`Delete ${card.label}`}
                                                        onClick={() => {
                                                            onDeleteCard(card.id);
                                                            setConfirmId(null);
                                                        }}
                                                        className="rounded-brand-8 bg-danger px-2 py-1 para-tiny font-semibold text-white"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmId(null)}
                                                        className="rounded-brand-8 border border-border-clr px-2 py-1 para-tiny font-semibold text-text-secondary"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    aria-label={`Delete ${card.label}`}
                                                    onClick={() => setConfirmId(card.id)}
                                                    className="cursor-pointer text-text-secondary-muter hover:text-danger"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {transferOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="transfer-title"
                    className="fixed inset-0 z-modal flex items-center justify-center bg-black/40 p-4"
                >
                    <div className="w-full max-w-xs rounded-brand-12 bg-white p-brand">
                        <div className="mb-brand-8 flex items-center justify-between">
                            <h2 id="transfer-title" className="para-small font-semibold text-text-dark">
                                Paisay Transfer Karein
                            </h2>
                            <button
                                type="button"
                                aria-label="Close transfer"
                                onClick={() => setTransferOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-brand-8">
                            <select
                                aria-label="From card"
                                value={from?.id ?? ""}
                                onChange={(event) => setFromId(event.target.value)}
                                className={inputCls}
                            >
                                {cards.map((card) => (
                                    <option key={card.id} value={card.id}>
                                        {card.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                aria-label="To card"
                                value={to?.id ?? ""}
                                onChange={(event) => setToId(event.target.value)}
                                className={inputCls}
                            >
                                {destinations.map((card) => (
                                    <option key={card.id} value={card.id}>
                                        {card.label}
                                    </option>
                                ))}
                            </select>

                            <input
                                aria-label="Transfer amount"
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                placeholder="Amount (PKR)"
                                className={inputCls}
                            />

                            <button
                                type="button"
                                disabled={!canTransfer}
                                onClick={() => {
                                    if (!from || !to) return;
                                    onTransfer(from.id, to.id, transferAmount);
                                    setTransferOpen(false);
                                    setAmount("");
                                }}
                                className="rounded-brand-8 bg-primary py-2 para-tiny font-semibold text-white disabled:opacity-40"
                            >
                                Transfer Karein
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}