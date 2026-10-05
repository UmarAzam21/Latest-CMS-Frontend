"use client";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import DetailedEntryDialog from "../expenseStats/DetailedEntryDialog";
import { DetailedEntryValues } from "@/lib/schemas/detailedEntrySchema";
import { ICategory, ICard, IExpenseEntry, DebtDirection, KHATA_LABELS } from "@/types/expenseManagerTy";

interface AddUdhaarButtonProps {
    categories: ICategory[]; cards: ICard[];
    editingEntry?: IExpenseEntry | null;
    open: boolean; onOpenChange: (open: boolean) => void; onCloseEdit: () => void;
    onSaved: (v: DetailedEntryValues & { kind: "debt"; debtDirection?: DebtDirection }) => void;
}

export default function AddUdhaarButton({ categories, cards, editingEntry, open, onOpenChange, onCloseEdit, onSaved }: AddUdhaarButtonProps) {
    useEffect(() => { if (editingEntry) onOpenChange(true); }, [editingEntry, onOpenChange]);

    return (
        <>
            <button
                onClick={() => onOpenChange(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-brand-8 bg-primary px-2.5 py-2 para-tiny font-semibold text-white hover:opacity-90"
            >
                <Plus size={14} /> {KHATA_LABELS.debt.verb}
            </button>
            <DetailedEntryDialog
                kind={open ? "debt" : null}
                categories={categories}
                cards={cards}
                editingEntry={editingEntry}
                onClose={() => { onOpenChange(false); onCloseEdit(); }}
                onSaved={(v) => onSaved(v as any)}
            />
        </>
    );
}