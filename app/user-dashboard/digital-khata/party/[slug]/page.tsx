// dashboard\app\user-dashboard\digital-khata\party\[slug]\page.tsx

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, FileText, MessageCircle, MessageSquare } from "lucide-react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import DetailedEntryDialog from "@/components/user-dashboard/expenseManager/expenseStats/DetailedEntryDialog";
import PartyLedger from "@/components/user-dashboard/expenseManager/party/PartyLedger";
import BalanceText from "@/components/user-dashboard/expenseManager/party/BalanceText";
import ReminderDateDialog from "@/components/user-dashboard/expenseManager/party/ReminderDateDialog";
import { buildLedger } from "@/lib/utils/debt";
import { PARTY_BASE, partyHref } from "@/lib/utils/party";
import { DEBT_TYPE_META, IExpenseEntry } from "@/types/expenseManagerTy";

const idsBySign = (s: 1 | -1) => Object.values(DEBT_TYPE_META).filter((m) => m.sign === s).map((m) => m.categoryId);
const actionCls = "flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-brand-12 border border-border-clr bg-white py-2 para-tiny";

export default function PartyDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const store = useExpenseManagerStore();
    const [txn, setTxn] = useState<1 | -1 | null>(null); // 1 = You Gave, -1 = You Got
    const [editing, setEditing] = useState<IExpenseEntry | null>(null);

    const party = store.parties.find((p) => p.slug === slug || p.id === slug); // id fallback = old links
    const partyId = party?.id ?? "";
    const rows = useMemo(() => buildLedger(store.entries, partyId), [store.entries, partyId]);
    const balance = rows.at(-1)?.balance ?? 0;

    if (!store.hasLoaded) return null;
    if (!party) return <p className="p-6 para-small">Party nahi mili.</p>;

    const digits = party.phone?.replace(/\D/g, "").replace(/^0/, "92");
    const amount = Math.abs(balance).toLocaleString("en-PK");
    const msg = balance > 0
        ? `Assalam o Alaikum ${party.name}, hamare khate ke mutabiq aap ki taraf Rs ${amount} baqaya hain. Meherbani karke ada kar dein.`
        : `Assalam o Alaikum ${party.name}, hamare khate ke mutabiq mujh par aap ke Rs ${amount} baqaya hain.`;

    // Never a dead button: when blocked, tell the user why.
    const blocked = !digits ? "Is party ka phone number save nahi hai" : balance === 0 ? "Hisaab barabar hai, reminder ki zaroorat nahi" : null;
    const contact = (url: string, sameTab = false) => {
        if (blocked) return toast.info(blocked);
        if (sameTab) window.location.href = url;
        else window.open(url, "_blank", "noopener,noreferrer");
    };

    const defaultCategoryId = txn === 1
        ? DEBT_TYPE_META[balance < 0 ? "liya_wapis_diya" : "diya"].categoryId
        : txn === -1
            ? DEBT_TYPE_META[balance > 0 ? "diya_wapis_liya" : "liya"].categoryId
            : undefined;

    return (
        <div className="flex flex-col gap-brand-12 pb-24">
            <div className="flex items-center gap-2">
                <Link href={PARTY_BASE} aria-label="Back"><ArrowLeft size={18} /></Link>
                <h1 className="heading-h6">{party.name}</h1>
                <span className="rounded-full bg-page-bg px-2 py-0.5 para-tiny capitalize text-primary">{party.type}</span>
            </div>

            <div className="rounded-brand-12 border border-border-clr bg-white p-brand-12"><BalanceText value={balance} /></div>

            <div className="flex gap-2">
                <Link href={partyHref(party, "/report")} className={actionCls}><FileText size={18} className="text-warning" /> Report</Link>
                <ReminderDateDialog
                    name={party.name}
                    current={party.reminderDate}
                    onSave={(d) => { store.updateParty(party.id, { reminderDate: d }); toast.success(`Reminder date set: ${d}`); }}
                />
                <button type="button" aria-disabled={Boolean(blocked)} onClick={() => contact(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`)}
                    className={`${actionCls} ${blocked ? "opacity-40" : ""}`}>
                    <MessageCircle size={18} className="text-warning" /> Reminder
                </button>
                <button type="button" aria-disabled={Boolean(blocked)} onClick={() => contact(`sms:${party.phone}?body=${encodeURIComponent(msg)}`, true)}
                    className={`${actionCls} ${blocked ? "opacity-40" : ""}`}>
                    <MessageSquare size={18} className="text-warning" /> SMS
                </button>
            </div>

            <PartyLedger rows={rows} onRowClick={setEditing} />

            <div className="sticky bottom-0 z-10 flex gap-3 border-t border-border-clr bg-white p-3">
                <button onClick={() => setTxn(1)} className="flex-1 cursor-pointer rounded-full bg-danger py-3 para-small font-bold uppercase text-white">You Gave Rs</button>
                <button onClick={() => setTxn(-1)} className="flex-1 cursor-pointer rounded-full bg-green-600 py-3 para-small font-bold uppercase text-white">You Got Rs</button>
            </div>

            <DetailedEntryDialog
                kind={txn ? "debt" : null}
                categories={store.categories}
                cards={store.cards}
                parties={store.parties}
                onAddParty={store.addParty}
                editingEntry={editing}
                presetPartyId={party.id}
                categoryIds={txn ? idsBySign(txn) : undefined}
                defaultCategoryId={defaultCategoryId}
                onClose={() => { setTxn(null); setEditing(null); }}
                onSaved={(v) => (editing ? store.updateEntry(editing.id, v) : store.addEntry(v))}
            />
        </div>
    );
}