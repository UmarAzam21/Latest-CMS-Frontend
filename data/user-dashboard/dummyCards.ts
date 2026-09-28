// data/user-dashboard/dummyCards.ts
import { ICard } from "@/types/expenseManagerTy";

export const dummyCards: ICard[] = [
    { id: "card-1", label: "Meezan Bank", balance: 155950, last4: "1289", expiryMonth: 9, expiryYear: 31, gradient: "primary" },
    { id: "card-2", label: "MCB Bank", balance: 57502, last4: "4821", expiryMonth: 9, expiryYear: 12/30, gradient: "secondary" },
    // { id: "card-3", label: "AlFalah Bank", balance: 77502, last4: "2342", expiryMonth: 9, expiryYear: 12/31, gradient: "dark" },
];