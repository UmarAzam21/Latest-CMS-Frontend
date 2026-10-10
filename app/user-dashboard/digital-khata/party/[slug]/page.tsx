// dashboard\app\user-dashboard\digital-khata\party\[slug]\page.tsx

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, FileText, MessageCircle, MessageSquare, Pencil, Search, Trash2 } from "lucide-react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import KhataPageHeader from "@/components/user-dashboard/expenseManager/header/KhataPageHeader";
import DetailedEntryDialog from "@/components/user-dashboard/expenseManager/expenseStats/DetailedEntryDialog";
import PartyLedger from "@/components/user-dashboard/expenseManager/party/PartyLedger";
import PartyBalanceCard from "@/components/user-dashboard/expenseManager/party/PartyBalanceCard";
import ReminderDateDialog from "@/components/user-dashboard/expenseManager/party/ReminderDateDialog";
import AddPartyDialog from "@/components/user-dashboard/expenseManager/party/AddPartyDialog";
import { buildLedger, debtLabel } from "@/lib/utils/debt";
import { PARTY_BASE, partyHref } from "@/lib/utils/party";
import { DEBT_TYPE_META, IExpenseEntry, PARTY_TYPE_LABELS } from "@/types/expenseManagerTy";

const idsBySign = (s: 1 | -1) => Object.values(DEBT_TYPE_META).filter((m) => m.sign === s).map((m) => m.categoryId);
const actionCls = "flex flex-col items-center gap-1 rounded-brand-12 border border-border-clr bg-white py-2.5 para-tiny font-medium text-text-dark default-transition hover:border-primary/40 hover:bg-page-bg";

export default function PartyDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const router = useRouter();
    const store = useExpenseManagerStore();
    const [txn, setTxn] = useState<1 | -1 | null>(null); // 1 = You Gave, -1 = You Got
    const [editing, setEditing] = useState<IExpenseEntry | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [q, setQ] = useState("");

    const party = store.parties.find((p) => p.slug === slug || p.id === slug); // id fallback = old links
    const partyId = party?.id ?? "";
    const rows = useMemo(() => buildLedger(store.entries, partyId), [store.entries, partyId]);
    const balance = rows.at(-1)?.balance ?? 0;

    const { gave, got } = useMemo(() => ({
        gave: rows.filter((r) => r.sign > 0).reduce((s, r) => s + r.entry.amount, 0),
        got: rows.filter((r) => r.sign < 0).reduce((s, r) => s + r.entry.amount, 0),
    }), [rows]);

    const shown = useMemo(() => {
        const k = q.trim().toLowerCase();
        return k ? rows.filter((r) => `${debtLabel(r.entry.categoryId)} ${r.entry.description ?? ""}`.toLowerCase().includes(k)) : rows;
    }, [rows, q]);

    if (!store.hasLoaded) return null;
    if (!party) return <p className="p-6 para-small">Party nahi mili.</p>;

    const handleDelete = () => {
        if (store.deleteParty(party.id, true)) router.push(PARTY_BASE);
        else setConfirmDelete(false);
    };

    const digits = party.phone?.replace(/\D/g, "").replace(/^0/, "92");
    const amount = Math.abs(balance).toLocaleString("en-PK");
    const msg = balance > 0
        ? `Assalam o Alaikum ${party.name}, hamare khate ke mutabiq aap ki taraf Rs ${amount} baqaya hain. Meherbani karke ada kar dein.`
        : `Assalam o Alaikum ${party.name}, hamare khate ke mutabiq mujh par aap ke Rs ${amount} baqaya hain.`;

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

    const disabledCls = blocked ? "cursor-not-allowed opacity-40" : "cursor-pointer";

    return (
        <div className="flex flex-col gap-brand-12 pb-24">
            <KhataPageHeader
                hideDataMode
                backHref={PARTY_BASE}
                title={party.name}
                subtitle={`${PARTY_TYPE_LABELS[party.type]} • ${party.phone ?? "No number"}`}
                actions={
                    <div className="flex items-center gap-1.5">
                        <button type="button" title="Party edit karein" aria-label="Party edit karein" onClick={() => setEditOpen(true)}
                            className="cursor-pointer rounded-brand-8 border border-border-clr p-2 text-text-secondary hover:bg-page-bg">
                            <Pencil size={14} />
                        </button>
                        {confirmDelete ? (
                            <div className="flex items-center gap-1.5">
                                {/* <span className="para-tiny text-text-secondary-muted">Party delete karein?</span> */}
                                <span className="para-tiny text-text-secondary-muted">
                                    {rows.length > 0 ? `Party + ${rows.length} entries delete karein?` : "Party delete karein?"}
                                </span>
                                <button type="button" onClick={handleDelete} className="cursor-pointer rounded-brand-8 bg-danger px-2 py-1.5 para-tiny font-semibold text-white">Haan</button>
                                <button type="button" onClick={() => setConfirmDelete(false)} className="cursor-pointer rounded-brand-8 border border-border-clr px-2 py-1.5 para-tiny font-semibold text-text-secondary">Nahi</button>
                            </div>
                        ) : (
                            <button type="button" title="Party delete karein" aria-label="Party delete karein" onClick={() => setConfirmDelete(true)}
                                className="cursor-pointer rounded-brand-8 border border-border-clr p-2 text-text-secondary-muter hover:text-danger">
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                }
            />

            <PartyBalanceCard balance={balance} gave={gave} got={got} count={rows.length} />

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Link href={partyHref(party, "/report")} className={actionCls}><FileText size={18} className="text-warning" /> Report</Link>
                <ReminderDateDialog
                    name={party.name}
                    current={party.reminderDate}
                    onSave={(d) => { store.updateParty(party.id, { reminderDate: d }); toast.success(`Reminder date set: ${d}`); }}
                    onClear={() => { store.updateParty(party.id, { reminderDate: undefined }); toast.success("Reminder date hata di gayi"); }}
                />
                <button type="button" aria-disabled={Boolean(blocked)} title={blocked ?? "WhatsApp reminder bhejein"}
                    onClick={() => contact(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`)}
                    className={`${actionCls} ${disabledCls}`}>
                    <MessageCircle size={18} className="text-warning" /> Reminder
                </button>
                <button type="button" aria-disabled={Boolean(blocked)} title={blocked ?? "SMS bhejein"}
                    onClick={() => contact(`sms:${party.phone}?body=${encodeURIComponent(msg)}`, true)}
                    className={`${actionCls} ${disabledCls}`}>
                    <MessageSquare size={18} className="text-warning" /> SMS
                </button>
            </div>

            <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-muter" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Entries mein dhoondein (qism ya note)"
                    className="w-full rounded-brand-8 border border-border-clr bg-white py-2 pl-9 pr-3 para-small outline-none focus:border-primary" />
            </div>

            {/* <PartyLedger rows={shown} onRowClick={setEditing} /> */}
            <PartyLedger rows={shown} onEdit={setEditing} onDelete={store.deleteEntry} />

            <div className="sticky bottom-0 z-10 flex gap-3 border-t border-border-clr bg-white p-3">
                <button onClick={() => setTxn(1)} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-danger py-3 para-small font-bold uppercase text-white hover:opacity-90">
                    <ArrowUpRight size={16} /> You Gave Rs
                </button>
                <button onClick={() => setTxn(-1)} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-green-600 py-3 para-small font-bold uppercase text-white hover:opacity-90">
                    <ArrowDownLeft size={16} /> You Got Rs
                </button>
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

            <AddPartyDialog
                party={party}
                open={editOpen}
                onOpenChange={setEditOpen}
                onSaved={(v) => { store.updateParty(party.id, v); toast.success("Party update ho gayi"); }}
            />
        </div>
    );
}