// dashboard\components\user-dashboard\expenseManager\khata\DigitalKhataDashboardCard.tsx

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown, CircleDollarSign, Landmark, ArrowUpRight, Store, Plus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import DetailedEntryDialog from "../expenseStats/DetailedEntryDialog";
import { DetailedEntryValues } from "@/lib/schemas/detailedEntrySchema";
import { IExpenseEntry, ICategory, ICard, EntryKind } from "@/types/expenseManagerTy";
import { buildTrend } from "@/lib/utils/trend";

function fmt(v: number) { return `PKR ${v.toLocaleString("en-PK")}`; }

export default function DigitalKhataDashboardCard({ entries, categories, cards, onSaved }: {
    entries: IExpenseEntry[]; categories: ICategory[]; cards: ICard[];
    onSaved: (v: DetailedEntryValues & { kind: EntryKind }) => void;
}) {
    const [dialogKind, setDialogKind] = useState<EntryKind | null>(null);

    const income = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
    const debt = entries.filter((e) => e.kind === "debt" && !e.isSettled).reduce((s, e) => s + e.amount, 0);
    const cardBalance = cards.reduce((s, c) => s + c.balance, 0);

    const trend = useMemo(() => buildTrend(entries, (d) => d.slice(0, 10), 7), [entries]);
    const percentUsed = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;

    if (cards.length === 0 && entries.length === 0) {
        return (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 rounded-brand-16 border border-dashed border-border-clr-dark bg-white p-6 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-brand-12 bg-primary-light">
                    <Wallet size={20} className="text-primary" strokeWidth={2} />
                </span>
                <h3 className="heading-h5 text-text-dark">Set up Digital Khatta</h3>
                <p className="para-small max-w-[220px] text-text-secondary-muted">
                    Track aamdani, kharcha and udhaar in one place, and see your net balance at a glance.
                </p>
                <Link
                    href="/user-dashboard/digital-khata/daily"
                    className="mt-1 flex items-center gap-1.5 rounded-brand-8 bg-primary px-4 py-2 para-small font-semibold text-white default-transition hover:opacity-90"
                >
                    <Plus size={14} /> Get Started
                </Link>
            </div>
        );
    }

    return (
        <div className="expense-card-perspective h-full min-h-[300px]">
            <div className="expense-card-inner h-full">
                {/* ---------- FRONT ------------- */}
                <div className="expense-card-face flex h-full flex-col gap-brand-8 rounded-brand-16 bg-gradient-wallet-card p-brand-12 text-white shadow-card-hover">
                    <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-brand-8">
                        <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand-8 bg-white/80 p-1.5">
                                <img src="/filernow-wellness-icon-01.png" alt="Filernow logo" className="h-full w-full object-contain" />
                            </span>
                            <span className="para-small font-medium">Digital Khatta</span>
                        </div>
                        <span className="para-tiny text-white/85 font-semiboldx">Manage your money</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <p className="heading-h5">{fmt(cardBalance)}</p>
                        <div className="flex items-center justify-between gap-1.5">
                            <p className="para-tiny text-white/60">Total Cards Balance</p>
                            <p className="para-tiny text-white/50">{cards.length} card(s) linked</p>
                        </div>
                    </div>

                    {/* mini trend: income vs expense, last 7 days */}
                    <div className="h-[70px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trend} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="dkIncomeFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.55} />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.03} />
                                    </linearGradient>
                                    <linearGradient id="dkExpenseFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    formatter={(v, name) => [fmt(Number(v ?? 0)), name === "income" ? "Aamdani" : "Kharcha"]}
                                    contentStyle={{ borderRadius: 8, border: "none", fontSize: 11 }}
                                />
                                <Area type="monotone" dataKey="income" stroke="#ffffff" strokeWidth={1.5} fill="url(#dkIncomeFill)" />
                                <Area type="monotone" dataKey="expense" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={1.5} fill="url(#dkExpenseFill)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-auto grid grid-cols-3 gap-brand-8 border-t border-white/15 pt-brand-8">
                        <MiniStat icon={TrendingUp} label="Aamdani" value={income} />
                        <MiniStat icon={TrendingDown} label="Kharcha" value={expense} />
                        <MiniStat icon={CircleDollarSign} label="Udhaar" value={debt} />
                    </div>

                    <div className="flex items-center justify-center para-tiny text-white/60 border-t border-white/15 pt-brand-8">
                        <span className="text-center">Hover for actions</span>
                    </div>
                </div>

                {/* ---------- BACK ------------- */}
                <div className="expense-card-face expense-card-back flex h-full flex-col gap-brand-8 rounded-brand-16 bg-gradient-wallet-card p-brand-12 text-white shadow-card-hover">
                    <div className="flex items-center justify-between border-b border-white/15 pb-brand-8">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-brand-8 bg-white/80 p-1.5">
                            <img src="/filernow-wellness-icon-01.png" alt="Filernow logo" className="h-full w-full object-contain" />
                        </span>
                        <Link
                            href="/user-dashboard/digital-khata/daily"
                            className="para-tiny flex items-center gap-1 font-semibold text-white/85 default-transition hover:text-white"
                        >
                            Open full tracker <ArrowUpRight size={12} />
                        </Link>
                    </div>

                    <p className="para-tiny font-semibold text-white/60">Quick Entry</p>
                    <div className="grid grid-cols-2 gap-brand-8">
                        <QuickAction icon={TrendingUp} label="Aamdani" onClick={() => setDialogKind("income")} />
                        <QuickAction icon={TrendingDown} label="Kharcha" onClick={() => setDialogKind("expense")} />
                        <div className="col-span-2 flexx">
                            <QuickAction icon={Landmark} label="Udhaar" onClick={() => setDialogKind("debt")} />
                        </div>
                    </div>

                    {/* income vs spent usage bar — moved here from front */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between para-tiny text-white/70">
                            <span>Income {fmt(income)}</span>
                            <span>Spent {fmt(expense)}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                            <div className="h-full rounded-full bg-white default-transition" style={{ width: `${percentUsed}%` }} />
                        </div>
                    </div>

                    {/* <div className="mt-auto grid grid-cols-2 gap-brand-8 border-t border-white/15 pt-brand-8"> */}
                    <div className="mt-auto flex flex-col gap-brand-8 border-t border-white/15 pt-brand-8">
                        <NavLink href="/user-dashboard/digital-khata/daily" icon={Wallet} label="Daily Khata" />
                        <NavLink href="/user-dashboard/digital-khata/business" icon={Store} label="Business Khata" />

                        {/* <div className="col-span-2">
                            <NavLink href="/user-dashboard/digital-khata/udhaar" icon={Landmark} label="Udhaar Khata" />
                        </div> */}
                    </div>

                </div>
            </div>

            <DetailedEntryDialog
                kind={dialogKind}
                categories={categories}
                cards={cards}
                onClose={() => setDialogKind(null)}
                onSaved={onSaved}
            />
        </div>
    );
}

function MiniStat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
    return (
        <div className="flex flex-col items-center gap-0.5 rounded-brand-8 border border-white/20 bg-white/10 px-1 py-1.5">
            <Icon size={13} className="text-white/80" />
            <span className="para-tiny text-white/70">{label}</span>
            <span className="para-tiny text-white/90 font-semibold">{fmt(value)}</span>
        </div>
    );
}

// [from C's colors] border-white/20 + white/10 fill, inverts to white on hover —
// but a single compact row instead of C's min-h-[82px] block, per "more minimal".
function QuickAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-1x w-full items-center gap-2 rounded-brand-8 border border-white/20 bg-white/10 px-2 py-2 text-left default-transition cursor-pointer text-white/90 hover:bg-white hover:text-primary"
        >
            <Icon size={14} />
            {/* <span className="para-tiny font-medium">+ {label}</span> */}
            <span className="para-tiny font-medium">Add {label}</span>
        </button>
    );
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link
            href={href}
            // className="flex items-center gap-1.5 rounded-brand-8 px-2 py-1.5 para-tiny text-white/70 default-transition hover:bg-white/10 hover:text-white"
            className="flex flex-1 items-center gap-2 rounded-brand-8 border border-white/20 bg-white/10 px-2 py-2 para-tiny font-medium text-white/85 default-transition hover:bg-white hover:text-primary"
        >
            <Icon size={13} /> {label} <ArrowUpRight size={11} className="ml-auto" />
        </Link>
    );
}