// dashboard\components\user-dashboard\expenseManager\businessKhata\billbook\MakeBillDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { IBill, IBillItem, IStockItem } from "@/types/businessKhataTy";

export default function MakeBillDialog({ stock, onAdd }: { stock: IStockItem[]; onAdd: (bill: Omit<IBill, "id">) => void }) {
    const [open, setOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerContact, setCustomerContact] = useState("");
    const [lineItems, setLineItems] = useState<IBillItem[]>([]);
    const [selectedItem, setSelectedItem] = useState("");
    const [qty, setQty] = useState("");

    const addLine = () => {
        const stockItem = stock.find((s) => s.itemName === selectedItem);
        if (!stockItem || !qty) return;
        setLineItems((p) => [...p, { itemName: stockItem.itemName, quantity: Number(qty), rate: stockItem.sellingRate }]);
        setSelectedItem("");
        setQty("");
    };

    const removeLine = (i: number) => setLineItems((p) => p.filter((_, idx) => idx !== i));
    const total = lineItems.reduce((s, li) => s + li.quantity * li.rate, 0);
    const valid = customerName && lineItems.length > 0;

    const submit = () => {
        onAdd({
            customerName,
            customerContact,
            items: lineItems,
            total,
            date: new Date().toISOString().slice(0, 10)
        });
        setCustomerName("");
        setCustomerContact("");
        setLineItems([]);
        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className="rounded-brand-8 bg-primary px-3 py-2 para-small font-semibold text-white">
                    + Make Bill
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="heading-h6 text-text-dark">Make Bill</h3>
                        <Dialog.Close>
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    <div className="flex flex-col gap-2">
                        <input
                            placeholder="Customer name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />
                        <input
                            placeholder="Customer contact"
                            value={customerContact}
                            onChange={(e) => setCustomerContact(e.target.value)}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />

                        <div className="flex gap-2">
                            <select
                                value={selectedItem}
                                onChange={(e) => setSelectedItem(e.target.value)}
                                className="flex-1 rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                            >
                                <option value="">Select item</option>
                                {stock.map((s) => (
                                    <option key={s.id} value={s.itemName}>
                                        {s.itemName} (Rs.{s.sellingRate})
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Qty"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                className="w-20 rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                            />
                            <button onClick={addLine} className="rounded-brand-8 bg-page-bg px-2.5 text-primary">
                                <Plus size={16} />
                            </button>
                        </div>

                        {lineItems.length > 0 && (
                            <div className="flex flex-col gap-1 rounded-brand-8 border border-border-clr p-2">
                                {lineItems.map((li, i) => (
                                    <div key={i} className="flex items-center justify-between para-tiny">
                                        <span>
                                            {li.itemName} x{li.quantity}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            Rs.{li.quantity * li.rate}{" "}
                                            <button onClick={() => removeLine(i)}>
                                                <Trash2 size={12} className="text-danger" />
                                            </button>
                                        </span>
                                    </div>
                                ))}
                                <div className="mt-1 flex items-center justify-between border-t border-border-clr pt-1 para-small font-semibold">
                                    <span>Total</span>
                                    <span>Rs.{total}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={submit}
                            disabled={!valid}
                            className="mt-1 rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-50"
                        >
                            Make Bill
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
