// dashboard\components\user-dashboard\expenseManager\expenseStats\DetailedEntryDialog.tsx

"use client";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { detailedEntrySchema, DetailedEntryValues } from "@/lib/schemas/detailedEntrySchema";
import { getCategoriesForEntryKind } from "@/data/user-dashboard/defaultCategoriesData";
import { ICard, ICategory, IExpenseEntry, EntryKind, DebtDirection, KHATA_LABELS, DEBT_CARD_LABELS, DEBT_CATEGORY_DIRECTION } from "@/types/expenseManagerTy";

interface DetailedEntryDialogProps {
    kind: EntryKind | null;
    categories: ICategory[];
    cards: ICard[];
    editingEntry?: IExpenseEntry | null;
    onClose: () => void;
    onSaved: (values: DetailedEntryValues & { kind: EntryKind; debtDirection?: DebtDirection }) => void;
}

const inputCls = "w-full rounded-brand-8 border border-border-clr px-2.5 py-2 para-small outline-none focus:border-primary";
const today = () => new Date().toISOString().slice(0, 10);

export default function DetailedEntryDialog({ kind, categories, cards, editingEntry, onClose, onSaved }: DetailedEntryDialogProps) {
    const activeKind = editingEntry?.kind ?? kind;
    // memoized: a fresh array every render is what caused the infinite loop
    const categoryOptions = useMemo(() => getCategoriesForEntryKind(activeKind, categories), [activeKind, categories]);

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<DetailedEntryValues>({
        resolver: zodResolver(detailedEntrySchema),
        defaultValues: { date: today(), cardId: "" },
    });

    // Reset ONLY when the dialog opens for a new entry / a different edited entry.
    const openKey = editingEntry ? `edit-${editingEntry.id}` : kind ? `new-${kind}` : null;
    useEffect(() => {
        if (!openKey) return;
        if (editingEntry) {
            reset({
                subject: editingEntry.subject,
                categoryId: editingEntry.categoryId || categoryOptions[0]?.id || "",
                amount: editingEntry.amount,
                date: editingEntry.date.slice(0, 10),
                description: editingEntry.description ?? "",
                cardId: editingEntry.cardId ?? "",
                isSettled: Boolean(editingEntry.isSettled),
            });
        } else {
            reset({ subject: "", categoryId: categoryOptions[0]?.id ?? "", amount: undefined, date: today(), description: "", cardId: cards[0]?.id ?? "", isSettled: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openKey]);

    const categoryId = watch("categoryId");
    const debtDirection: DebtDirection = DEBT_CATEGORY_DIRECTION[categoryId] ?? "lena";

    const submit = (v: DetailedEntryValues) => {
        if (!activeKind) return;
        onSaved({
            ...v,
            subject: v.subject.trim(),
            description: v.description?.trim() || undefined,
            kind: activeKind,
            cardId: v.cardId || undefined,
            debtDirection: activeKind === "debt" ? debtDirection : undefined,
            isSettled: activeKind === "debt" ? Boolean(v.isSettled) : false,
        });
        onClose();
    };

    if (!activeKind) return null;
    const labels = KHATA_LABELS[activeKind];
    const cardLabel = activeKind === "debt" ? DEBT_CARD_LABELS[debtDirection] : labels.cardLabel;

    return (
        <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12 shadow-card-hover">
                    <div className="mb-brand-8 flex items-center justify-between border-b border-border-clr pb-brand-8">
                        <Dialog.Title className="para-small font-semibold text-text-dark">
                            {editingEntry ? `${labels.noun} Edit Karein` : labels.verb}
                        </Dialog.Title>
                        <Dialog.Close className="cursor-pointer text-text-secondary-muter hover:text-text-secondary"><X size={16} /></Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-brand-8">
                        <Field label={labels.subjectLabel} error={errors.subject?.message}>
                            <input {...register("subject")} placeholder={labels.subjectPlaceholder} className={inputCls} />
                        </Field>

                        <div className="grid grid-cols-2 gap-brand-8">
                            <Field label={`Category (${labels.categoryHint})`} error={errors.categoryId?.message}>
                                <select {...register("categoryId")} className={inputCls}>
                                    {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Raqam (Rs.)" error={errors.amount?.message}>
                                <input type="number" step="0.01" placeholder="jaise: 5000" {...register("amount", { valueAsNumber: true })} className={inputCls} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-brand-8">
                            <Field label="Tareekh" error={errors.date?.message}>
                                <input type="date" {...register("date")} className={inputCls} />
                            </Field>
                            <Field label={cardLabel ?? "Card (optional)"}>
                                <select {...register("cardId")} className={inputCls}>
                                    <option value="">Sirf record karein (koi card nahi)</option>
                                    {cards.map((c) => <option key={c.id} value={c.id}>{c.label} — PKR {c.balance.toLocaleString("en-PK")}</option>)}
                                </select>
                            </Field>
                        </div>

                        {activeKind === "debt" && editingEntry && (
                            <label className="flex items-center gap-2 para-tiny text-text-secondary">
                                <input type="checkbox" {...register("isSettled")} /> Ada ho gaya (Settled)
                            </label>
                        )}

                        <Field label="Note (optional)">
                            <textarea {...register("description")} rows={2} placeholder="jaise: cash mila, wapsi 15 tareekh ko" className={inputCls} />
                        </Field>

                        <button type="submit" disabled={isSubmitting} className="mt-1 rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-50">
                            {isSubmitting ? "Save ho raha hai..." : "Save Karein"}
                        </button>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="para-tiny font-medium text-text-secondary">{label}</label>
            {children}
            {error && <span className="para-tiny text-danger">{error}</span>}
        </div>
    );
}