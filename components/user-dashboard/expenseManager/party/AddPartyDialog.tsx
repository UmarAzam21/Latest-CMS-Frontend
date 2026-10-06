// dashboard\components\user-dashboard\expenseManager\party\AddPartyDialog.tsx

"use client";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { partySchema, PartyFormValues } from "@/lib/schemas/partySchema";
import { PartyType } from "@/types/expenseManagerTy";

const inputCls = "w-full rounded-brand-8 border border-border-clr px-2.5 py-2 para-tiny outline-none focus:border-primary-light";

export default function AddPartyDialog({ onSaved, trigger, defaultType = "customer" }: {
    onSaved: (v: PartyFormValues) => void; trigger?: ReactNode; defaultType?: PartyType;
}) {
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PartyFormValues>({
        resolver: zodResolver(partySchema),
        defaultValues: { name: "", phone: "", type: defaultType },
    });

    const submit = (v: PartyFormValues) => {
        onSaved({ ...v, phone: v.phone || undefined });
        reset({ name: "", phone: "", type: defaultType });
        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                {trigger ?? (
                    <button type="button" aria-label="Naya party" className="shrink-0 rounded-brand-8 bg-primary px-2.5 text-white">
                        <Plus size={15} />
                    </button>
                )}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand shadow-card-hover">
                    <div className="mb-brand-8 flex items-center justify-between border-b border-border-clr pb-brand-8">
                        <Dialog.Title className="para-small font-semibold">Nayi Party</Dialog.Title>
                        <Dialog.Close className="text-text-secondary-muter"><X size={16} /></Dialog.Close>
                    </div>
                    {/* stopPropagation: React bubbles portal events to a parent <form> (entry dialog) */}
                    <form onSubmit={(e) => { e.stopPropagation(); handleSubmit(submit)(e); }} className="flex flex-col gap-brand-8">
                        <input {...register("name")} placeholder="Naam" className={inputCls} />
                        {errors.name && <span className="para-tiny text-danger">{errors.name.message}</span>}
                        <input {...register("phone")} placeholder="Phone (03xxxxxxxxx)" className={inputCls} />
                        {errors.phone && <span className="para-tiny text-danger">{errors.phone.message}</span>}
                        <select {...register("type")} className={inputCls}>
                            <option value="customer">Customer</option>
                            <option value="supplier">Supplier</option>
                            <option value="bank">Bank</option>
                        </select>
                        <button type="submit" className="rounded-brand-8 bg-primary py-2 para-tiny font-semibold text-white">Save Karein</button>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}