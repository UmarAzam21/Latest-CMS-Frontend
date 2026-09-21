"use client";
import Link from "next/link";
import { Landmark, CircleCheck, ArrowUpRight } from "lucide-react";
import { ICard } from "@/types/expenseManager";

function fmt(v: number) { return `PKR ${v.toLocaleString("en-PK")}`; }

export default function CardsSnapshot({ cards }: { cards: ICard[] }) {
    const total = cards.reduce((s, c) => s + c.balance, 0);

    return (
        <div className="flex h-full flex-col rounded-brand-16 border border-border-clr bg-whitex bg-page-bg p-brand-12">
            <div className="flex justify-between items-center gap-2">
                <h3 className="heading-h6 text-sm">My Cards</h3>
                <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[9px] font-semibold uppercase text-primary">
                    {cards.length} linked
                </span>
            </div>

            <p className="mt-1 para-tiny text-text-secondary-muter">{fmt(total)} total balance</p>

            <div className="mt-4 flex flex-1 flex-col gap-2">
                {cards.length === 0 && (
                    <p className="para-small text-text-secondary-muted">No cards linked yet.</p>
                )}
                {cards.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 rounded-brand-8 bg-page-bg bg-white p-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brand-8 bg-danger-bg">
                            <Landmark size={18} className="text-primary" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <p className="truncate para-tiny font-semibold text-text-dark">{c.label}</p>
                                <CircleCheck size={12} className="shrink-0 text-primary" />
                            </div>
                            <p className="para-tiny text-text-secondary-muter">•••• {c.last4}</p>
                        </div>
                        <p className="para-tiny font-semibold text-text-dark">{fmt(c.balance)}</p>
                    </div>
                ))}
            </div>

            <Link
                href="/user-dashboard/expense-manager"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-brand-8 border border-dashed border-border-clr-dark bg-white py-2.5 para-tiny font-semibold text-text-secondary default-transition hover:border-primary hover:text-primary"
            >
                Manage Cards <ArrowUpRight size={13} />
            </Link>
        </div>
    );
}
