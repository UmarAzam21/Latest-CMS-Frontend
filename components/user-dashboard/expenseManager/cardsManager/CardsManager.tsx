// components/user-dashboard/expenseManager/CardFormDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeftRight, ArrowRight, CreditCard, Pencil, Settings2, Trash2, X } from "lucide-react";
import { ICard, MAX_CARDS } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";
import ATMCard, { gradientStyles } from "../expenseStats/ATMCard";
import CardFormDialog from "./CardFormDialog";
import { Field, IconBox, inputCls } from "../ui/FormKit";

interface CardsManagerProps {
    cards: ICard[];
    onAddCard: (card: Omit<ICard, "id">) => void;
    onUpdateCard: (id: string, patch: Partial<ICard>) => void;
    onDeleteCard: (id: string) => void;
    onTransfer: (fromId: string, toId: string, amount: number) => void;
}

const pk = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;
const contentCls = "fixed left-1/2 top-1/2 z-modal w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-brand-12 bg-white shadow-card-hover";

function DialogHeader({ icon: Icon, title, subtitle }: { icon: typeof CreditCard; title: string; subtitle: string }) {
    return (
        <div className="flex items-start justify-between gap-3 border-b border-border-clr px-brand py-3">
            <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-brand-8 bg-danger-bg text-primary"><Icon size={18} /></span>
                <div>
                    <Dialog.Title className="para-small font-semibold text-text-dark">{title}</Dialog.Title>
                    <Dialog.Description className="para-tiny text-text-secondary-muter">{subtitle}</Dialog.Description>
                </div>
            </div>
            <Dialog.Close aria-label="Band karein" className="cursor-pointer text-text-secondary-muter hover:text-text-secondary"><X size={16} /></Dialog.Close>
        </div>
    );
}

export default function CardsManager({ cards, onAddCard, onUpdateCard, onDeleteCard, onTransfer }: CardsManagerProps) {
    const [editingCard, setEditingCard] = useState<ICard | null>(null);
    const [selectedCardId, setSelectedCardId] = useState("");
    const [transferOpen, setTransferOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [fromId, setFromId] = useState("");
    const [toId, setToId] = useState("");
    const [amount, setAmount] = useState("");
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const atMax = cards.length >= MAX_CARDS;
    const from = cards.find((c) => c.id === fromId) ?? cards[0];
    const destinations = cards.filter((c) => c.id !== from?.id);
    const to = destinations.find((c) => c.id === toId) ?? destinations[0];
    const activeCard = cards.find((c) => c.id === selectedCardId) ?? cards[cards.length - 1];
    const transferAmount = Number(amount);
    const tooMuch = transferAmount > (from?.balance ?? 0);
    const canTransfer = Boolean(from && to) && transferAmount > 0 && !tooMuch;

    return (
        <section className="flex h-full flex-col gap-brand-12 rounded-brand-12 border border-border-clr bg-white p-brand-12">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <h3 className="para-small font-semibold text-text-dark">My Cards</h3>
                    <p className="para-tiny text-text-secondary-muter">Apne cards add karein aur balance dekhein</p>
                </div>
                <CardFormDialog onAdd={onAddCard} onUpdate={onUpdateCard} disabledAdd={atMax} />
            </div>

            {activeCard ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-brand-12">
                    <ATMCard card={activeCard} className="mx-auto" />
                    {cards.length > 1 && (
                        <div className="flex justify-center gap-1.5" aria-label="Card chunein">
                            {cards.map((c) => (
                                <button key={c.id} type="button" aria-label={`${c.label} dikhayein`} aria-pressed={c.id === activeCard.id}
                                    onClick={() => setSelectedCardId(c.id)}
                                    className={`h-2 cursor-pointer rounded-full default-transition ${c.id === activeCard.id ? "w-5 bg-primary" : "w-2 bg-border-clr hover:bg-primary"}`} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-text-secondary-muted">
                    <CreditCard size={26} />
                    <p className="para-tiny">Abhi koi card nahi hai. Upar &quot;Add Card&quot; dabayein.</p>
                </div>
            )}

            {/* edit mode (opened from Manage) */}
            <CardFormDialog editingCard={editingCard} onClose={() => setEditingCard(null)} onAdd={onAddCard} onUpdate={onUpdateCard} />

            <div className="flex gap-brand-8">
                <button type="button" disabled={cards.length === 0} onClick={() => setManageOpen(true)}
                    title={cards.length === 0 ? "Pehle koi card add karein" : undefined}
                    className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-brand-8 bg-primary para-tiny font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                    <Settings2 size={13} /> Manage Cards
                </button>
                <button type="button" disabled={cards.length < 2} onClick={() => setTransferOpen(true)}
                    title={cards.length < 2 ? "Transfer ke liye kam az kam 2 cards chahiye" : undefined}
                    className="flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-brand-8 border border-border-clr bg-white para-tiny font-semibold text-text-dark hover:bg-page-bg disabled:cursor-not-allowed disabled:opacity-40">
                    <ArrowLeftRight size={13} /> Transfer
                </button>
            </div>

            {/* MANAGE */}
            <Dialog.Root open={manageOpen} onOpenChange={(o) => { setManageOpen(o); if (!o) setConfirmId(null); }}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                    <Dialog.Content className={`${contentCls} max-w-sm`}>
                        <DialogHeader icon={Settings2} title="Cards Manage Karein" subtitle="Card edit ya delete karein" />
                        <div className="flex max-h-[60dvh] flex-col gap-2 overflow-y-auto p-brand">
                            {cards.map((card) => (
                                <div key={card.id} className="rounded-brand-8 border border-border-clr px-2.5 py-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <span className={cn("h-7 w-11 shrink-0 rounded-brand-8", gradientStyles[card.gradient])} />
                                            <div className="min-w-0">
                                                <p className="truncate para-small font-semibold text-text-dark">{card.label}</p>
                                                <p className="para-tiny text-text-secondary-muter">•••• {card.last4} · {pk(card.balance)}</p>
                                            </div>
                                        </div>
                                        {confirmId === card.id ? (
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <button type="button" onClick={() => { onDeleteCard(card.id); setConfirmId(null); if (cards.length === 1) setManageOpen(false); }}
                                                    className="cursor-pointer rounded-brand-8 bg-danger px-2 py-1 para-tiny font-semibold text-white">Haan</button>
                                                <button type="button" onClick={() => setConfirmId(null)}
                                                    className="cursor-pointer rounded-brand-8 border border-border-clr px-2 py-1 para-tiny font-semibold text-text-secondary">Nahi</button>
                                            </div>
                                        ) : (
                                            <div className="flex shrink-0 items-center gap-3">
                                                <button type="button" onClick={() => { setManageOpen(false); setEditingCard(card); }}
                                                    className="flex cursor-pointer items-center gap-1 para-tiny font-semibold text-text-secondary hover:text-primary"><Pencil size={12} /> Edit</button>
                                                <button type="button" onClick={() => setConfirmId(card.id)}
                                                    className="flex cursor-pointer items-center gap-1 para-tiny font-semibold text-text-secondary hover:text-danger"><Trash2 size={12} /> Delete</button>
                                            </div>
                                        )}
                                    </div>
                                    {confirmId === card.id && (
                                        <p className="mt-1.5 para-tiny text-danger">Card delete karein? Is se judi entries &quot;Cash&quot; ho jayengi.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>

            {/* TRANSFER */}
            <Dialog.Root open={transferOpen} onOpenChange={setTransferOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                    <Dialog.Content className={`${contentCls} max-w-xs`}>
                        <DialogHeader icon={ArrowLeftRight} title="Paisay Transfer Karein" subtitle="Ek card se doosre card mein" />
                        <div className="flex flex-col gap-brand-12 p-brand">
                            <Field label="Kis card se (From)">
                                <IconBox icon={CreditCard}>
                                    <select value={from?.id ?? ""} onChange={(e) => setFromId(e.target.value)} className={inputCls}>
                                        {cards.map((c) => <option key={c.id} value={c.id}>{c.label} — {pk(c.balance)}</option>)}
                                    </select>
                                </IconBox>
                            </Field>

                            <div className="flex justify-center text-text-secondary-muter"><ArrowRight size={16} className="rotate-90" /></div>

                            <Field label="Kis card mein (To)">
                                <IconBox icon={CreditCard}>
                                    <select value={to?.id ?? ""} onChange={(e) => setToId(e.target.value)} className={inputCls}>
                                        {destinations.map((c) => <option key={c.id} value={c.id}>{c.label} — {pk(c.balance)}</option>)}
                                    </select>
                                </IconBox>
                            </Field>

                            <Field label="Raqam" required
                                hint={from ? `${from.label} mein available: ${pk(from.balance)}` : undefined}
                                error={amount && tooMuch ? `Itna balance nahi hai (available ${pk(from?.balance ?? 0)})` : undefined}>
                                <IconBox prefix="Rs">
                                    <input type="number" min="1" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="jaise: 5000" className={inputCls} />
                                </IconBox>
                            </Field>

                            <button type="button" disabled={!canTransfer}
                                onClick={() => { if (!from || !to) return; onTransfer(from.id, to.id, transferAmount); setTransferOpen(false); setAmount(""); }}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-brand-8 bg-primary py-2.5 para-small font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                                <ArrowLeftRight size={15} /> Transfer Karein
                            </button>
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </section>
    );
}