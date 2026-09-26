// dashboard\components\user-dashboard\expenseManager\expenseStats\NewEntryMenu.tsx

"use client";
import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Plus, ChevronDown } from "lucide-react";
import DetailedEntryDialog from "./DetailedEntryDialog";
import { DetailedEntryValues } from "@/lib/schemas/detailedEntrySchema";
import { EntryKind, ICategory, ICard, IExpenseEntry, KHATA_LABELS } from "@/types/expenseManagerTy";

type NewEntryMenuProps = {
    categories: ICategory[];
    cards: ICard[];
    editingEntry?: IExpenseEntry | null;
    onCloseEdit: () => void;
    onSaved: (v: DetailedEntryValues & { kind: EntryKind }) => void;
}

export default function NewEntryMenu({ categories, cards, editingEntry, onCloseEdit, onSaved }: NewEntryMenuProps) {
    const [pickedKind, setPickedKind] = useState<EntryKind | null>(null);

    return (
        <>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button className="flex items-center gap-1.5 rounded-brand-8 bg-primary px-2.5 py-2 para-tiny font-semibold text-white hover:opacity-90 cursor-pointer">
                        <Plus size={14} /> New Entry <ChevronDown size={13} />
                    </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                    <DropdownMenu.Content align="end" className="z-dropdown w-40 rounded-brand-8 border border-border-clr bg-white p-1 shadow-card-hover">
                        {(["income", "expense", "debt"] as const).map((k) => (
                            <DropdownMenu.Item key={k} onClick={() => setPickedKind(k)} className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-tiny text-text-secondary hover:bg-page-bg outline-none">
                                {KHATA_LABELS[k].verb}
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <DetailedEntryDialog kind={pickedKind} categories={categories} cards={cards} editingEntry={editingEntry}
                onClose={() => { setPickedKind(null); onCloseEdit(); }} onSaved={onSaved} />
        </>
    );
}