// dashboard\components\user-dashboard\expenseManager\cardsManager\CardFormDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Banknote, CalendarDays, Check, CreditCard, Hash, Landmark, Plus, Save, X } from "lucide-react";
import { ICard, MAX_CARDS } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";
import ATMCard, { ATMCardData, gradientStyles } from "../expenseStats/ATMCard";
import { Field, IconBox, inputCls } from "../ui/FormKit";

interface CardFormDialogProps {
    onAdd: (card: Omit<ICard, "id">) => void;
    onUpdate: (id: string, patch: Partial<ICard>) => void;
    disabledAdd?: boolean;                 // e.g. max cards reached
    editingCard?: ICard | null;            // pass a card (or null) = parent-controlled EDIT mode
    onClose?: () => void;
    open?: boolean;                        // parent-controlled ADD mode
    onOpenChange?: (o: boolean) => void;
    hideTrigger?: boolean;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const GRADIENTS: { key: ICard["gradient"]; label: string }[] = [
    { key: "primary", label: "Red" },
    { key: "secondary", label: "Green" },
    { key: "dark", label: "Dark" },
];

export default function CardFormDialog({ onAdd, onUpdate, disabledAdd, editingCard, onClose, open: openProp, onOpenChange, hideTrigger }: CardFormDialogProps) {
    const [inner, setInner] = useState(false);
    const editMode = editingCard !== undefined;
    const isOpen = editMode ? editingCard !== null : openProp !== undefined ? openProp : inner;
    const edit = editingCard ?? null;

    const handleOpenChange = (o: boolean) => {
        if (editMode) { if (!o) onClose?.(); }
        else if (openProp !== undefined) onOpenChange?.(o);
        else setInner(o);
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            {!editMode && !hideTrigger && (
                <Dialog.Trigger asChild>
                    <button type="button" disabled={disabledAdd}
                        title={disabledAdd ? `Zyada se zyada ${MAX_CARDS} cards` : "Naya card add karein"}
                        className="flex cursor-pointer items-center gap-1 rounded-brand-8 border border-border-clr px-brand-8 py-1.5 para-tiny font-semibold text-text-secondary hover:bg-page-bg disabled:cursor-not-allowed disabled:opacity-40">
                        <Plus size={14} /> Add Card
                    </button>
                </Dialog.Trigger>
            )}

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal flex max-h-[92dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-brand-12 bg-white shadow-card-hover">
                    <div className="flex items-start justify-between gap-3 border-b border-border-clr px-brand py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-brand-8 bg-danger-bg text-primary"><CreditCard size={18} /></span>
                            <div>
                                <Dialog.Title className="para-small font-semibold text-text-dark">{edit ? "Card Edit Karein" : "Naya Card Add Karein"}</Dialog.Title>
                                <Dialog.Description className="para-tiny text-text-secondary-muter">Bank ya wallet ka card, balance yahan track hoga</Dialog.Description>
                            </div>
                        </div>
                        <Dialog.Close aria-label="Band karein" className="cursor-pointer text-text-secondary-muter hover:text-text-secondary"><X size={16} /></Dialog.Close>
                    </div>

                    {/* mounted only while open, so every open starts with fresh state */}
                    <CardForm
                        key={edit?.id ?? "new"}
                        initial={edit}
                        onCancel={() => handleOpenChange(false)}
                        onSubmit={(data) => {
                            if (edit) onUpdate(edit.id, data); else onAdd(data);
                            handleOpenChange(false);
                        }}
                    />
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function CardForm({ initial, onSubmit, onCancel }: {
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

    const currentYY = new Date().getFullYear() % 100;
    const years = Array.from({ length: 13 }, (_, i) => currentYY + i);
    if (initial && !years.includes(initial.expiryYear)) years.push(initial.expiryYear);
    years.sort((a, b) => a - b);

    const balanceNum = balance === "" ? 0 : Number(balance);
    const valid = label.trim().length > 0 && /^\d{4}$/.test(last4) && month !== "" && year !== "" && balanceNum >= 0;

    const preview: ATMCardData = {
        gradient, label,
        balance: balance === "" ? undefined : balanceNum,
        last4,
        expiryMonth: month === "" ? undefined : Number(month),
        expiryYear: year === "" ? undefined : Number(year),
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({ label: label.trim(), balance: balanceNum, last4, expiryMonth: Number(month), expiryYear: Number(year), gradient });
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-brand-12 overflow-y-auto p-brand">
            <div className="flex justify-center rounded-brand-12 bg-page-bg py-brand-12">
                <ATMCard card={preview} flipped={showBack} animateIn className="max-w-[270px]" />
            </div>

            <Field label="Bank / Card ka naam" required hint="jaise: Meezan Bank, JazzCash">
                <IconBox icon={Landmark}>
                    <input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={24} placeholder="Meezan Bank" className={inputCls} autoComplete="off" />
                </IconBox>
            </Field>

            <div className="grid grid-cols-2 gap-brand-8">
                <Field label="Maujooda balance" hint="Abhi card mein kitne paise hain">
                    <IconBox prefix="Rs">
                        <input value={balance} onChange={(e) => setBalance(e.target.value)} onFocus={() => setShowBack(true)} onBlur={() => setShowBack(false)}
                            type="number" min={0} inputMode="decimal" placeholder="0" className={inputCls} />
                    </IconBox>
                </Field>
                <Field label="Aakhri 4 digits" required hint="pehchan k liye. Poora No na likhein">
                    <IconBox icon={Hash}>
                        <input value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            inputMode="numeric" maxLength={4} placeholder="1289" className={cn(inputCls, "font-mono tracking-widest")} />
                    </IconBox>
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-brand-8">
                <Field label="Expiry mahina" required>
                    <IconBox icon={CalendarDays}>
                        <select value={month} onChange={(e) => setMonth(e.target.value)} className={inputCls}>
                            <option value="">MM</option>
                            {MONTHS.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
                        </select>
                    </IconBox>
                </Field>
                <Field label="Expiry saal" required>
                    <IconBox icon={CalendarDays}>
                        <select value={year} onChange={(e) => setYear(e.target.value)} className={inputCls}>
                            <option value="">YY</option>
                            {years.map((y) => <option key={y} value={y}>{String(y).padStart(2, "0")}</option>)}
                        </select>
                    </IconBox>
                </Field>
            </div>

            <Field label="Card ka color" group>
                <div className="grid grid-cols-3 gap-2">
                    {GRADIENTS.map((g) => (
                        <button key={g.key} type="button" onClick={() => setGradient(g.key)} aria-pressed={gradient === g.key}
                            className={cn("flex h-9 cursor-pointer items-center justify-center gap-1 rounded-brand-8 para-tiny font-semibold text-white default-transition",
                                gradientStyles[g.key], gradient === g.key ? "ring-2 ring-primary ring-offset-1" : "opacity-75 hover:opacity-100")}>
                            {gradient === g.key && <Check size={12} />} {g.label}
                        </button>
                    ))}
                </div>
            </Field>

            <div className="flex gap-brand-8">
                <button type="button" onClick={onCancel}
                    className="flex-1 cursor-pointer rounded-brand-8 border border-border-clr py-2.5 para-small font-semibold text-text-secondary hover:bg-page-bg">Cancel</button>
                <button type="submit" disabled={!valid}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-brand-8 bg-primary py-2.5 para-small font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                    <Save size={15} /> {initial ? "Update Karein" : "Card Save Karein"}
                </button>
            </div>
        </form>
    );
}