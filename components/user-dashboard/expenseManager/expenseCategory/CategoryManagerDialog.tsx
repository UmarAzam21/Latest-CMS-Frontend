// dashboard\components\user-dashboard\expenseManager\expenseCategory\CategoryManagerDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings2, Trash2, Plus, X, Check, Lock } from "lucide-react";
import { EntryKind, ICategory, KHATA_LABELS } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";

interface CategoryManagerDialogProps {
    categories: ICategory[];
    onAdd: (label: string, color: ICategory["color"], kind: EntryKind) => void;
    onDelete: (id: string) => void;
}

const KINDS: EntryKind[] = ["income", "expense", "debt"];
const COLOR_OPTIONS: ICategory["color"][] = ["primary", "secondary", "warning", "info", "danger", "neutral"];
const SWATCH: Record<ICategory["color"], string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    warning: "bg-warning",
    info: "bg-info",
    danger: "bg-danger",
    neutral: "bg-text-secondary-muter",
};

export default function CategoryManagerDialog({ categories, onAdd, onDelete }: CategoryManagerDialogProps) {
    const [tab, setTab] = useState<EntryKind>("expense");
    const [label, setLabel] = useState("");
    const [color, setColor] = useState<ICategory["color"]>("neutral");
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const list = categories.filter((c) => c.kind === tab);

    return (
        <Dialog.Root onOpenChange={(o) => !o && setConfirmId(null)}>
            <Dialog.Trigger asChild>
                <button
                    type="button"
                    className="flex cursor-pointer items-center gap-1.5 rounded-brand-8 border border-border-clr px-2.5 py-2 para-tiny font-semibold text-text-secondary default-transition hover:bg-page-bg"
                >
                    <Settings2 size={13} /> Categories
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand shadow-card-hover">
                    <div className="mb-brand-8 flex items-center justify-between border-b border-border-clr pb-brand-8">
                        <Dialog.Title className="para-small font-semibold text-text-dark">
                            Categories Manage Karein
                        </Dialog.Title>
                        <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary">
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    <div className="mb-brand-8 flex gap-1">
                        {KINDS.map((k) => (
                            <button
                                key={k}
                                onClick={() => {
                                    setTab(k);
                                    setConfirmId(null);
                                }}
                                className={cn(
                                    "flex-1 rounded-brand-8 px-2 py-1.5 para-tiny font-semibold default-transition",
                                    tab === k ? "bg-primary text-white" : "bg-page-bg text-text-secondary hover:bg-border-clr"
                                )}
                            >
                                {KHATA_LABELS[k].noun}
                            </button>
                        ))}
                    </div>

                    <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto">
                        {list.map((c) => {
                            const locked = c.kind === "debt" || c.label === "Other";

                            return (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between rounded-brand-8 border border-border-clr px-2.5 py-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", SWATCH[c.color])} />
                                        <span className="para-tiny">{c.label}</span>
                                    </div>

                                    {locked ? (
                                        <Lock
                                            size={12}
                                            className="text-text-secondary-muter"
                                            aria-label="Default category"
                                        />
                                    ) : confirmId === c.id ? (
                                        <div className="flex items-center gap-1.5">
                                            <span className="para-tiny text-text-secondary-muter">Delete?</span>
                                            <button
                                                onClick={() => {
                                                    onDelete(c.id);
                                                    setConfirmId(null);
                                                }}
                                                className="rounded-brand-8 bg-danger px-2 py-1 para-tiny font-semibold text-white"
                                            >
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setConfirmId(null)}
                                                className="rounded-brand-8 border border-border-clr px-2 py-1 para-tiny font-semibold text-text-secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmId(c.id)}
                                            className="cursor-pointer text-text-secondary-muter hover:text-danger"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {tab === "debt" ? (
                        <p className="mt-brand-8 border-t border-border-clr pt-brand-8 para-tiny text-text-secondary-muter/80 text-center">
                            Udhaar ki 2 categories fixed hain (Liya / Diya), kyunke card balance inhi se tay hota hai.
                        </p>
                    ) : (
                        <div className="mt-brand-8 flex flex-col gap-brand-8 border-t border-border-clr pt-brand-8">
                            <input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder="Naye category ka naam (jaise: Freelance)"
                                className="w-full rounded-brand-8 border border-border-clr px-2.5 py-2 para-tiny outline-none focus:border-primary"
                            />

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                    {COLOR_OPTIONS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            aria-label={c}
                                            aria-pressed={color === c}
                                            className={cn(
                                                "flex h-4 w-4 cursor-pointer items-center justify-center rounded-full",
                                                SWATCH[c],
                                                color === c ? "ring-1 ring-offset-1 ring-text-dark" : "hover:opacity-80"
                                            )}
                                        >
                                            {color === c && (
                                                <Check
                                                    size={11}
                                                    className="text-white"
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={!label.trim()}
                                    onClick={() => {
                                        onAdd(label, color, tab);
                                        setLabel("");
                                    }}
                                    className="rounded-brand-8 bg-primary px-3 py-2 text-white disabled:opacity-40"
                                >
                                    <Plus size={15} />
                                </button>
                            </div>
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}