"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings2, Trash2, Plus, X, Check } from "lucide-react";
import { ICategory } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";

interface CategoryManagerDialogProps {
    categories: ICategory[];
    onAdd: (label: string, color: ICategory["color"]) => void;
    onDelete: (id: string) => void;
}

const COLOR_OPTIONS: ICategory["color"][] = ["primary", "secondary", "warning", "info", "danger", "neutral"];

// Maps each category color to an actual swatch background — adjust these
// token names if your tailwind config uses different class names for the
// solid (non -light/-bg) shade of each.
const COLOR_SWATCH_CLASS: Record<ICategory["color"], string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    warning: "bg-warning",
    info: "bg-info",
    danger: "bg-danger",
    neutral: "bg-text-secondary-muter",
};

export default function CategoryManagerDialog({ categories, onAdd, onDelete }: CategoryManagerDialogProps) {
    const [label, setLabel] = useState("");
    const [color, setColor] = useState<ICategory["color"]>("neutral");
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        if (confirmDeleteId === id) {
            onDelete(id);
            setConfirmDeleteId(null);
        } else {
            setConfirmDeleteId(id);
        }
    };

    return (
        <Dialog.Root onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
            <Dialog.Trigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-brand-8 border border-border-clr px-3 py-2 para-small font-semibold text-text-secondary default-transition hover:bg-page-bg"
                >
                    <Settings2 size={14} />
                    Categories
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-card-bg-clr p-brand shadow-card-hover">
                    <div className="flex items-center justify-between border-b border-border-clr pb-brand-8 mb-brand-12">
                        <Dialog.Title className="heading-h6">Manage Categories</Dialog.Title>
                        <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary">
                            <X size={18} />
                        </Dialog.Close>
                    </div>

                    <div className="flex flex-col gap-brand-8 max-h-64 overflow-y-auto">
                        {categories.map((c) => (
                            <div key={c.id} className="flex items-center justify-between rounded-brand-8 border border-border-clr px-3 py-2">
                                <div className="flex items-center gap-2">
                                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", COLOR_SWATCH_CLASS[c.color])} />
                                    <span className="para-small">{c.label}</span>
                                </div>

                                {confirmDeleteId === c.id ? (
                                    <div className="flex items-center gap-2">
                                        <span className="para-tiny text-text-secondary-muter">Delete?</span>
                                        <button
                                            onClick={() => handleDeleteClick(c.id)}
                                            className="rounded-brand-8 bg-danger px-2 py-1 para-tiny font-semibold text-white hover:opacity-90"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="rounded-brand-8 border border-border-clr px-2 py-1 para-tiny font-semibold text-text-secondary hover:bg-page-bg"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleDeleteClick(c.id)}
                                        className="text-text-secondary-muter hover:text-danger"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <p className="para-small text-text-secondary-muted">No categories yet.</p>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-border-clr pt-4">
                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="New category name"
                            className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                        />

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                                {COLOR_OPTIONS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setColor(c)}
                                        title={c}
                                        aria-label={c}
                                        aria-pressed={color === c}
                                        className={cn(
                                            "flex h-4 w-4 items-center justify-center rounded-full default-transition cursor-pointer",
                                            COLOR_SWATCH_CLASS[c],
                                            color === c ? "ring-1 ring-offset-1 ring-text-dark" : "hover:opacity-80"
                                        )}
                                    >
                                        {color === c && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    if (label.trim()) {
                                        onAdd(label.trim(), color);
                                        setLabel("");
                                    }
                                }}
                                disabled={!label.trim()}
                                className="rounded-brand-8 bg-primary px-3 py-2 text-white disabled:opacity-40"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}