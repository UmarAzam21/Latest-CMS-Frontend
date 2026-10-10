// dashboard\app\user-dashboard\digital-khata\business\page.tsx

"use client";
import { useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Package, Receipt, Wallet } from "lucide-react";
import { useBusinessKhataStore } from "@/hooks/useBusinessKhataStore";
import KhataPageHeader from "@/components/user-dashboard/expenseManager/header/KhataPageHeader";
import { DIGITAL_KHATA_ROUTES } from "@/data/user-dashboard/digitalKhata";
import AddItemDialog from "@/components/user-dashboard/expenseManager/businessKhata/stockbook/AddItemDialog";
import StockTable from "@/components/user-dashboard/expenseManager/businessKhata/stockbook/StockTable";
import MakeBillDialog from "@/components/user-dashboard/expenseManager/businessKhata/billbook/MakeBillDialog";
import BillTable from "@/components/user-dashboard/expenseManager/businessKhata/billbook/BillTable";
import CashEntryDialog from "@/components/user-dashboard/expenseManager/businessKhata/cashbook/CashEntryDialog";
import CashTable from "@/components/user-dashboard/expenseManager/businessKhata/cashbook/CashTable";

type Tab = "stock" | "bill" | "cash";

// keys MUST match the Tab values above
const TABS = [
    { key: "stock", label: "Stockbook", icon: Package },
    { key: "bill", label: "Billbook", icon: Receipt },
    { key: "cash", label: "Cashbook", icon: Wallet },
];

export default function BusinessKhataPage() {
    const store = useBusinessKhataStore();
    const [tab, setTab] = useState<Tab>("stock");
    const [cashDialog, setCashDialog] = useState<"in" | "out" | null>(null);

    useEffect(() => {
        const requested = new URLSearchParams(window.location.search).get("tab");
        if (requested === "stock" || requested === "bill" || requested === "cash") setTab(requested);
    }, []);

    const actions =
        tab === "stock" ? <AddItemDialog onAdd={store.addStock} />
            : tab === "bill" ? <MakeBillDialog stock={store.stock} onAdd={store.addBill} />
                : (
                    <>
                        <button onClick={() => setCashDialog("in")}
                            className="flex cursor-pointer items-center gap-1.5 rounded-brand-8 bg-success px-3 py-2 para-tiny font-semibold text-white hover:opacity-90">
                            <ArrowDownLeft size={14} /> Cash In
                        </button>
                        <button onClick={() => setCashDialog("out")}
                            className="flex cursor-pointer items-center gap-1.5 rounded-brand-8 bg-danger px-3 py-2 para-tiny font-semibold text-white hover:opacity-90">
                            <ArrowUpRight size={14} /> Cash Out
                        </button>
                    </>
                );

    return (
        <div className="flex flex-col gap-brand-12">
            <KhataPageHeader
                hideDataMode
                title={DIGITAL_KHATA_ROUTES.business.label}
                subtitle="Stock, bills aur cash ka hisaab"
                tabs={TABS}
                activeTab={tab}
                onTabChange={(k) => setTab(k as Tab)}
                actions={actions}
            />

            {tab === "stock" && <StockTable stock={store.stock} onDelete={store.deleteStock} />}
            {tab === "bill" && <BillTable bills={store.bills} onDelete={store.deleteBill} />}
            {tab === "cash" && (
                <>
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