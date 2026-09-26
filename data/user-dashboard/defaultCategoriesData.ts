import { EntryKind, ICategory } from "@/types/expenseManagerTy";

export const defaultIncomeCategories: ICategory[] = [
    { id: "cat-salary", label: "Salary", color: "primary" },
    { id: "cat-sales", label: "Sales", color: "info" },
    { id: "cat-business-income", label: "Business", color: "secondary" },
    { id: "cat-rental-income", label: "Rental Income", color: "neutral" },
    { id: "cat-other-income", label: "Other", color: "neutral" },
];

export const defaultExpenseCategories: ICategory[] = [
    { id: "cat-food", label: "Food", color: "warning" },
    { id: "cat-transport", label: "Transport", color: "secondary" },
    { id: "cat-rent", label: "Rent", color: "primary" },
    { id: "cat-utilities", label: "Utilities", color: "info" },
    { id: "cat-business-expense", label: "Business", color: "neutral" },
    { id: "cat-other-expense", label: "Other", color: "neutral" },
];

export const defaultDebtCategories: ICategory[] = [
    { id: "cat-udhaar-lena", label: "Udhaar Lena", color: "info" },
    { id: "cat-udhaar-dena", label: "Udhaar Dena", color: "danger" },
];

export const CATEGORIES_BY_KIND: Record<EntryKind, ICategory[]> = {
    income: defaultIncomeCategories,
    expense: defaultExpenseCategories,
    debt: defaultDebtCategories,
};

export const defaultCategories: ICategory[] = [
    ...defaultIncomeCategories,
    ...defaultExpenseCategories,
    ...defaultDebtCategories,
];

export function getCategoriesForEntryKind(kind: EntryKind | null | undefined, categories: ICategory[]): ICategory[] {
    if (!kind) return categories;

    const allowedIds = new Set(CATEGORIES_BY_KIND[kind].map((category) => category.id));
    const matched = categories.filter((category) => allowedIds.has(category.id));

    if (matched.length > 0) return matched;
    return CATEGORIES_BY_KIND[kind];
}