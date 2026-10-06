// dashboard\app\user-dashboard\digital-khata\party\[id]\report\page.tsx

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer, MessageCircle } from "lucide-react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import PartyLedger from "@/components/user-dashboard/expenseManager/party/PartyLedger";
import { buildLedger, pkr } from "@/lib/utils/debt";

type Side = "all" | "gave" | "got";
const field = "rounded-brand-8 border border-border-clr bg-white px-2.5 py-2 para-tiny outline-none";

export default function PartyReportPage() {
    const { id } = useParams<{ id: string }>();
    const store = useExpenseManagerStore();
    const [q, setQ] = useState(""); const [side, setSide] = useState<Side>("all");
    const [from, setFrom] = useState(""); const [to, setTo] = useState("");

    const party = store.parties.find((p) => p.id === id);
    const all = useMemo(() => buildLedger(store.entries, id), [store.entries, id]);
    const rows = useMemo(() => all.filter((r) =>
        (side === "all" || (side === "gave" ? r.sign > 0 : r.sign < 0)) &&
        (!from || r.entry.date >= from) && (!to || r.entry.date <= to) &&
        (r.entry.description ?? "").toLowerCase().includes(q.toLowerCase())
    ), [all, side, from, to, q]);

    if (!store.hasLoaded) return null;
    if (!party) return <p className="p-6 para-small">Party nahi mili.</p>;

    const gave = rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0);
    const got = rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0);
    const net = all.at(-1)?.balance ?? 0;
    const summary = `${party.name} ka khata: You Gave ${pkr(gave)}, You Got ${pkr(got)}, Net ${pkr(Math.abs(net))} (${net > 0 ? "aap ko milenge" : net < 0 ? "aap ko dene hain" : "settled"})`;

    return (
        <div className="flex flex-col gap-brand-12">
            <div className="flex items-center gap-2 print:hidden">
                <Link href={`/user-dashboard/digital-khata/party/${id}`}><ArrowLeft size={18} /></Link>
                <h1 className="heading-h6">Report of {party.name}</h1>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search entries" className={`${field} flex-1`} />
                <select value={side} onChange={(e) => setSide(e.target.value as Side)} className={field}>
                    <option value="all">All</option><option value="gave">You Gave</option><option value="got">You Got</option>
                </select>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={field} aria-label="Start date" />
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={field} aria-label="End date" />
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-brand-12 border border-border-clr bg-white p-brand-12 text-center">
                <div><p className="para-tiny text-text-secondary-muted">Entries</p><p className="para-small font-semibold">{rows.length}</p></div>
                <div><p className="para-tiny text-text-secondary-muted">You Gave</p><p className="para-small font-semibold text-danger">{pkr(gave)}</p></div>
                <div><p className="para-tiny text-text-secondary-muted">You Got</p><p className="para-small font-semibold text-green-600">{pkr(got)}</p></div>
                <p className="col-span-3 border-t border-border-clr pt-2 para-small font-semibold">Net Balance: {pkr(Math.abs(net))}</p>
            </div>

            <PartyLedger rows={rows} />

            <div className="flex gap-2 print:hidden">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-brand-8 border border-primary px-4 py-2 para-tiny font-semibold text-primary">
                    <Printer size={14} /> Print / PDF
                </button>
                <a href={`https://wa.me/?text=${encodeURIComponent(summary)}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-brand-8 border border-primary px-4 py-2 para-tiny font-semibold text-primary">
                    <MessageCircle size={14} /> WhatsApp
                </a>
            </div>
        </div>
    );
}