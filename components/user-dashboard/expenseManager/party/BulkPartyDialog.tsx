// dashboard\components\user-dashboard\expenseManager\party\BulkPartyDialog.tsx

"use client";
import { ChangeEvent, ReactNode, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import * as XLSX from "xlsx";
import { AlertTriangle, CheckCircle2, Truck, Upload, UserRound, UsersRound, X, XCircle } from "lucide-react";
import { parseBulkParties } from "@/lib/utils/partyBulk";
import { PartyFormValues } from "@/lib/schemas/partySchema";
import { IParty, PartyType, PARTY_TYPES, PARTY_TYPE_LABELS } from "@/types/expenseManagerTy";
import { Field, inputPlainCls } from "../ui/FormKit";

const TYPE_ICON = { customer: UserRound, supplier: Truck } as const;

interface Props {
    existing: IParty[];
    onImport: (rows: PartyFormValues[]) => void;
    defaultType?: PartyType;
    trigger?: ReactNode;
}

export default function BulkPartyDialog({ existing, onImport, defaultType = "customer", trigger }: Props) {
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [type, setType] = useState<PartyType>(defaultType);
    const fileRef = useRef<HTMLInputElement>(null);

    const rows = useMemo(() => parseBulkParties(text, existing), [text, existing]);
    const ok = rows.filter((r) => r.status === "ok");
    const dups = rows.filter((r) => r.status === "duplicate").length;
    const errs = rows.filter((r) => r.status === "error").length;

    const handleOpen = (o: boolean) => { if (o) { setType(defaultType); setText(""); } setOpen(o); };

    const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (!f) return;
        try {
            if (/\.xlsx?$/i.test(f.name)) {
                const wb = XLSX.read(await f.arrayBuffer());
                setText(XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]));
            } else {
                setText(await f.text());
            }
        } catch {
            toast.error("File parhi nahi ja saki");
        }
    };

    const run = () => {
        onImport(ok.map((r) => ({ name: r.name, phone: r.phone, type: r.type ?? type })));
        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpen}>
            <Dialog.Trigger asChild>
                {trigger ?? (
                    <button type="button" className="flex cursor-pointer items-center gap-1.5 rounded-brand-8 border border-border-clr bg-white px-3 py-2 para-tiny font-semibold text-text-secondary default-transition hover:bg-page-bg">
                        <UsersRound size={14} /> Bulk Add
                    </button>
                )}
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-brand-12 bg-white shadow-card-hover">
                    <div className="flex items-start justify-between gap-3 border-b border-border-clr px-brand py-3">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-brand-8 bg-danger-bg text-primary"><UsersRound size={18} /></span>
                            <div>
                                <Dialog.Title className="para-small font-semibold text-text-dark">Bulk Party Add</Dialog.Title>
                                <Dialog.Description className="para-tiny text-text-secondary-muter">Ek saath kai parties add karein</Dialog.Description>
                            </div>
                        </div>
                        <Dialog.Close className="cursor-pointer text-text-secondary-muter hover:text-text-secondary"><X size={16} /></Dialog.Close>
                    </div>

                    <div className="flex flex-col gap-brand-12 overflow-y-auto p-brand">
                        <Field label="Sab ki qism (jahan alag na likhi ho)" group>
                            <div className="grid grid-cols-2 gap-2">
                                {PARTY_TYPES.map((t) => {
                                    const Icon = TYPE_ICON[t];
                                    return (
                                        <button key={t} type="button" onClick={() => setType(t)}
                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-brand-8 border py-2 para-small font-semibold default-transition ${type === t ? "border-primary bg-danger-bg text-primary" : "border-border-clr text-text-secondary hover:bg-page-bg"}`}>
                                            <Icon size={15} /> {PARTY_TYPE_LABELS[t]}
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>

                        <Field label="Parties ki list" hint="Har line mein ek party: Naam, Phone, Qism. Phone aur qism optional hain.">
                            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
                                placeholder={"Ali Ashraf, 03001234567\nHassan Traders, 03211234567, supplier\nBilal Ahmed"}
                                className={`${inputPlainCls} font-mono`} />
                        </Field>

                        <div className="flex items-center gap-2">
                            <input ref={fileRef} type="file" accept=".csv,.txt,.xlsx,.xls" onChange={onFile} className="hidden" />
                            <button type="button" onClick={() => fileRef.current?.click()}
                                className="flex cursor-pointer items-center gap-1.5 rounded-brand-8 border border-border-clr px-3 py-2 para-tiny font-semibold text-text-secondary hover:bg-page-bg">
                                <Upload size={14} /> CSV / Excel upload karein
                            </button>
                            <span className="para-tiny text-text-secondary-muter">Pehle column mein naam, doosre mein phone</span>
                        </div>

                        {rows.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                                <p className="para-tiny font-semibold text-text-dark">
                                    <span className="text-success">{ok.length} tayyar</span>
                                    {dups > 0 && <span className="text-warning"> · {dups} duplicate (skip honge)</span>}
                                    {errs > 0 && <span className="text-danger"> · {errs} ghalat (skip honge)</span>}
                                </p>
                                <div className="max-h-44 overflow-y-auto rounded-brand-8 border border-border-clr">
                                    {rows.map((r) => (
                                        <div key={r.line} className="flex items-center gap-2 border-b border-border-clr px-2.5 py-1.5 last:border-b-0">
                                            {r.status === "ok" && <CheckCircle2 size={14} className="shrink-0 text-success" />}
                                            {r.status === "duplicate" && <AlertTriangle size={14} className="shrink-0 text-warning" />}
                                            {r.status === "error" && <XCircle size={14} className="shrink-0 text-danger" />}
                                            <span className="min-w-0 flex-1 truncate para-tiny text-text-dark">
                                                {r.name || "(naam nahi)"} <span className="text-text-secondary-muter">{r.phone ?? ""}</span>
                                            </span>
                                            {r.message && <span className="shrink-0 para-tiny text-text-secondary-muted">{r.message}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button type="button" disabled={ok.length === 0} onClick={run}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-brand-8 bg-primary py-2.5 para-small font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
                            <UsersRound size={15} /> {ok.length ? `${ok.length} parties import karein` : "Pehle list likhein ya file upload karein"}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}