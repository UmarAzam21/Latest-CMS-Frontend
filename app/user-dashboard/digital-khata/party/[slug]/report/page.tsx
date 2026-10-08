// dashboard\app\user-dashboard\digital-khata\party\[slug]\report\page.tsx

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer, MessageCircle } from "lucide-react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import PartyLedger from "@/components/user-dashboard/expenseManager/party/PartyLedger";
import { buildLedger, pkr } from "@/lib/utils/debt";
import { partyHref } from "@/lib/utils/party";
import {
    exportPartyCsv,
    exportPartyPdf,
    exportPartyXlsx,
    buildPartyPdf,
    partySummaryText
} from "@/lib/utils/exportParty";

type Side = "all" | "gave" | "got";
const field = "rounded-brand-8 border border-border-clr bg-white px-2.5 py-2 para-tiny outline-none";

export default function PartyReportPage() {
    const { slug } = useParams<{ slug: string }>();
    const store = useExpenseManagerStore();
    const [q, setQ] = useState("");
    const [side, setSide] = useState<Side>("all");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const party = store.parties.find((p) => p.slug === slug || p.id === slug);
    const pid = party?.id ?? "";
    const all = useMemo(() => buildLedger(store.entries, pid), [store.entries, pid]);

    const rows = useMemo(() => {
        return all.filter((r) =>
            (side === "all" || (side === "gave" ? r.sign > 0 : r.sign < 0)) &&
            (!from || r.entry.date >= from) &&
            (!to || r.entry.date <= to) &&
            (r.entry.description ?? "").toLowerCase().includes(q.toLowerCase())
        );
    }, [all, side, from, to, q]);

    if (!store.hasLoaded) {
        return null;
    }

    if (!party) {
        return <p className="p-6 para-small">Party nahi mili.</p>;
    }

    const gave = rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0);
    const got = rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0);
    const net = all.at(-1)?.balance ?? 0;

    const range = { from, to };
    const WA_BTN = "flex cursor-pointer items-center gap-1.5 rounded-brand-8 border border-primary px-4 py-2 para-tiny font-semibold text-primary";

    const shareWhatsApp = async () => {
        const text = partySummaryText(party, rows, net);
        const file = new File(
            [buildPartyPdf(party, rows, net, range).output("blob")],
            `${party.slug}-khata.pdf`,
            { type: "application/pdf" }
        );

        if (navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({ files: [file], text });
            } catch {
                /* user cancelled */
            }
            return;
        }
        window.open(
            `https://wa.me/?text=${encodeURIComponent(text)}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <div className="flex flex-col gap-brand-12">
            <div className="flex items-center gap-2 print:hidden">
                <Link href={partyHref(party)}>
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="heading-h6">Report of {party.name}</h1>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search entries"
                    className={`${field} flex-1`}
                />
                <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as Side)}
                    className={field}
                >
                    <option value="all">All</option>
                    <option value="gave">You Gave</option>
                    <option value="got">You Got</option>
                </select>
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className={field}
                    aria-label="Start date"
                />
                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className={field}
                    aria-label="End date"
                />
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-brand-12 border border-border-clr bg-white p-brand-12 text-center">
                <div>
                    <p className="para-tiny text-text-secondary-muted">Entries</p>
                    <p className="para-small font-semibold">{rows.length}</p>
                </div>
                <div>
                    <p className="para-tiny text-text-secondary-muted">You Gave</p>
                    <p className="para-small font-semibold text-danger">
                        {pkr(gave)}
                    </p>
                </div>
                <div>
                    <p className="para-tiny text-text-secondary-muted">You Got</p>
                    <p className="para-small font-semibold text-green-600">
                        {pkr(got)}
                    </p>
                </div>
                <p className="col-span-3 border-t border-border-clr pt-2 para-small font-semibold">
                    Net Balance: {pkr(Math.abs(net))}
                </p>
            </div>

            <PartyLedger rows={rows} />

            <div className="flex flex-wrap gap-2 print:hidden">
                <button
                    onClick={() => exportPartyPdf(party, rows, net, range, `${party.slug}-khata.pdf`)}
                    className={WA_BTN}
                >
                    PDF
                </button>
                <button
                    onClick={() => exportPartyXlsx(party, rows, net, range, `${party.slug}-khata.xlsx`)}
                    className={WA_BTN}
                >
                    Excel
                </button>
                <button
                    onClick={() => exportPartyCsv(party, rows, net, `${party.slug}-khata.csv`)}
                    className={WA_BTN}
                >
                    CSV
                </button>
                <button onClick={shareWhatsApp} className={WA_BTN}>
                    <MessageCircle size={14} /> WhatsApp
                </button>
            </div>
        </div>
    );
}
