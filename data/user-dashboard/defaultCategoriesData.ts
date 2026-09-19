import { ICategory } from "@/types/expenseManager";

export const defaultCategories: ICategory[] = [
    { id: "cat-utilities", label: "Utilities", color: "info" },
    { id: "cat-food", label: "Food", color: "warning" },
    { id: "cat-transport", label: "Transport", color: "secondary" },
    { id: "cat-rent", label: "Rent", color: "primary" },
    { id: "cat-business", label: "Business", color: "neutral" },
    { id: "cat-other", label: "Other", color: "neutral" },
];