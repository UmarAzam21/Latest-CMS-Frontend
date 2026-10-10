// dashboard\components\user-dashboard\expenseManager\party\AddPartyDialog.tsx

"use client";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Phone, Plus, Save, Truck, User, UserPlus, UserRound, X } from "lucide-react";
import { partySchema, PartyFormValues } from "@/lib/schemas/partySchema";
import { IParty, PartyType, PARTY_TYPES, PARTY_TYPE_LABELS } from "@/types/expenseManagerTy";
import { Field, IconBox, inputCls } from "../ui/FormKit";

const TYPE_ICON = { customer: UserRound, supplier: Truck } as const;
const TYPE_HINT: Record<PartyType, string> = {
    customer: "Jis se aap ko paise lene hain",
    supplier: "Jis ko aap ne paise dene hain",
};

interface Props {
    onSaved: (v: PartyFormValues) => void;
    trigger?: ReactNode;
    defaultType?: PartyType;
    party?: IParty;                      // pass to switch into EDIT mode
    open?: boolean;                      // pass open + onOpenChange to control it from outside
    onOpenChange?: (o: boolean) => void;
}

export default function AddPartyDialog({ onSaved, trigger, defaultType = "customer", party, open: openProp, onOpenChange }: Props) {
    const [inner, setInner] = useState(false);
    const controlled = openProp !== undefined;
    const open = controlled ? openProp : inner;
    const setOpen = (o: boolean) => (controlled ? onOpenChange?.(o) : setInner(o));

    const { register, handleSubmit, reset, formState: { errors } } = useForm<PartyFormValues>({
        resolver: zodResolver(partySchema),
        defaultValues: { name: "", phone: "", type: defaultType },
    });

    useEffect(() => {
        if (!open) return;
        reset(party
            ? { name: party.name, phone: party.phone ?? "", type: party.type }
            : { name: "", phone: "", type: defaultType });
    }, [open, party, defaultType, reset]);

    const submit = (v: PartyFormValues) => {
        onSaved({ ...v, phone: v.phone || undefined });
        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            {!controlled && (
                <Dialog.Trigger asChild>
                    {trigger ?? (
                        <button type="button" aria-label="Nayi party" className="shrink-0 cursor-pointer rounded-brand-8 bg-primary px-2.5 text-white">
                            <Plus size={15} />
                        </button>
                    )}
                </Dialog.Trigger>
            )}
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-brand-12 bg-white shadow-card-hover">
                    <div className="flex items-start justify-between gap-3 border-b border-border-clr px-brand py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-brand-8 bg-danger-bg text-primary"><UserPlus size={18} /></span>
                            <div>
                                <Dialog.Title className="para-small font-semibold text-text-dark">{party ? "Party Edit Karein" : "Nayi Party Add Karein"}</Dialog.Title>
                                <Dialog.Description className="para-tiny text-text-secondary-muter">Customer ya supplier ki detail likhein</Dialog.Description>
                            </div>
                        </div>
                        <Dialog.Close className="cursor-pointer text-text-secondary-muter hover:text-text-secondary"><X size={16} /></Dialog.Close>
                    </div>

                    {/* stopPropagation: portal events bubble to a parent <form> (entry dialog) */}
                    <form onSubmit={(e) => { e.stopPropagation(); handleSubmit(submit)(e); }} className="flex flex-col gap-brand-12 p-brand">
                        <Field label="Party ka naam" required error={errors.name?.message}>
                            <IconBox icon={User}>
                                <input {...register("name")} placeholder="jaise: Ali Ashraf" className={inputCls} autoComplete="off" />
                            </IconBox>
                        </Field>

                        <Field label="Phone number" hint="Optional. WhatsApp/SMS reminder ke liye zaroori hai" error={errors.phone?.message}>
                            <IconBox icon={Phone}>
                                <input {...register("phone")} type="tel" inputMode="tel" placeholder="03001234567" className={inputCls} />
                            </IconBox>
                        </Field>

                        <Field label="Party ki qism" group>
                            <div className="grid grid-cols-2 gap-2">
                                {PARTY_TYPES.map((t) => {
                                    const Icon = TYPE_ICON[t];
                                    return (
                                        <label key={t} className="cursor-pointer">
                                            <input type="radio" value={t} {...register("type")} className="peer sr-only" />
                                            <span className="flex flex-col gap-0.5 rounded-brand-8 border border-border-clr p-2.5 default-transition peer-checked:border-primary peer-checked:bg-danger-bg peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                                                <span className="flex items-center gap-1.5 para-small font-semibold text-text-dark"><Icon size={15} />{PARTY_TYPE_LABELS[t]}</span>
                                                <span className="para-tiny text-text-secondary-muter">{TYPE_HINT[t]}</span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </Field>

                        <button type="submit"
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-brand-8 bg-primary py-2.5 para-small font-semibold text-white hover:opacity-90">
                            <Save size={15} /> {party ? "Tabdeeliyan Save Karein" : "Party Save Karein"}
                        </button>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}