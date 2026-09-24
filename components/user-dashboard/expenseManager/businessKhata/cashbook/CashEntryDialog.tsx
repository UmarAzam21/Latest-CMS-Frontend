// dashboard\components\user-dashboard\expenseManager\businessKhata\billbook\MakeBillDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ICashEntry, CashCategoryTy, PaymentMethodTy } from "@/types/businessKhataTy";

const CATEGORIES: CashCategoryTy[] = ["customer", "salary", "fees", "rent", "electricity", "other"];
const METHODS: PaymentMethodTy[] = ["cash", "bank", "jazzcash", "easypaisa"];

export default function CashEntryDialog({ direction, open, onOpenChange, onAdd }: {
    direction: "in" | "out";
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onAdd: (entry: Omit<ICashEntry, "id">) => void;
}) {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<CashCategoryTy>("customer");
    const [note, setNote] = useState("");
    const [method, setMethod] = useState<PaymentMethodTy>("cash");
    const today = new Date().toISOString().slice(0, 10);

    const submit = () => {
        if (!amount) return;
        onAdd({
            direction,
            amount: Number(amount),
            date: today,
            category,
            note: note || undefined,
            paymentMethod: method
        });
        setAmount("");
        setNote("");
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12">
                    <div className={`mb-3 flex items-center justify-between rounded-brand-8 px-3 py-2 ${direction === "in" ? "bg-success" : "bg-danger"}`}>
                        <h3 className="para-small font-semibold text-white">
                            {direction === "in" ? "Cash In" : "Cash Out"}
                        </h3>
                        <Dialog.Close className="text-white/80 hover:text-white">
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    <div className="flex flex-col gap-2">
                        <input
                            type="number"
                            placeholder="Amount (Rs.)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />
                        <input
                            readOnly
                            value={today}
                            className="rounded-brand-8 border border-border-clr bg-page-bg px-3 py-2 para-small text-text-secondary-muter"
                        />

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as CashCategoryTy)}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>

                        <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value as PaymentMethodTy)}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        >
                            {METHODS.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>

                        <textarea
                            placeholder="Note (optional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />

                        <button
                            onClick={submit}
                            disabled={!amount}
                            className={`mt-1 rounded-brand-8 py-2 para-small font-semibold text-white disabled:opacity-50 ${direction === "in" ? "bg-success" : "bg-danger"
                                }`}
                        >
                            Save
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
