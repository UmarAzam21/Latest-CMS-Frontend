// dashboard\app\user-dashboard\digital-khata\business\page.tsx

"use client";
import { useState } from "react";
import { useBusinessKhataStore } from "@/hooks/useBusinessKhataStore";
import AddItemDialog from "@/components/user-dashboard/expenseManager/businessKhata/stockbook/AddItemDialog";
import StockTable from "@/components/user-dashboard/expenseManager/businessKhata/stockbook/StockTable";
import MakeBillDialog from "@/components/user-dashboard/expenseManager/businessKhata/billbook/MakeBillDialog";
import BillTable from "@/components/user-dashboard/expenseManager/businessKhata/billbook/BillTable";
import CashEntryDialog from "@/components/user-dashboard/expenseManager/businessKhata/cashbook/CashEntryDialog";
import CashTable from "@/components/user-dashboard/expenseManager/businessKhata/cashbook/CashTable";
import { Package, Receipt, Wallet } from "lucide-react";

type Tab = "stock" | "bill" | "cash";

export default function BusinessKhataPage() {
    const store = useBusinessKhataStore();
    const [tab, setTab] = useState<Tab>("stock");
    const [cashDialog, setCashDialog] = useState<"in" | "out" | null>(null);

    const tabIcons = {
        stock: Package,
        bill: Receipt,
        cash: Wallet,
    };

    return (
        <div className="flex flex-col gap-brand-12">
            <h1 className="heading-h6">Business Khata</h1>

            <div className="flex gap-1 border-b border-border-clr">
                {(["stock", "bill", "cash"] as const).map((t) => {
                    const Icon = tabIcons[t]; // Get the matching icon

                    return (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex items-center gap-1.5 px-3 py-2 para-small font-medium capitalize border-b-2 cursor-pointer ${tab === t
                                    ? "border-primary text-primary"
                                    : "border-transparent text-text-secondary"
                                }`}
                        >
                            <Icon size={14} className="shrink-0" />
                            <span>{t}book</span>
                        </button>
                    );
                })}
            </div>

            {tab === "stock" && (
                <>
                    <div className="flex justify-end">
                        <AddItemDialog onAdd={store.addStock} />
                    </div>
                    <StockTable stock={store.stock} onDelete={store.deleteStock} />
                </>
            )}

            {/* tab === "bill" and "cash" mirror the same two-line pattern with their own dialog+table */}
            {tab === "bill" && (
                <>
                    <div className="flex justify-end">
                        <MakeBillDialog stock={store.stock} onAdd={store.addBill} />
                    </div>
                    <BillTable bills={store.bills} onDelete={store.deleteBill} />
                </>
            )}

            {tab === "cash" && (
                <>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setCashDialog("in")}
                            className="rounded-brand-8 bg-success px-3 py-2 para-small font-semibold text-white cursor-pointer"
                        >
                            + In
                        </button>
                        <button
                            onClick={() => setCashDialog("out")}
                            className="rounded-brand-8 bg-danger px-3 py-2 para-small font-semibold text-white cursor-pointer"
                        >
                            − Out
                        </button>
                    </div>

                    <CashTable cash={store.cash} onDelete={store.deleteCash} />

                    <CashEntryDialog
                        direction={cashDialog ?? "in"}
                        open={cashDialog !== null}
                        onOpenChange={(o) => !o && setCashDialog(null)}
                        onAdd={store.addCash}
                    />
                </>
            )}

        </div>
    );
}
