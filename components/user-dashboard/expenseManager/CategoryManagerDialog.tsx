"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Settings2, Trash2, Plus, X } from "lucide-react";
import { ICategory } from "@/types/expenseManager";

interface CategoryManagerDialogProps {
    categories: ICategory[];
    onAdd: (label: string, color: ICategory["color"]) => void;
    onDelete: (id: string) => void;
}

const COLOR_OPTIONS: ICategory["color"][] = ["primary", "secondary", "warning", "info", "danger", "neutral"];

export default function CategoryManagerDialog({ categories, onAdd, onDelete }: CategoryManagerDialogProps) {
    const [label, setLabel] = useState("");
    const [color, setColor] = useState<ICategory["color"]>("neutral");

    return (
        <Dialog.Root>
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
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-card-bg-clr p-6 shadow-card-hover">
                    <div className="mb-4 flex items-center justify-between border-b border-border-clr pb-4">
                        <Dialog.Title className="heading-h5 text-text-dark">Manage Categories</Dialog.Title>
                        <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary"><X size={18} /></Dialog.Close>
                    </div>

                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {categories.map((c) => (
                            <div key={c.id} className="flex items-center justify-between rounded-brand-8 border border-border-clr px-3 py-2">
                                <span className="para-small text-text-dark">{c.label}</span>
                                <button onClick={() => onDelete(c.id)} className="text-text-secondary-muter hover:text-danger">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-2 border-t border-border-clr pt-4">
                        <input
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="New category name"
                            className="flex-1 rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                        />
                        <select
                            value={color}
                            onChange={(e) => setColor(e.target.value as ICategory["color"])}
                            className="rounded-brand-8 border border-border-clr px-2 para-small"
                        >
                            {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button
                            onClick={() => { if (label.trim()) { onAdd(label.trim(), color); setLabel(""); } }}
                            className="rounded-brand-8 bg-primary px-3 text-white"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}