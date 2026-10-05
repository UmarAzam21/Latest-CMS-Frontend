// dashboard\lib\utils\debt.ts

import { DEBT_CATEGORY_TYPE, DEBT_TYPE_META, IExpenseEntry } from "@/types/expenseManagerTy";

export const pkr = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

export function debtSign(e: Pick<IExpenseEntry, "kind" | "categoryId">): 1 | -1 | 0 {
    if (e.kind !== "debt") return 0;
    const t = DEBT_CATEGORY_TYPE[e.categoryId];
    return t ? DEBT_TYPE_META[t].sign : 0;
}

// Linked entries group by party; legacy unlinked ones group by subject.
export const debtKey = (e: Pick<IExpenseEntry, "partyId" | "subject">) =>
    e.partyId ?? `s:${e.subject.trim().toLowerCase()}`;

export function debtBalances(entries: IExpenseEntry[]) {
    const m = new Map<string, number>();
    for (const e of entries) {
        const s = debtSign(e);
        if (s) m.set(debtKey(e), (m.get(debtKey(e)) ?? 0) + s * e.amount);
    }
    return m;
}

export function debtTotals(balances: Map<string, number>) {
    let youWillGet = 0, youWillGive = 0;
    balances.forEach((b) => (b > 0 ? (youWillGet += b) : (youWillGive -= b)));
    return { youWillGet, youWillGive };
}

// Running balance is computed over ALL rows, then filtered for display.
export function buildLedger(entries: IExpenseEntry[], key: string) {
    let bal = 0;
    return entries
        .filter((e) => e.kind === "debt" && debtKey(e) === key)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
        .map((entry) => {
            const sign = debtSign(entry) as 1 | -1;
            bal += sign * entry.amount;
            return { entry, sign, balance: bal };
        });
}
export type LedgerRow = ReturnType<typeof buildLedger>[number];