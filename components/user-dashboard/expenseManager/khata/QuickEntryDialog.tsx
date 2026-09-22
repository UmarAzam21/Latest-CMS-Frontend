"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { quickEntrySchema, QuickEntryValues } from "@/lib/schemas/quickEntrySchema";
import { EntryKind, ICategory } from "@/types/expenseManager";

interface QuickEntryDialogProps {
    kind: EntryKind;
    title: string;
    subjectLabel: string;
    accentClass: string;
    categories: ICategory[];
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onSaved: (values: QuickEntryValues & { kind: EntryKind }) => void;
}

export default function QuickEntryDialog({ kind, title, subjectLabel, accentClass, categories, open, onOpenChange, onSaved }: QuickEntryDialogProps) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<QuickEntryValues>({
        resolver: zodResolver(quickEntrySchema),
        defaultValues: { date: new Date().toISOString().slice(0, 10) },
    });

    const submit = (values: QuickEntryValues) => {
        onSaved({ ...values, kind });
        reset();
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12 shadow-card-hover">
                    <div className={`mb-3 flex items-center justify-between rounded-brand-8 px-3 py-2 ${accentClass}`}>
                        <Dialog.Title className="para-small font-semibold text-white">{title}</Dialog.Title>
                        <Dialog.Close className="text-white/80 hover:text-white">
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="para-tiny font-medium text-text-secondary">{subjectLabel}</label>
                            <input
                                {...register("subject")}
                                autoFocus
                                className="rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                            />
                            {errors.subject && <span className="para-tiny text-danger">{errors.subject.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="para-tiny font-medium text-text-secondary">Amount (Rs.)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register("amount", { valueAsNumber: true })}
                                className="rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                            />
                            {errors.amount && <span className="para-tiny text-danger">{errors.amount.message}</span>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="para-tiny font-medium text-text-secondary">Category (optional)</label>
                            <select
                                {...register("categoryId")}
                                className="rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                                defaultValue=""
                            >
                                <option value="">— Skip —</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <input type="hidden" {...register("date")} />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-1 rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-50"
                        >
                            {isSubmitting ? "Save ho raha hai..." : "Save Karein"}
                        </button>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
