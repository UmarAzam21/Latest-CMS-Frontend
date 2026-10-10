// dashboard\components\user-dashboard\expenseManager\party\ReminderDateDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarClock, CalendarDays, CalendarPlus, Check, Save, Trash2, X } from "lucide-react";
import { formatDateTime, localDate } from "@/lib/utils/dateFmt";
import { Field, IconBox, inputCls } from "../ui/FormKit";

const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return localDate(d); };

interface Props {
    name: string;
    current?: string;
    onSave: (d: string) => void;
    onClear?: () => void;
}

export default function ReminderDateDialog({ name, current, onSave, onClear }: Props) {
    const [open, setOpen] = useState(false);
    const [sel, setSel] = useState("");

    const options = [
        { label: "Agle hafte", date: addDays(7) },
        { label: "Agle mahine", date: addDays(30) },
    ];

    const handleOpen = (o: boolean) => { if (o) setSel(current ?? ""); setOpen(o); };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpen}>
            <Dialog.Trigger asChild>
                <button type="button"
                    className="flex cursor-pointer flex-col items-center gap-1 rounded-brand-12 border border-border-clr bg-white py-2.5 para-tiny font-medium text-text-dark default-transition hover:border-primary/40 hover:bg-page-bg">
                    <CalendarPlus size={18} className="text-warning" />
                    Set Reminder Date
                    {current && <span className="para-tiny font-semibold text-primary">{formatDateTime(current)}</span>}
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-brand-12 bg-white shadow-card-hover">
                    <div className="flex items-start justify-between gap-3 border-b border-border-clr px-brand py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-brand-8 bg-danger-bg text-primary"><CalendarClock size={18} /></span>
                            <div>
                                <Dialog.Title className="para-small font-semibold text-text-dark">Reminder Date</Dialog.Title>
                                <Dialog.Description className="para-tiny text-text-secondary-muter">{name} se wapsi ki tareekh yaad rakhein</Dialog.Description>
                            </div>
                        </div>
                        <Dialog.Close className="cursor-pointer text-text-secondary-muter hover:text-text-secondary"><X size={16} /></Dialog.Close>
                    </div>

                    <div className="flex flex-col gap-brand-12 p-brand">
                        <div className="flex flex-col gap-2">
                            {options.map((o) => {
                                const active = sel === o.date;
                                return (
                                    <button key={o.label} type="button" onClick={() => setSel(o.date)}
                                        className={`flex cursor-pointer items-center justify-between rounded-brand-8 border px-3 py-2.5 text-left default-transition ${active ? "border-primary bg-danger-bg" : "border-border-clr hover:bg-page-bg"}`}>
                                        <span className="flex items-center gap-2 para-small font-medium text-text-dark">
                                            <CalendarDays size={15} className="text-text-secondary-muter" /> {o.label}
                                        </span>
                                        <span className="flex items-center gap-1.5 para-tiny text-text-secondary-muted">
                                            {formatDateTime(o.date)} {active && <Check size={14} className="text-primary" />}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <Field label="Ya apni tareekh chunein">
                            <IconBox icon={CalendarDays}>
                                <input type="date" value={sel} min={localDate()} onChange={(e) => setSel(e.target.value)} className={inputCls} />
                            </IconBox>
                        </Field>

                        <button type="button" disabled={!sel} onClick={() => { onSave(sel); setOpen(false); }}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-brand-8 bg-primary py-2.5 para-small font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                            <Save size={15} /> Date Save Karein
                        </button>

                        {current && onClear && (
                            <button type="button" onClick={() => { onClear(); setOpen(false); }}
                                className="flex cursor-pointer items-center justify-center gap-1.5 para-tiny font-semibold text-text-secondary-muted hover:text-danger">
                                <Trash2 size={13} /> Date hatayein
                            </button>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}