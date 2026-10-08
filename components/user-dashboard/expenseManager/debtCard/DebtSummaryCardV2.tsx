"use client";
import Link from "next/link";
import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { IExpenseEntry, IParty } from "@/types/expenseManagerTy";
import { debtBalances, debtKey, debtTotals, pkr } from "@/lib/utils/debt";
import { PARTY_BASE, partyHref } from "@/lib/utils/party";
import BalanceText from "../party/BalanceText";

export default function DebtSummaryCardV2({ debtEntries, parties }: { debtEntries: IExpenseEntry[]; parties: IParty[] }) {
    const { rows, youWillGet, youWillGive } = useMemo(() => {
        const balances = debtBalances(debtEntries);
        const rows = [...balances]
            .filter(([, b]) => b !== 0)
            .map(([key, bal]) => {
                const party = parties.find((p) => p.id === key);
                const name = party?.name ?? debtEntries.find((e) => debtKey(e) === key)?.subject ?? key;
                return { key, bal, name, party };
            })
            .sort((a, b) => Math.abs(b.bal) - Math.abs(a.bal));
        return { rows, ...debtTotals(balances) };
    }, [debtEntries, parties]);

    return (
        <div className="flex h-full min-h-0 flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">
            <h3 className="para-small font-semibold text-text-dark">Udhaar Balances</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <div><p className="para-small font-semibold text-danger">{pkr(youWillGet)}</p><p className="para-tiny text-text-secondary-muted">You will get</p></div>
                <div><p className="para-small font-semibold text-green-600">{pkr(youWillGive)}</p><p className="para-tiny text-text-secondary-muted">You will give</p></div>
            </div>

            <div className="mt-3 flex flex-1 flex-col gap-1.5">
                {rows.length === 0 ? (
                    <div className="flex items-center justify-center gap-1.5 rounded-brand-8 bg-success-bg px-2 py-2.5">
                        <CheckCircle2 size={14} className="text-success" />
                        <span className="para-tiny font-semibold text-success">Sab hisaab barabar hai</span>
                    </div>
                ) : rows.slice(0, 4).map(({ key, bal, name, party }) => {
                    const inner = (<><span className="truncate para-tiny font-semibold">{name}</span><BalanceText value={bal} /></>);
                    const cls = "flex items-center justify-between gap-2 rounded-brand-8 border border-border-clr px-2.5 py-2";
                    return party
                        ? <Link key={key} href={partyHref(party)} className={`${cls} hover:bg-page-bg`}>{inner}</Link>
                        : <div key={key} className={cls}>{inner}</div>;
                })}
            </div>

            <Link href={PARTY_BASE} className="mt-2 self-center para-tiny font-semibold text-primary hover:underline">
                Sab parties dekhein
            </Link>
        </div>
    );
}