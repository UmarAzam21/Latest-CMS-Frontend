// dashboard\app\user-dashboard\digital-khata\party\[slug]\report\page.tsx

"use client";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { CalendarDays, FileSpreadsheet, FileText, MessageCircle, Search, SlidersHorizontal, Download } from "lucide-react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import KhataPageHeader from "@/components/user-dashboard/expenseManager/header/KhataPageHeader";
import PartyLedger from "@/components/user-dashboard/expenseManager/party/PartyLedger";
import PartyBalanceCard from "@/components/user-dashboard/expenseManager/party/PartyBalanceCard";
import { Field, IconBox, inputCls } from "@/components/user-dashboard/expenseManager/ui/FormKit";
import { buildLedger, debtLabel } from "@/lib/utils/debt";
import { partyHref } from "@/lib/utils/party";
import { PARTY_TYPE_LABELS } from "@/types/expenseManagerTy";
import { exportPartyCsv, exportPartyPdf, exportPartyXlsx, buildPartyPdf, partySummaryText } from "@/lib/utils/exportParty";

type Side = "all" | "gave" | "got";
const BTN = "flex cursor-pointer items-center gap-1.5 rounded-brand-8 border border-primary px-4 py-2 para-tiny font-semibold text-primary default-transition hover:bg-primary hover:text-white";

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
        const k = q.trim().toLowerCase();
        return all.filter((r) => {
            const d = r.entry.date.slice(0, 10);
            return (side === "all" || (side === "gave" ? r.sign > 0 : r.sign < 0)) &&
                (!from || d >= from) && (!to || d <= to) &&
                (!k || `${debtLabel(r.entry.categoryId)} ${r.entry.description ?? ""}`.toLowerCase().includes(k));
        });
    }, [all, side, from, to, q]);

    if (!store.hasLoaded) return null;
    if (!party) return <p className="p-6 para-small">Party nahi mili.</p>;

    const gave = rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0);
    const got = rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0);
    const net = all.at(-1)?.balance ?? 0;
    const range = { from, to };
    const filtered = Boolean(q || from || to || side !== "all");
    const rangeLabel = from || to ? `${from || "shuru"} se ${to || "aaj"} tak` : "Tamam entries";

    // never export an empty file
    const guard = (fn: () => void) => () => (rows.length ? fn() : toast.info("In filters mein koi entry nahi hai"));

    const shareWhatsApp = guard(async () => {
        const text = partySummaryText(party, rows, net);
        const file = new File([buildPartyPdf(party, rows, net, range).output("blob")], `${party.slug}-khata.pdf`, { type: "application/pdf" });
        if (navigator.canShare?.({ files: [file] })) {
            try { await navigator.share({ files: [file], text }); } catch { /* user cancelled */ }
            return;
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    });

    return (
        <div className="flex flex-col gap-brand-12">
            <div className="print:hidden">
                <KhataPageHeader
                    hideDataMode
                    backHref={partyHref(party)}
                    title={`Report: ${party.name}`}
                    subtitle={`${PARTY_TYPE_LABELS[party.type]} • ${rangeLabel}`}
                />
            </div>

            <div className="grid grid-cols-1 gap-brand-8 rounded-brand-12 border border-border-clr bg-white p-brand-12 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
                <Field label="Entry dhoondein">
                    <IconBox icon={Search}>
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="qism ya note likhein" className={inputCls} />
                    </IconBox>
                </Field>
                <Field label="Kaun si entries?">
                    <IconBox icon={SlidersHorizontal}>
                        <select value={side} onChange={(e) => setSide(e.target.value as Side)} className={inputCls}>
                            <option value="all">Sab entries</option>
                            <option value="gave">You Gave (aap ne diya)</option>
                            <option value="got">You Got (aap ko mila)</option>
                        </select>
                    </IconBox>
                </Field>
                <Field label="Shuru ki tareekh">
                    <IconBox icon={CalendarDays}>
                        <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
                    </IconBox>
                </Field>
                <Field label="Akhri tareekh">
                    <IconBox icon={CalendarDays}>
                        <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputCls} />
                    </IconBox>
                </Field>
                {filtered && (
                    <button type="button" onClick={() => { setQ(""); setSide("all"); setFrom(""); setTo(""); }}
                        className="cursor-pointer justify-self-start para-tiny font-semibold text-primary hover:underline sm:col-span-2 lg:col-span-4">
                        Filters reset karein
                    </button>
                )}
            </div>

            <PartyBalanceCard balance={net} gave={gave} got={got} count={rows.length} />

            <PartyLedger rows={rows} />

            <div className="flex flex-wrap items-center gap-2 print:hidden">
                <span className="flex items-center gap-1.5 para-tiny font-semibold text-text-secondary-muted"><Download size={14} /> Report:</span>
                <button onClick={guard(() => exportPartyPdf(party, rows, net, range, `${party.slug}-khata.pdf`))} className={BTN}><FileText size={14} /> PDF</button>
                <button onClick={guard(() => exportPartyXlsx(party, rows, net, range, `${party.slug}-khata.xlsx`))} className={BTN}><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={guard(() => exportPartyCsv(party, rows, net, `${party.slug}-khata.csv`))} className={BTN}><FileText size={14} /> CSV</button>
                <button onClick={shareWhatsApp} className={BTN}><MessageCircle size={14} /> WhatsApp</button>
            </div>
        </div>
    );
}