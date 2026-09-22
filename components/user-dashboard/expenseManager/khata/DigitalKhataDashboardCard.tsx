"use client";
import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, CircleDollarSign, Plus } from "lucide-react";
import AamdniDialog from "./AamdniDialog";
import KharchaDialog from "./KharchaDialog";
import UdhaarDialog from "./UdhaarDialog";
import { IExpenseEntry, ICategory, ICard, EntryKind } from "@/types/expenseManager";
import { QuickEntryValues } from "@/lib/schemas/quickEntrySchema";

function fmt(v: number) { return `PKR ${v.toLocaleString("en-PK")}`; }

export default function DigitalKhataDashboardCard({ entries, categories, cards, onSaved }: {
    entries: IExpenseEntry[]; categories: ICategory[]; cards: ICard[];
    onSaved: (v: QuickEntryValues & { kind: EntryKind }) => void;
}) {
    const [dialogKind, setDialogKind] = useState<EntryKind | null>(null);
    const income = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
    const debt = entries.filter((e) => e.kind === "debt" && !e.isSettled).reduce((s, e) => s + e.amount, 0);
    const cardBalance = cards.reduce((s, c) => s + c.balance, 0);

    return (
        <div className="group [perspective:1200px] h-full min-h-[280px]">
            <div className="relative h-full w-full default-transition [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                {/* FRONT */}
                <div className="absolute inset-0 flex flex-col gap-brand-12 rounded-brand-16 bg-gradient-wallet-card p-brand-12 text-white [backface-visibility:hidden]">
                    <div className="flex items-center justify-between">
                        <span className="para-small font-semibold">Digital Khatta</span>
                        <Wallet size={18} className="text-white/80" />
                    </div>
                    <span className="heading-h3">{fmt(cardBalance)}</span>
                    <div className="mt-auto grid grid-cols-3 gap-brand-8 border-t border-white/15 pt-brand-8">
                        <MiniStat icon={TrendingUp} label="Aamdani" value={income} />
                        <MiniStat icon={TrendingDown} label="Kharcha" value={expense} />
                        <MiniStat icon={CircleDollarSign} label="Udhaar" value={debt} />
                    </div>
                    <span className="para-tiny text-white/50">Hover for quick entry</span>
                </div>
                {/* BACK */}
                <div className="absolute inset-0 flex flex-col justify-center gap-brand-8 rounded-brand-16 bg-white p-brand-12 [backface-visibility:hidden] [transform:rotateY(180deg)] border border-border-clr">
                    <p className="para-tiny mb-1 font-semibold text-text-secondary-muter">Quick Entry</p>
                    <QuickBtn label="+ Aamdani" cls="bg-success-bg text-success" onClick={() => setDialogKind("income")} />
                    <QuickBtn label="+ Kharcha" cls="bg-primary-light text-primary" onClick={() => setDialogKind("expense")} />
                    <QuickBtn label="+ Udhaar" cls="bg-warning-bg text-warning" onClick={() => setDialogKind("debt")} />
                </div>
            </div>
            <AamdniDialog categories={categories} open={dialogKind === "income"} onOpenChange={(o) => !o && setDialogKind(null)} onSaved={onSaved} />
            <KharchaDialog categories={categories} open={dialogKind === "expense"} onOpenChange={(o) => !o && setDialogKind(null)} onSaved={onSaved} />
            <UdhaarDialog categories={categories} open={dialogKind === "debt"} onOpenChange={(o) => !o && setDialogKind(null)} onSaved={onSaved} />
        </div>
    );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
    return <div className="flex flex-col items-center gap-0.5"><Icon size={13} className="text-white/70" /><span className="para-tiny text-white/60">{label}</span><span className="para-tiny font-semibold">{fmt(value)}</span></div>;
}
function QuickBtn({ label, cls, onClick }: { label: string; cls: string; onClick: () => void }) {
    return <button onClick={onClick} className={`rounded-brand-8 px-3 py-2 para-small font-semibold text-left default-transition hover:opacity-80 ${cls}`}>{label}</button>;
}