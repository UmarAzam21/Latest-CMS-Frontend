// dashboard\components\user-dashboard\expenseManager\udhaarKhata\AddUdhaarButton.tsx

"use client";
import { useEffect } from "react";
import { Plus } from "lucide-react";
import DetailedEntryDialog, { EntrySavePayload } from "../expenseStats/DetailedEntryDialog";
import { DetailedEntryValues } from "@/lib/schemas/detailedEntrySchema";
import { ICategory, ICard, IExpenseEntry, KHATA_LABELS, IParty } from "@/types/expenseManagerTy";
import { PartyFormValues } from "@/lib/schemas/partySchema";

interface AddUdhaarButtonProps {
    categories: ICategory[];
    cards: ICard[];
    editingEntry?: IExpenseEntry | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCloseEdit: () => void;
    parties: IParty[];
    onAddParty: (p: PartyFormValues) => IParty;
    onSaved: (v: EntrySavePayload) => void;
}

export default function AddUdhaarButton({
    categories,
    cards,
    editingEntry,
    open,
    onOpenChange,
    onCloseEdit,
    parties,
    onAddParty,
    onSaved
}: AddUdhaarButtonProps) {
    useEffect(() => {
        if (editingEntry) onOpenChange(true);
    }, [editingEntry, onOpenChange]);

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
                parties={parties}
                onAddParty={onAddParty}
                onClose={() => {
                    onOpenChange(false);
                    onCloseEdit();
                }}
                onSaved={onSaved}
            />
        </>
    );
}