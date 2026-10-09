// dashboard\components\user-dashboard\expenseManager\modeToggler\DataModeToggler.tsx

"use client";
import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";

export default function DataModeToggler() {
    const store = useExpenseManagerStore();
    const [confirm, setConfirm] = useState(false);
    const isDemo = store.dataMode === "demo";
    const hasData = store.entries.length + store.cards.length + store.parties.length > 0;
    const Icon = isDemo ? RotateCcw : Sparkles;

    const apply = () => {
        (isDemo ? store.resetToBlank : store.loadDemoData)();
        setConfirm(false);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-border-clr bg-white px-2.5 py-1.5 para-tiny text-text-secondary">
                <span className={`h-1.5 w-1.5 rounded-full ${isDemo ? "bg-warning" : "bg-success"}`} />
                Mode: {isDemo ? "Demo" : "Blank"}
            </span>

            {confirm ? (
                <div className="flex items-center gap-1.5">
                    <span className="para-tiny text-text-secondary-muted">Maujooda data replace hoga. Pakka?</span>
                    <button type="button" onClick={apply}
                        className="cursor-pointer rounded-brand-8 bg-danger px-2 py-1.5 para-tiny font-semibold text-white">Haan</button>
                    <button type="button" onClick={() => setConfirm(false)}
                        className="cursor-pointer rounded-brand-8 border border-border-clr px-2 py-1.5 para-tiny font-semibold text-text-secondary">Nahi</button>
                </div>
            ) : (
                <button type="button" onClick={() => (hasData ? setConfirm(true) : apply())}
                    className="flex cursor-pointer items-center gap-1.5 rounded-brand-8 border border-border-clr bg-white px-2.5 py-2 para-tiny font-semibold text-text-secondary default-transition hover:bg-page-bg">
                    <Icon size={13} /> {isDemo ? "Start Fresh" : "Load Demo Data"}
                </button>
            )}
        </div>
    );
}