import { IExpenseEntry } from "@/types/expenseManagerTy";

// Single rule for "how does this entry move a card balance". Backend must mirror it.
export function cardDelta(e: Pick<IExpenseEntry, "kind" | "amount" | "debtDirection">): number {
    if (e.kind === "income") return e.amount;
    if (e.kind === "expense") return -e.amount;
    if (e.debtDirection === "liya") return e.amount;   // borrowed: money in
    if (e.debtDirection === "diya") return -e.amount;  // lent: money out
    return 0;
}