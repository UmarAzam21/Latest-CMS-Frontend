// dashboard\app\user-dashboard\digital-khata\party\page.tsx

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Check, Download, Eye, EyeOff, Pencil, Scale, Search, SlidersHorizontal, Trash2, Truck, UserPlus, UserRound, Users, type LucideIcon } from "lucide-react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import KhataPageHeader from "@/components/user-dashboard/expenseManager/header/KhataPageHeader";
import AddPartyDialog from "@/components/user-dashboard/expenseManager/party/AddPartyDialog";
import BalanceText from "@/components/user-dashboard/expenseManager/party/BalanceText";
import { pkr } from "@/lib/utils/debt";
import { entryDateTime, entrySortKey, localDate } from "@/lib/utils/dateFmt";
import { exportPartyListCsv, exportPartyListPdf, exportPartyListXlsx, PartyListRow } from "@/lib/utils/exportParty";
import { partyHref } from "@/lib/utils/party";
import { DIGITAL_KHATA_ROUTES } from "@/data/user-dashboard/digitalKhata";
import { IExpenseEntry, IParty, PARTY_TYPES, PARTY_TYPE_LABELS, PartyType } from "@/types/expenseManagerTy";
import BulkPartyDialog from "@/components/user-dashboard/expenseManager/party/BulkPartyDialog";

type BalanceFilter = "all" | "get" | "give" | "settled";
type SortBy = "recent" | "name" | "balance";

const BALANCE_FILTERS: { value: BalanceFilter; label: string }[] = [
    { value: "all", label: "Sab parties" },
    { value: "get", label: "You will get (aap ko milenge)" },
    { value: "give", label: "You will give (aap ko dene hain)" },
    { value: "settled", label: "Settled (hisaab barabar)" },
];
const SORTS: { value: SortBy; label: string }[] = [
    { value: "recent", label: "Recent activity" },
    { value: "name", label: "Naam (A-Z)" },
    { value: "balance", label: "Sab se bara balance" },
];

const TAB_ICONS: Record<string, LucideIcon> = { all: Users, customer: UserRound, supplier: Truck };
const TABS = [
    { key: "all", label: "All" },
    ...PARTY_TYPES.map((t) => ({ key: t as string, label: `${PARTY_TYPE_LABELS[t]}s` })),
].map((t) => ({ ...t, icon: TAB_ICONS[t.key] }));

const menuCls = "z-dropdown w-60 rounded-brand-8 border border-border-clr bg-white p-1 shadow-card-hover";
const itemCls = "flex cursor-pointer items-center justify-between rounded-brand-8 px-2.5 py-2 para-tiny text-text-secondary outline-none hover:bg-page-bg data-[state=checked]:font-semibold data-[state=checked]:text-primary";
const ctrlBtn = "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-brand-8 border border-border-clr bg-white px-3 py-2 para-small font-medium text-text-secondary default-transition hover:bg-page-bg";

function Tile({ icon: Icon, label, value, sub, tone }: { icon: LucideIcon; label: string; value: string; sub: string; tone: "get" | "give" | "net" }) {
    const t = {
        get: { box: "border-danger/25 bg-danger-bg", chip: "bg-white text-danger", val: "text-danger" },
        give: { box: "border-success/25 bg-success-bg", chip: "bg-white text-success", val: "text-success" },
        net: { box: "border-border-clr bg-white", chip: "bg-page-bg text-text-secondary", val: "text-text-dark" },
    }[tone];
    return (
        <div className={`flex items-center gap-3 rounded-brand-12 border p-brand-12 ${t.box}`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-brand-8 ${t.chip}`}><Icon size={20} /></span>
            <div className="min-w-0">
                <p className="para-tiny font-semibold uppercase tracking-wide text-text-secondary-muted">{label}</p>
                <p className={`heading-h6 leading-tight ${t.val}`}>{value}</p>
                <p className="para-tiny text-text-secondary-muter">{sub}</p>
            </div>
        </div>
    );
}

export default function PartyListPage() {
    const store = useExpenseManagerStore();
    const [tab, setTab] = useState<"all" | PartyType>("all");
    const [q, setQ] = useState("");
    const [hidden, setHidden] = useState(false);
    const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>("all");
    const [sortBy, setSortBy] = useState<SortBy>("recent");
    const [editing, setEditing] = useState<IParty | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);

    // balance + latest entry per party
    const rows = useMemo(() => {
        const last = new Map<string, IExpenseEntry>();
        const counts = new Map<string, number>();
        for (const e of store.entries) {
            if (!e.partyId) continue;
            counts.set(e.partyId, (counts.get(e.partyId) ?? 0) + 1);
            const cur = last.get(e.partyId);
            if (!cur || entrySortKey(e) > entrySortKey(cur)) last.set(e.partyId, e);
        }
        return store.parties.map((party) => ({
            party,
            balance: store.stats.debtNet.get(party.id) ?? 0,
            last: last.get(party.id),
            count: counts.get(party.id) ?? 0,
        }));
    }, [store.parties, store.entries, store.stats.debtNet]);

    const inTab = useMemo(() => rows.filter((r) => tab === "all" || r.party.type === tab), [rows, tab]);

    const { get, give, getCount, giveCount } = useMemo(() => {
        let get = 0, give = 0, getCount = 0, giveCount = 0;
        inTab.forEach((r) => {
            if (r.balance > 0) { get += r.balance; getCount++; }
            else if (r.balance < 0) { give -= r.balance; giveCount++; }
        });
        return { get, give, getCount, giveCount };
    }, [inTab]);

    const visible = useMemo(() => {
        const k = q.trim().toLowerCase();
        const list = inTab.filter((r) =>
            (!k || r.party.name.toLowerCase().includes(k) || (r.party.phone ?? "").includes(k)) &&
            (balanceFilter === "all" ||
                (balanceFilter === "get" && r.balance > 0) ||
                (balanceFilter === "give" && r.balance < 0) ||
                (balanceFilter === "settled" && r.balance === 0))
        );
        const key = (r: (typeof rows)[number]) => (r.last ? entrySortKey(r.last) : r.party.createdAt);
        return [...list].sort((a, b) =>
            sortBy === "name" ? a.party.name.localeCompare(b.party.name)
                : sortBy === "balance" ? Math.abs(b.balance) - Math.abs(a.balance)
                    : key(b).localeCompare(key(a))
        );
    }, [inTab, q, balanceFilter, sortBy]);

    const filterActive = balanceFilter !== "all" || sortBy !== "recent";
    const mask = (n: number) => (hidden ? "Rs ••••" : pkr(n));
    const net = get - give;

    const doExport = (fmt: "pdf" | "xlsx" | "csv") => {
        if (!visible.length) return toast.info("Export karne ke liye koi party nahi hai");
        const data: PartyListRow[] = visible;
        const file = `parties-${localDate()}.${fmt}`;
        if (fmt === "pdf") exportPartyListPdf(data, file);
        else if (fmt === "xlsx") exportPartyListXlsx(data, file);
        else exportPartyListCsv(data, file);
    };

    return (
        <div className="flex flex-col gap-brand-12">
            <KhataPageHeader
                title={DIGITAL_KHATA_ROUTES.party.label}
                subtitle="Customers aur suppliers ke saath len-den ka hisaab"
                tabs={TABS}
                activeTab={tab}
                onTabChange={(k) => setTab(k as "all" | PartyType)}
                actions={
                    <>
                        <BulkPartyDialog
                            existing={store.parties}
                            defaultType={tab === "all" ? "customer" : tab}
                            onImport={store.addParties}
                        />
                        <AddPartyDialog
                            defaultType={tab === "all" ? "customer" : tab}
                            onSaved={store.addParty}
                            trigger={
                                <button type="button" className="flex cursor-pointer items-center gap-1.5 rounded-brand-8 bg-primary px-3 py-2 para-tiny font-semibold text-white hover:opacity-90">
                                    <UserPlus size={14} /> Add Party
                                </button>
                            }
                        />
                    </>
                }
            />

            <section className="flex flex-col gap-brand-8">
                <div className="flex items-center justify-between">
                    <h2 className="para-small font-semibold text-text-dark">Balance Overview</h2>
                    <button type="button" onClick={() => setHidden((h) => !h)}
                        className="flex cursor-pointer items-center gap-1.5 para-tiny font-medium text-primary hover:underline">
                        {hidden ? <Eye size={14} /> : <EyeOff size={14} />} {hidden ? "Balance Dikhayein" : "Balance Chhupayein"}
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-brand-8 sm:grid-cols-3">
                    <Tile tone="get" icon={ArrowDownLeft} label="You will get" value={mask(get)} sub={`${getCount} parties se milenge`} />
                    <Tile tone="give" icon={ArrowUpRight} label="You will give" value={mask(give)} sub={`${giveCount} parties ko dene hain`} />
                    <Tile tone="net" icon={Scale} label="Net balance" value={mask(Math.abs(net))}
                        sub={net > 0 ? "Kul aap ko milenge" : net < 0 ? "Kul aap ko dene hain" : "Hisaab barabar"} />
                </div>
            </section>

            <div className="flex flex-wrap items-center gap-brand-8">
                <div className="relative min-w-[200px] flex-1">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-muter" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${visible.length} parties mein naam ya number se dhoondein`}
                        className="w-full rounded-brand-8 border border-border-clr bg-white py-2 pl-9 pr-3 para-small outline-none focus:border-primary" />
                </div>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button type="button" className={ctrlBtn}>
                            <SlidersHorizontal size={14} /> Filters
                            {filterActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" sideOffset={6} className={menuCls}>
                            <DropdownMenu.Label className="px-2.5 py-1.5 para-tiny font-semibold text-text-secondary-muter">Balance ke mutabiq</DropdownMenu.Label>
                            <DropdownMenu.RadioGroup value={balanceFilter} onValueChange={(v) => setBalanceFilter(v as BalanceFilter)}>
                                {BALANCE_FILTERS.map((f) => (
                                    <DropdownMenu.RadioItem key={f.value} value={f.value} className={itemCls}>
                                        {f.label}<DropdownMenu.ItemIndicator><Check size={13} /></DropdownMenu.ItemIndicator>
                                    </DropdownMenu.RadioItem>
                                ))}
                            </DropdownMenu.RadioGroup>
                            <DropdownMenu.Separator className="my-1 h-px bg-border-clr" />
                            <DropdownMenu.Label className="px-2.5 py-1.5 para-tiny font-semibold text-text-secondary-muter">Tarteeb</DropdownMenu.Label>
                            <DropdownMenu.RadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                                {SORTS.map((s) => (
                                    <DropdownMenu.RadioItem key={s.value} value={s.value} className={itemCls}>
                                        {s.label}<DropdownMenu.ItemIndicator><Check size={13} /></DropdownMenu.ItemIndicator>
                                    </DropdownMenu.RadioItem>
                                ))}
                            </DropdownMenu.RadioGroup>
                            {filterActive && (
                                <>
                                    <DropdownMenu.Separator className="my-1 h-px bg-border-clr" />
                                    <DropdownMenu.Item onSelect={() => { setBalanceFilter("all"); setSortBy("recent"); }}
                                        className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-tiny font-semibold text-primary outline-none hover:bg-page-bg">
                                        Filters reset karein
                                    </DropdownMenu.Item>
                                </>
                            )}
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>

                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button type="button" className={ctrlBtn}><Download size={14} /> Export</button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content align="end" sideOffset={6} className="z-dropdown w-40 rounded-brand-8 border border-border-clr bg-white p-1 shadow-card-hover">
                            {([["pdf", "PDF"], ["xlsx", "Excel (.xlsx)"], ["csv", "CSV"]] as const).map(([f, label]) => (
                                <DropdownMenu.Item key={f} onSelect={() => doExport(f)}
                                    className="cursor-pointer rounded-brand-8 px-2.5 py-2 para-tiny text-text-secondary outline-none hover:bg-page-bg">{label}</DropdownMenu.Item>
                            ))}
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>

            <div className="overflow-hidden rounded-brand-12 border border-border-clr bg-white">
                {visible.length === 0 && (
                    <p className="p-8 text-center para-small text-text-secondary-muted">
                        {store.parties.length === 0 ? "Abhi koi party nahi hai. \"Add Party\" se shuru karein." : "Is filter mein koi party nahi mili."}
                    </p>
                )}
                {visible.map(({ party: p, balance, last, count }) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-2 border-b border-border-clr px-3 py-3 last:border-b-0 hover:bg-page-bg">
                        <Link href={partyHref(p)} title="Details dekhne ke liye click karein" className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brand-8 bg-page-bg font-semibold text-primary">
                                {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate para-small font-semibold text-text-dark">{p.name}</p>
                                <p className="truncate para-tiny text-text-secondary-muter">
                                    {p.phone ?? "No number"} <span className="mx-1 text-border-clr">|</span> {last ? entryDateTime(last) : "Koi entry nahi"}
                                </p>
                            </div>
                            <BalanceText value={balance} hidden={hidden} />
                        </Link>

                        <div className="flex items-center gap-1.5">
                            {confirmId === p.id ? (
                                <>
                                    <span className="para-tiny text-text-secondary-muted">{count > 0 ? `Party + ${count} entries delete?` : "Party delete?"}</span>
                                    <button type="button" onClick={() => { if (store.deleteParty(p.id, true)) setConfirmId(null); }}
                                        className="cursor-pointer rounded-brand-8 bg-danger px-2 py-1.5 para-tiny font-semibold text-white">Haan</button>
                                    <button type="button" onClick={() => setConfirmId(null)}
                                        className="cursor-pointer rounded-brand-8 border border-border-clr px-2 py-1.5 para-tiny font-semibold text-text-secondary">Nahi</button>
                                </>
                            ) : (
                                <>
                                    <Link href={partyHref(p)}
                                        className="flex items-center gap-1 rounded-brand-8 border border-primary px-2.5 py-1.5 para-tiny font-semibold text-primary default-transition hover:bg-primary hover:text-white">
                                        View details <ArrowRight size={12} />
                                    </Link>
                                    <button type="button" title="Party edit karein" aria-label="Party edit karein" onClick={() => setEditing(p)}
                                        className="cursor-pointer rounded-brand-8 border border-border-clr p-1.5 text-text-secondary hover:bg-page-bg"><Pencil size={13} /></button>
                                    <button type="button" title="Party delete karein" aria-label="Party delete karein" onClick={() => setConfirmId(p.id)}
                                        className="cursor-pointer rounded-brand-8 border border-border-clr p-1.5 text-text-secondary-muter hover:text-danger"><Trash2 size={13} /></button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <AddPartyDialog
                party={editing ?? undefined}
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
                onSaved={(v) => { if (editing) { store.updateParty(editing.id, v); toast.success("Party update ho gayi"); } }}
            />
        </div>
    );
}