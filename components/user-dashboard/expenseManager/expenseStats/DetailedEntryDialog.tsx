// dashboard\components\user-dashboard\expenseManager\expenseStats\DetailedEntryDialog.tsx

"use client";
import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import {
    Banknote, CalendarDays, CircleDollarSign, Clock, CreditCard, FileText, Save, StickyNote, Tags,
    TrendingDown, TrendingUp, User, UserPlus, X, type LucideIcon,
} from "lucide-react";
import { makeEntrySchema, DetailedEntryValues } from "@/lib/schemas/detailedEntrySchema";
import { PartyFormValues } from "@/lib/schemas/partySchema";
import { getCategoriesForEntryKind } from "@/data/user-dashboard/defaultCategoriesData";
import { debtSign } from "@/lib/utils/debt";
import { entryTime, localDate, localTime } from "@/lib/utils/dateFmt";
import { ICard, ICategory, IExpenseEntry, IParty, EntryKind, KHATA_LABELS, DEBT_CATEGORY_TYPE, DEBT_TYPE_HINTS } from "@/types/expenseManagerTy";
import { Field, IconBox, inputCls, inputPlainCls } from "../ui/FormKit";
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

const COPY: Record<EntryKind, {
    icon: LucideIcon; subtitle: string; subject: string; placeholder: string; subjectHint: string; partyHint: string; card: string;
}> = {
    income: {
        icon: TrendingUp, subtitle: "Jo paise aap ko mile, unka record",
        subject: "Aamdani kis cheez ki hai?", placeholder: "jaise: Ahmed se payment, Dukaan ki sale",
        subjectHint: "Chhota naam likhein jo baad mein pehchan sakein",
        partyHint: "Kisi party se mile hon to chunein (zaroori nahi)",
        card: "Paise kis card mein aaye?",
    },
    expense: {
        icon: TrendingDown, subtitle: "Jo paise aap ne kharch kiye, unka record",
        subject: "Kharcha kis cheez ka hai?", placeholder: "jaise: Bijli ka bill, Grocery",
        subjectHint: "Chhota naam likhein jo baad mein pehchan sakein",
        partyHint: "Kisi party ko diya ho to chunein (zaroori nahi)",
        card: "Paise kis card se diye?",
    },
    debt: {
        icon: CircleDollarSign, subtitle: "Kisi party ke saath udhaar ka len-den",
        subject: "", placeholder: "", subjectHint: "",
        partyHint: "Kis ke saath len-den hua? Na mile to + dabakar nayi party banayein",
        card: "",
    },
};

export default function DetailedEntryDialog({
    kind, categories, cards, parties, onAddParty, editingEntry, presetPartyId, categoryIds, defaultCategoryId, onClose, onSaved,
}: DetailedEntryDialogProps) {
    const activeKind = editingEntry?.kind ?? kind;
    const isDebt = activeKind === "debt";

    const categoryOptions = useMemo(() => {
        const list = getCategoriesForEntryKind(activeKind, categories);
        return categoryIds ? list.filter((c) => categoryIds.includes(c.id)) : list;
    }, [activeKind, categories, categoryIds]);

    const schema = useMemo(() => makeEntrySchema(activeKind), [activeKind]);

    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } =
        useForm<DetailedEntryValues>({
            resolver: zodResolver(schema),
            defaultValues: { date: localDate(), time: localTime(), cardId: "", partyId: "" },
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
                time: entryTime(editingEntry),
                description: editingEntry.description ?? "",
                cardId: editingEntry.cardId ?? "",
            });
        } else {
            reset({
                subject: "",
                partyId: presetPartyId ?? "",
                categoryId: defaultCategoryId ?? categoryOptions[0]?.id ?? "",
                amount: undefined,
                date: localDate(),
                time: localTime(),
                description: "",
                cardId: "", // Cash by default
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openKey]);

    const watchedCategory = watch("categoryId");
    const watchedParty = watch("partyId");

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
    const copy = COPY[activeKind];
    const HeaderIcon = copy.icon;

    // Udhaar: header colour follows the chosen type (+1 = You Gave = red, -1 = You Got = green)
    const sign = isDebt ? debtSign({ kind: "debt", categoryId: watchedCategory ?? "" }) : 0;
    const headerCls = sign > 0 ? "bg-danger text-white" : sign < 0 ? "bg-green-600 text-white" : "border-b border-border-clr bg-white text-text-dark";
    const buttonCls = sign > 0 ? "bg-danger" : sign < 0 ? "bg-green-600" : "bg-primary";
    const partyName = parties.find((p) => p.id === watchedParty)?.name;
    const debtType = DEBT_CATEGORY_TYPE[watchedCategory ?? ""];

    const title = isDebt
        ? `${sign > 0 ? "You Gave" : sign < 0 ? "You Got" : "Udhaar Entry"}${partyName ? ` — ${partyName}` : ""}`
        : editingEntry ? `${labels.noun} Edit Karein` : labels.verb;

    return (
        <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-brand-12 bg-white shadow-card-hover">
                    <div className={`flex items-center justify-between gap-3 px-brand py-3 ${headerCls}`}>
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand-8 bg-black/10"><HeaderIcon size={18} /></span>
                            <div className="min-w-0">
                                <Dialog.Title className="truncate para-small font-semibold">{title}</Dialog.Title>
                                <Dialog.Description className="truncate para-tiny opacity-80">{copy.subtitle}</Dialog.Description>
                            </div>
                        </div>
                        <Dialog.Close className="cursor-pointer opacity-80 hover:opacity-100"><X size={16} /></Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-brand-12 overflow-y-auto p-brand">
                        <Field label="Party" required={isDebt} hint={copy.partyHint} error={errors.partyId?.message}>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <IconBox icon={User}>
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
                                    </IconBox>
                                </div>
                                {!presetPartyId && (
                                    <AddPartyDialog
                                        onSaved={(v) => setValue("partyId", onAddParty(v).id, { shouldValidate: true })}
                                        trigger={
                                            <button type="button" title="Nayi party add karein" aria-label="Nayi party add karein"
                                                className="flex shrink-0 cursor-pointer items-center justify-center rounded-brand-8 border border-primary px-3 text-primary default-transition hover:bg-primary hover:text-white">
                                                <UserPlus size={16} />
                                            </button>
                                        }
                                    />
                                )}
                            </div>
                        </Field>

                        {!isDebt && (
                            <Field label={copy.subject} required hint={copy.subjectHint} error={errors.subject?.message}>
                                <IconBox icon={FileText}>
                                    <input {...register("subject")} placeholder={copy.placeholder} className={inputCls} autoComplete="off" />
                                </IconBox>
                            </Field>
                        )}

                        <Field
                            label={isDebt ? "Udhaar ki qism" : "Category"}
                            required
                            hint={isDebt && debtType ? DEBT_TYPE_HINTS[debtType] : undefined}
                            error={errors.categoryId?.message}
                        >
                            <IconBox icon={Tags}>
                                <select {...register("categoryId")} className={inputCls}>
                                    {categoryOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </IconBox>
                        </Field>

                        <Field label="Raqam" required error={errors.amount?.message}>
                            <IconBox prefix="Rs">
                                <input type="number" step="0.01" inputMode="decimal" placeholder="jaise: 5000"
                                    {...register("amount", { valueAsNumber: true })} className={`${inputCls} text-base font-semibold`} />
                            </IconBox>
                        </Field>

                        <div className="grid grid-cols-2 gap-brand-8">
                            <Field label="Tareekh" required error={errors.date?.message}>
                                <IconBox icon={CalendarDays}><input type="date" {...register("date")} className={inputCls} /></IconBox>
                            </Field>
                            <Field label="Waqt" error={errors.time?.message}>
                                <IconBox icon={Clock}><input type="time" {...register("time")} className={inputCls} /></IconBox>
                            </Field>
                        </div>

                        {!isDebt && (
                            <Field label={copy.card} hint="Card chunenge to uska balance khud update ho jayega">
                                <IconBox icon={CreditCard}>
                                    <select {...register("cardId")} className={inputCls}>
                                        <option value="">Cash (koi card nahi)</option>
                                        {cards.map((c) => (
                                            <option key={c.id} value={c.id}>{c.label} — PKR {c.balance.toLocaleString("en-PK")}</option>
                                        ))}
                                    </select>
                                </IconBox>
                            </Field>
                        )}

                        <Field label="Note" hint="Optional. Baad mein yaad rakhne ke liye">
                            <textarea {...register("description")} rows={2}
                                placeholder="jaise: cash mila, wapsi 15 tareekh ko" className={inputPlainCls} />
                        </Field>

                        <button type="submit" disabled={isSubmitting}
                            className={`flex cursor-pointer items-center justify-center gap-2 rounded-brand-8 py-2.5 para-small font-semibold text-white hover:opacity-90 disabled:opacity-50 ${buttonCls}`}>
                            <Save size={15} /> {isSubmitting ? "Save ho raha hai..." : editingEntry ? "Tabdeeliyan Save Karein" : "Entry Save Karein"}
                        </button>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}