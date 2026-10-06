// dashboard\app\user-dashboard\digital-khata\party\page.tsx

"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { useExpenseManagerStore } from "@/hooks/useExpenseManagerStore";
import AddPartyDialog from "@/components/user-dashboard/expenseManager/party/AddPartyDialog";
import BalanceText from "@/components/user-dashboard/expenseManager/party/BalanceText";
import { pkr } from "@/lib/utils/debt";
import { PartyType } from "@/types/expenseManagerTy";

const TABS: { key: "all" | PartyType; label: string }[] = [
    { key: "all", label: "All" }, { key: "customer", label: "Customers" },
    { key: "supplier", label: "Suppliers" }, { key: "bank", label: "Banks" },
];

export default function PartyListPage() {
    const store = useExpenseManagerStore();
    const [tab, setTab] = useState<"all" | PartyType>("all");
    const [q, setQ] = useState("");
    const [hidden, setHidden] = useState(false);

    const visible = useMemo(
        () => store.parties.filter((p) => (tab === "all" || p.type === tab) && p.name.toLowerCase().includes(q.toLowerCase())),
        [store.parties, tab, q]
    );

    const { get, give } = useMemo(() => {
        let get = 0, give = 0;
        visible.forEach((p) => { const b = store.stats.debtNet.get(p.id) ?? 0; if (b > 0) get += b; else give -= b; });
        return { get, give };
    }, [visible, store.stats.debtNet]);

    return (
        <div className="flex flex-col gap-brand-12">
            <div className="flex items-center justify-between">
                <h1 className="heading-h6">Party</h1>
                <AddPartyDialog
                    defaultType={tab === "supplier" ? "supplier" : tab === "bank" ? "bank" : "customer"}
                    onSaved={store.addParty}
                    trigger={
                        <button type="button" className="flex items-center gap-1.5 rounded-brand-8 bg-primary px-3 py-2 para-tiny font-semibold text-white">
                            <UserPlus size={14} /> Add Party
                        </button>
                    }
                />
            </div>

            <div className="flex gap-1 overflow-x-auto">
                {TABS.map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`shrink-0 rounded-brand-8 px-3 py-1.5 para-tiny font-medium ${tab === t.key ? "bg-primary text-white" : "bg-white border border-border-clr"}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-brand-12 rounded-brand-12 border border-border-clr bg-white p-brand-12">
                <div>
                    <p className="para-small font-semibold text-green-600">{hidden ? "Rs ••••" : pkr(give)}</p>
                    <p className="para-tiny text-text-secondary-muted">You will give</p>
                </div>
                <div>
                    <p className="para-small font-semibold text-danger">{hidden ? "Rs ••••" : pkr(get)}</p>
                    <p className="para-tiny text-text-secondary-muted">You will get</p>
                </div>
                <button onClick={() => setHidden((h) => !h)} className="col-span-2 text-left para-tiny text-primary">
                    {hidden ? "Show Balance" : "Hide Balance"}
                </button>
            </div>

            <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${visible.length} Party`}
                    className="w-full rounded-brand-8 border border-border-clr bg-white py-2 pl-9 pr-3 para-small outline-none" />
            </div>

            <div className="rounded-brand-12 border border-border-clr bg-white">
                {visible.length === 0 && <p className="p-6 text-center para-small text-text-secondary-muted">Koi party nahi mili</p>}
                {visible.map((p) => (
                    <Link key={p.id} href={`/user-dashboard/digital-khata/party/${p.id}`}
                        className="flex items-center gap-3 border-b border-border-clr px-3 py-3 last:border-b-0 hover:bg-page-bg">
                        <span className="flex h-10 w-10 items-center justify-center rounded-brand-8 bg-page-bg font-semibold text-primary">
                            {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate para-small font-semibold">{p.name}</p>
                            <p className="para-tiny capitalize text-text-secondary-muted">{p.phone ?? p.type}</p>
                        </div>
                        <BalanceText value={store.stats.debtNet.get(p.id) ?? 0} hidden={hidden} />
                    </Link>
                ))}
            </div>
        </div>
    );
}