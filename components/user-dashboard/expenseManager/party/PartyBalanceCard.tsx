// dashboard\components\user-dashboard\expenseManager\party\PartyBalanceCard.tsx

import { ArrowDownLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { pkr } from "@/lib/utils/debt";

export default function PartyBalanceCard({ balance, gave, got, count }: { balance: number; gave: number; got: number; count: number }) {
    const t = balance > 0
        ? { box: "border-danger/25 bg-danger-bg", val: "text-danger", chip: "bg-white text-danger", Icon: ArrowDownLeft, label: "You will get", sub: "Is party se aap ko paise milenge" }
        : balance < 0
            ? { box: "border-success/25 bg-success-bg", val: "text-success", chip: "bg-white text-success", Icon: ArrowUpRight, label: "You will give", sub: "Aap ko is party ko paise dene hain" }
            : { box: "border-border-clr bg-white", val: "text-text-secondary", chip: "bg-page-bg text-text-secondary", Icon: CheckCircle2, label: "Settled up", sub: "Hisaab barabar hai" };

    return (
        <div className={`overflow-hidden rounded-brand-12 border ${t.box}`}>
            <div className="flex items-center gap-3 p-brand-12">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-brand-8 ${t.chip}`}><t.Icon size={22} /></span>
                <div>
                    <p className="para-tiny font-semibold uppercase tracking-wide text-text-secondary-muted">{t.label}</p>
                    <p className={`heading-h6 leading-tight ${t.val}`}>{pkr(Math.abs(balance))}</p>
                    <p className="para-tiny text-text-secondary-muter">{t.sub}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border-clr border-t border-border-clr bg-white/70 text-center">
                <div className="py-2"><p className="para-tiny text-text-secondary-muted">Total You Gave</p><p className="para-small font-semibold text-danger">{pkr(gave)}</p></div>
                <div className="py-2"><p className="para-tiny text-text-secondary-muted">Total You Got</p><p className="para-small font-semibold text-success">{pkr(got)}</p></div>
                <div className="py-2"><p className="para-tiny text-text-secondary-muted">Entries</p><p className="para-small font-semibold text-text-dark">{count}</p></div>
            </div>
        </div>
    );
}