// dashboard\components\user-dashboard\expenseManager\businessKhata\stockbook\AddItemDialog.tsx

"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { IStockItem, StockUnit } from "@/types/businessKhataTy";

// const UNITS: StockUnit[] = ["item", "pcs", "g", "m", "btl", "ltr", "kg", "box"];
const UNITS: StockUnit[] = ["item", "Pieces (pcs)", "Gram (g)", "Metre (m)", "Bottle (btl)", "Liters (ltr)", "Kilogram (kg)", "Box (box)"];

export default function AddItemDialog({ onAdd }: { onAdd: (item: Omit<IStockItem, "id">) => void }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        itemName: "",
        buyingRate: "",
        sellingRate: "",
        quantity: "",
        unit: "item" as StockUnit,
        supplierName: "",
        supplierContact: ""
    });

    const valid = form.itemName && form.buyingRate && form.sellingRate && form.quantity;

    const submit = () => {
        onAdd({
            itemName: form.itemName,
            buyingRate: Number(form.buyingRate),
            sellingRate: Number(form.sellingRate),
            quantity: Number(form.quantity),
            unit: form.unit,
            supplierName: form.supplierName,
            supplierContact: form.supplierContact,
            date: new Date().toISOString().slice(0, 10)
        });

        setForm({
            itemName: "",
            buyingRate: "",
            sellingRate: "",
            quantity: "",
            unit: "item",
            supplierName: "",
            supplierContact: ""
        });
        setOpen(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className="rounded-brand-8 bg-primary px-3 py-2 para-small font-semibold text-white cursor-pointer">
                    + Add Item
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-brand-12 bg-white p-brand-12">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="heading-h6 text-text-dark">Add Item</h3>
                        <Dialog.Close>
                            <X size={16} />
                        </Dialog.Close>
                    </div>

                    <div className="flex flex-col gap-2">
                        <input
                            placeholder="Item name"
                            value={form.itemName}
                            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                placeholder="Buying rate"
                                value={form.buyingRate}
                                onChange={(e) => setForm({ ...form, buyingRate: e.target.value })}
                                className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                            />
                            <input
                                type="number"
                                placeholder="Selling rate"
                                value={form.sellingRate}
                                onChange={(e) => setForm({ ...form, sellingRate: e.target.value })}
                                className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={form.quantity}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                            />
                            <select
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value as StockUnit })}
                                className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                            >
                                {UNITS.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <input
                            placeholder="Supplier name"
                            value={form.supplierName}
                            onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />
                        <input
                            placeholder="Supplier contact"
                            value={form.supplierContact}
                            onChange={(e) => setForm({ ...form, supplierContact: e.target.value })}
                            className="rounded-brand-8 border border-border-clr px-3 py-2 para-small"
                        />

                        <button
                            onClick={submit}
                            disabled={!valid}
                            className="mt-1 rounded-brand-8 bg-primary py-2 para-small font-semibold text-white disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
