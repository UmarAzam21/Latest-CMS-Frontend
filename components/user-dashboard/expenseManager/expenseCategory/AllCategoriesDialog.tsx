// dashboard\components\user-dashboard\expenseManager\expenseCategory\AllCategoriesDialog.tsx

"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ICategoryBreakdownItem } from "@/types/expenseManagerTy";
import CategoryRow from "./CategoryRow";

export default function AllCategoriesDialog({ open, onOpenChange, sorted, total }: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    sorted: ICategoryBreakdownItem[];
    total: number;
}) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-white p-brand-12 shadow-card-hover">
                    <div className="mb-brand-8 flex items-center justify-between border-b border-border-clr pb-brand-8">
                        <div>
                            <Dialog.Title className="para-small font-semibold text-text-dark">
                                Spending by Category
                            </Dialog.Title>
                            <p className="para-tiny text-text-secondary-muter">
                                {sorted.length} categories · PKR {total.toLocaleString("en-PK")}
                            </p>
                        </div>
                        <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary">
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    <div className="flex max-h-[420px] flex-col overflow-y-auto">
                        {sorted.map((item, i) => (
                            <CategoryRow
                                key={item.category.id}
                                item={item}
                                index={i}
                            />
                        ))}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}