// dashboard\components\user-dashboard\expenseManager\party\ReminderDateDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarPlus } from "lucide-react";

const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

export default function ReminderDateDialog({ name, current, onSave }: { name: string; current?: string; onSave: (d: string) => void }) {
    const [open, setOpen] = useState(false);
    const [custom, setCustom] = useState(current ?? "");
    const pick = (d: string) => { onSave(d); setOpen(false); };
    const btn = "w-full rounded-brand-8 border border-border-clr px-3 py-2 text-left para-tiny hover:bg-page-bg";

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button type="button" className="flex flex-1 flex-col items-center gap-1 rounded-brand-12 border border-border-clr bg-white py-2 para-tiny">
                    <CalendarPlus size={18} className="text-warning" /> Set Date{current ? ` · ${current}` : ""}
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand shadow-card-hover">
                    <Dialog.Title className="para-small font-semibold">Set Date for {name}</Dialog.Title>
                    <div className="mt-brand-8 flex flex-col gap-2">
                        <button className={btn} onClick={() => pick(addDays(7))}>Next Week — {addDays(7)}</button>
                        <button className={btn} onClick={() => pick(addDays(30))}>Next Month — {addDays(30)}</button>
                        <div className="flex gap-2">
                            <input type="date" value={custom} onChange={(e) => setCustom(e.target.value)} className={btn} />
                            <button disabled={!custom} onClick={() => pick(custom)} className="rounded-brand-8 bg-primary px-3 text-white disabled:opacity-40">Save</button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}