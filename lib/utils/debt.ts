// dashboard\lib\utils\debt.ts

import { DEBT_CATEGORY_TYPE, DEBT_TYPE_META, IExpenseEntry } from "@/types/expenseManagerTy";

// Formats a raw numerical value into a standard Pakistani Rupee currency string layout with comma groups.
export const pkr = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

// Extracts the immutable financial direction modifier (+1, -1, or 0) based on the transaction category ID matrix.
export function debtSign(e: Pick<IExpenseEntry, "kind" | "categoryId">): 1 | -1 | 0 {
    if (e.kind !== "debt") {
        return 0;
    }
    const t = DEBT_CATEGORY_TYPE[e.categoryId];
    return t ? DEBT_TYPE_META[t].sign : 0;
}

// Generates a lookup identity grouping key mapping directly to a specific account profile identifier or a lowercase text fallback.
export const debtKey = (e: Pick<IExpenseEntry, "partyId" | "subject">) =>
    e.partyId ?? `s:${e.subject.trim().toLowerCase()}`;

// Loops across the full array log history streams to accumulate and track net cash totals per customer or supplier key index.
export function debtBalances(entries: IExpenseEntry[]) {
    const m = new Map<string, number>();

    for (const e of entries) {
        const s = debtSign(e);
        if (s) {
            m.set(debtKey(e), (m.get(debtKey(e)) ?? 0) + s * e.amount);
        }
    }
    return m;
}

// Scans all net compiled totals to separate individual asset rows into clear global indicators: You Will Get vs You Will Give.
export function debtTotals(balances: Map<string, number>) {
    let youWillGet = 0;
    let youWillGive = 0;

    balances.forEach((b) => (b > 0 ? (youWillGet += b) : (youWillGive -= b)));
    return { youWillGet, youWillGive };
}

// Gathers individual immutable transactions, sorts them chronologically, and calculates a running row-by-row balance history list.
export function buildLedger(entries: IExpenseEntry[], key: string) {
    let bal = 0;

    return entries
        .filter((e) => e.kind === "debt" && debtKey(e) === key)
        .sort(
            (a, b) =>
                a.date.localeCompare(b.date) ||
                (a.createdAt ?? "").localeCompare(b.createdAt ?? "")
        )
        .map((entry) => {
            const sign = debtSign(entry) as 1 | -1;
            bal += sign * entry.amount;
            return { entry, sign, balance: bal };
        });
}

export type LedgerRow = ReturnType<typeof buildLedger>[number];