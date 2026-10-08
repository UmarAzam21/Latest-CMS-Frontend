"use client";
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { makeEntrySchema, DetailedEntryValues } from "@/lib/schemas/detailedEntrySchema";
import { PartyFormValues } from "@/lib/schemas/partySchema";
import { getCategoriesForEntryKind } from "@/data/user-dashboard/defaultCategoriesData";
import { ICard, ICategory, IExpenseEntry, IParty, EntryKind, KHATA_LABELS } from "@/types/expenseManagerTy";
import AddPartyDialog from "../party/AddPartyDialog";

export type EntrySavePayload = Omit<DetailedEntryValues, "subject"> & { subject: string; kind: EntryKind };

interface DetailedEntryDialogProps {
    kind: EntryKind | null;
    categories: ICategory[];
    cards: ICard[];
    parties: IParty[];
    onAddParty: (p: PartyFormValues) => IParty;
    editingEntry?: IExpenseEntry | null;
    presetPartyId?: string;
    categoryIds?: string[];
    defaultCategoryId?: string;
    onClose: () => void;
    onSaved: (values: EntrySavePayload) => void;
}

const inputCls = "w-full rounded-brand-8 border border-border-clr px-2.5 py-2 para-tiny text-text-secondary outline-none focus:border-primary-light";
const today = () => new Date().toISOString().slice(0, 10);

export default function DetailedEntryDialogV2({
    kind, categories, cards, parties, onAddParty, editingEntry, presetPartyId, categoryIds, defaultCategoryId, onClose, onSaved,
}: DetailedEntryDialogProps) {
    const activeKind = editingEntry?.kind ?? kind;
    const isDebt = activeKind === "debt";

    const categoryOptions = useMemo(() => {
        const list = getCategoriesForEntryKind(activeKind, categories);
        return categoryIds ? list.filter((c) => categoryIds.includes(c.id)) : list;
    }, [activeKind, categories, categoryIds]);

    const schema = useMemo(() => makeEntrySchema(activeKind), [activeKind]);

    const { register, control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } =
        useForm<DetailedEntryValues>({
            resolver: zodResolver(schema),
            defaultValues: { date: today(), cardId: "", partyId: "" },
        });

    const openKey = editingEntry ? `edit-${editingEntry.id}` : kind ? `new-${kind}` : null;

    useEffect(() => {
        if (!openKey) return;
        if (editingEntry) {
            reset({
                subject: editingEntry.subject,
                partyId: editingEntry.partyId ?? "",
                categoryId: editingEntry.categoryId || categoryOptions[0]?.id || "",
                amount: editingEntry.amount,
                date: editingEntry.date.slice(0, 10),
                description: editingEntry.description ?? "",
                cardId: editingEntry.cardId ?? "",
            });
        } else {
            reset({
                subject: "",
                partyId: presetPartyId ?? "",
                categoryId: defaultCategoryId ?? categoryOptions[0]?.id ?? "",
                amount: undefined,
                date: today(),
                description: "",
                cardId: "", // Cash by default
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openKey]);

    const submit = (v: DetailedEntryValues) => {
        if (!activeKind) return;
        const party = parties.find((p) => p.id === v.partyId);
        onSaved({
            ...v,
            kind: activeKind,
            subject: v.subject?.trim() || party?.name || "",
            partyId: v.partyId || undefined,
            description: v.description?.trim() || undefined,
            cardId: isDebt ? undefined : v.cardId || undefined,
        });
        onClose();
    };

    if (!activeKind) return null;
    const labels = KHATA_LABELS[activeKind];

    return (
        <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal max-h-[90dvh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-brand-12 bg-white p-brand shadow-card-hover">
                    <div className="mb-brand-8 flex items-center justify-between border-b border-border-clr pb-brand-8">
                        <Dialog.Title className="para-small font-semibold text-text-dark">
                            {editingEntry ? `${labels.noun} Edit Karein` : labels.verb}
                        </Dialog.Title>
                        <Dialog.Close className="cursor-pointer text-text-secondary-muter hover:text-text-secondary">
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-brand-8">
                        <Field label={isDebt ? "Party (zaroori)" : "Party (optional)"} error={errors.partyId?.message}>
                            <div className="flex gap-2">
                                <Controller
                                    name="partyId"
                                    control={control}
                                    render={({ field }) => (
                                        <select {...field} value={field.value ?? ""} disabled={Boolean(presetPartyId)} className={inputCls}>
                                            <option value="">{isDebt ? "Party chunein" : "Koi party nahi"}</option>
                                            {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    )}
                                />
                                {!presetPartyId && (
                                    <AddPartyDialog onSaved={(v) => setValue("partyId", onAddParty(v).id, { shouldValidate: true })} />
                                )}
                            </div>
                        </Field>

                        {!isDebt && (
                            <Field label={labels.subjectLabel} error={errors.subject?.message}>
                                <input {...register("subject")} placeholder={labels.subjectPlaceholder} className={inputCls} />
                            </Field>
                        )}

                        <div className="grid grid-cols-2 gap-brand-8">
                            <Field label={`Category (${labels.categoryHint})`} error={errors.categoryId?.message}>
                                <select {...register("categoryId")} className={inputCls}>
                                    {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Tareekh" error={errors.date?.message}>
                                <input type="date" {...register("date")} className={inputCls} />
                            </Field>
                        </div>

                        <Field label="Raqam (Rs.)" error={errors.amount?.message}>
                            <input type="number" step="0.01" placeholder="jaise: 5000"
                                {...register("amount", { valueAsNumber: true })} className={inputCls} />
                        </Field>

                        {!isDebt && (
                            <Field label={labels.cardLabel ?? "Card (optional)"}>
                                <select {...register("cardId")} className={inputCls}>
                                    <option value="">Cash (koi card nahi)</option>
                                    {cards.map((c) => (
                                        <option key={c.id} value={c.id}>{c.label} — PKR {c.balance.toLocaleString("en-PK")}</option>
                                    ))}
                                </select>
                            </Field>
                        )}

                        <Field label="Note (optional)">
                            <textarea {...register("description")} rows={2}
                                placeholder="jaise: cash mila, wapsi 15 tareekh ko" className={inputCls} />
                        </Field>

                        <button type="submit" disabled={isSubmitting}
                            className="mt-1 rounded-brand-8 bg-primary py-2 para-tiny font-semibold text-white disabled:opacity-50">
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
            <label className="para-tiny text-text-secondary-muted">{label}</label>
            {children}
            {error && <span className="para-tiny text-danger">{error}</span>}
        </div>
    );
}