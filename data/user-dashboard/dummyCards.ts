// data/user-dashboard/dummyCards.ts
import { ICard } from "@/types/expenseManager";

export const dummyCards: ICard[] = [
    { id: "card-1", label: "Primary Account", balance: 155950, last4: "1289", expiryMonth: 9, expiryYear: 25, gradient: "primary" },
    { id: "card-2", label: "Business Savings", balance: 57502, last4: "4821", expiryMonth: 12, expiryYear: 27, gradient: "secondary" },
    { id: "card-3", label: "Debit Card", balance: 77502, last4: "2342", expiryMonth: 12, expiryYear: 27, gradient: "dark" },
];