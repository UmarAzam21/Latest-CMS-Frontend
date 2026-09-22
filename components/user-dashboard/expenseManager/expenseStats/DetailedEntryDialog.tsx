"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { detailedEntrySchema, DetailedEntryValues } from "@/lib/schemas/detailedEntrySchema";
import { ICard, ICategory, IExpenseEntry, EntryKind, KHATA_LABELS } from "@/types/expenseManager";

interface DetailedEntryDialogProps {
    kind: EntryKind | null; // null = closed
    categories: ICategory[]; cards: ICard[];
    editingEntry?: IExpenseEntry | null;
    onClose: () => void;
    onSaved: (values: DetailedEntryValues & { kind: EntryKind }) => void;
}

export default function DetailedEntryDialog({ kind, categories, cards, editingEntry, onClose, onSaved }: DetailedEntryDialogProps) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DetailedEntryValues>({
        resolver: zodResolver(detailedEntrySchema),
        defaultValues: { date: new Date().toISOString().slice(0, 10) },
    });
    const activeKind = editingEntry?.kind ?? kind;
    const open = activeKind !== null;

    useEffect(() => {
        if (editingEntry) {
            reset({ subject: editingEntry.subject, categoryId: editingEntry.categoryId, amount: editingEntry.amount, date: editingEntry.date.slice(0, 10), description: editingEntry.description, cardId: editingEntry.cardId ?? "", isSettled: editingEntry.isSettled });
        } else if (kind) {
            reset({ date: new Date().toISOString().slice(0, 10) });
        }
    }, [editingEntry, kind, reset]);

    const submit = (values: DetailedEntryValues) => { if (!activeKind) return; onSaved({ ...values, kind: activeKind }); onClose(); };

    if (!activeKind) return null;
    const labels = KHATA_LABELS[activeKind];

    return (
        <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12 shadow-card-hover">
                    <div className="mb-3 flex items-center justify-between border-b border-border-clr pb-3">
                        <Dialog.Title className="heading-h6 text-text-dark">{editingEntry ? `${labels.noun} Edit Karein` : labels.verb}</Dialog.Title>
                        <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary"><X size={17} /></Dialog.Close>
                    </div>
                    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-brand-8">
                        <Field label={labels.subjectLabel ?? "Tafseel"} error={errors.subject?.message}>
                            <input {...register("subject")} className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary" />
                        </Field>
                        <div className="grid grid-cols-2 gap-brand-8">
                            <Field label="Category" error={errors.categoryId?.message}>
                                <select {...register("categoryId")} defaultValue="" className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary">
                                    <option value="" disabled>Chunein</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Amount (Rs.)" error={errors.amount?.message}>
                                <input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary" />
                            </Field>
                        </div>
                        <Field label="Date" error={errors.date?.message}>
                            <input type="date" {...register("date")} className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary" />
                        </Field>
                        {activeKind === "debt" && (
                            <label className="flex items-center gap-2 para-small text-text-secondary">
                                <input type="checkbox" {...register("isSettled")} /> Ada ho gaya (Settled)
                            </label>
                        )}
                        {activeKind !== "debt" && (
                            <Field label="Card se ada karein (optional)">
                                <select {...register("cardId")} className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary">
                                    <option value="">Sirf record karein</option>
                                    {cards.map((c) => <option key={c.id} value={c.id}>{c.label} — PKR {c.balance.toLocaleString("en-PK")}</option>)}
                                </select>
                            </Field>
                        )}
                        <Field label="Note (optional)">
                            <textarea {...register("description")} rows={2} className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary" />
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
    return <div className="flex flex-col gap-1"><label className="para-tiny font-medium text-text-secondary">{label}</label>{children}{error && <span className="para-tiny text-danger">{error}</span>}</div>;
}