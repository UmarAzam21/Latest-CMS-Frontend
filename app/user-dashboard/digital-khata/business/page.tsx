// dashboard\app\user-dashboard\digital-khata\business\page.tsx

"use client";
import { useEffect, useState } from "react";
import { useBusinessKhataStore } from "@/hooks/useBusinessKhataStore";
import AddItemDialog from "@/components/user-dashboard/expenseManager/businessKhata/stockbook/AddItemDialog";
import StockTable from "@/components/user-dashboard/expenseManager/businessKhata/stockbook/StockTable";
import MakeBillDialog from "@/components/user-dashboard/expenseManager/businessKhata/billbook/MakeBillDialog";
import BillTable from "@/components/user-dashboard/expenseManager/businessKhata/billbook/BillTable";
import CashEntryDialog from "@/components/user-dashboard/expenseManager/businessKhata/cashbook/CashEntryDialog";
import CashTable from "@/components/user-dashboard/expenseManager/businessKhata/cashbook/CashTable";
import { Package, Receipt, Wallet } from "lucide-react";
import KhataPageHeader from "@/components/user-dashboard/expenseManager/header/KhataPageHeader";
import { DIGITAL_KHATA_ROUTES } from "@/data/user-dashboard/digitalKhata";

type Tab = "stock" | "bill" | "cash";

export default function BusinessKhataPage() {
    const store = useBusinessKhataStore();
    const [tab, setTab] = useState<Tab>("stock");
    const [cashDialog, setCashDialog] = useState<"in" | "out" | null>(null);

    useEffect(() => {
        const requestedTab = new URLSearchParams(window.location.search).get("tab");
        if (requestedTab === "stock" || requestedTab === "bill" || requestedTab === "cash") {
            setTab(requestedTab);
        }
    }, []);

    const tabIcons = {
        stock: Package,
        bill: Receipt,
        cash: Wallet,
    };

    return (
        <div className="flex flex-col gap-brand-12">

            <KhataPageHeader
                title={DIGITAL_KHATA_ROUTES.business.label}
                tabs={[
                    { key: "stockbook", label: "Stockbook", icon: Package },
                    { key: "billbook", label: "Billbook", icon: Receipt },
                    { key: "cashbook", label: "Cashbook", icon: Wallet },
                ]}
                activeTab={tab}
                onTabChange={(k) => setTab(k as typeof tab)}
            />

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
