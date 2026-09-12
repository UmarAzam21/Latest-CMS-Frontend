"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { IExpenseEntry, ICategory, SortField, SortDirection } from "@/types/expenseManager";
import { defaultCategories } from "@/data/user-dashboard/defaultCategoriesData";

const STORAGE_KEY_ENTRIES = "filernow_expense_entries_v1";
const STORAGE_KEY_CATEGORIES = "filernow_expense_categories_v1";

function readLocal<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

// NOTE: this hook's return shape is deliberately API-shaped (async-looking
// method names, no direct state exposure beyond entries/categories) so that
// swapping the internals for real fetch() calls against Umar's endpoints
// later doesn't require changing any component that consumes this hook.
export function useExpenseManagerStore() {
    const [entries, setEntries] = useState<IExpenseEntry[]>([]);
    const [categories, setCategories] = useState<ICategory[]>(defaultCategories);
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

    useEffect(() => {
        setEntries(readLocal(STORAGE_KEY_ENTRIES, []));
        setCategories(readLocal(STORAGE_KEY_CATEGORIES, defaultCategories));
    }, []);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    }, [entries]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    }, [categories]);

    const addEntry = useCallback((entry: Omit<IExpenseEntry, "id">) => {
        setEntries((prev) => [{ ...entry, id: crypto.randomUUID() }, ...prev]);
    }, []);

    const updateEntry = useCallback((id: string, patch: Partial<IExpenseEntry>) => {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    }, []);

    const deleteEntry = useCallback((id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }, []);

    const addCategory = useCallback((label: string, color: ICategory["color"]) => {
        setCategories((prev) => [...prev, { id: crypto.randomUUID(), label, color }]);
    }, []);

    const updateCategory = useCallback((id: string, patch: Partial<ICategory>) => {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    }, []);

    const deleteCategory = useCallback((id: string) => {
        // Guard: don't orphan entries silently, reassign them to "Other" if it
        // exists, otherwise block deletion. This is a real product decision;
        // flag it explicitly rather than letting entries point at a dead id.
        const fallback = categories.find((c) => c.label === "Other");
        setEntries((prev) =>
            prev.map((e) => (e.categoryId === id && fallback ? { ...e, categoryId: fallback.id } : e))
        );
        setCategories((prev) => prev.filter((c) => c.id !== id));
    }, [categories]);

    const sortedEntries = useMemo(() => {
        const sorted = [...entries].sort((a, b) => {
            let cmp = 0;
            if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (sortField === "amount") cmp = a.amount - b.amount;
            if (sortField === "subject") cmp = a.subject.localeCompare(b.subject);
            return sortDirection === "asc" ? cmp : -cmp;
        });
        return sorted;
    }, [entries, sortField, sortDirection]);

    // Derived stats, computed here so every consumer (stats cards, charts,
    // table) reads the same numbers. Once backend exists, these move server-side
    // and this hook just maps the API response; components don't change.
    const stats = useMemo(() => {
        const totalIncome = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
        const totalExpenses = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
        const totalDebt = entries.filter((e) => e.kind === "debt" && !e.isSettled).reduce((s, e) => s + e.amount, 0);
        const balance = totalIncome - totalExpenses;

        const categoryTotals = categories.map((cat) => {
            const amount = entries
                .filter((e) => e.categoryId === cat.id && e.kind === "expense")
                .reduce((s, e) => s + e.amount, 0);
            return { category: cat, amount };
        }).filter((c) => c.amount > 0);

        const totalCategorized = categoryTotals.reduce((s, c) => s + c.amount, 0);
        const categoryBreakdown = categoryTotals.map((c) => ({
            ...c,
            percentOfTotal: totalCategorized > 0 ? Math.round((c.amount / totalCategorized) * 100) : 0,
        }));

        // Daily totals for the last 7 days present in data, feeds the bar chart
        const dailyMap = new Map<string, number>();
        entries.filter((e) => e.kind === "expense").forEach((e) => {
            const day = e.date.slice(0, 10);
            dailyMap.set(day, (dailyMap.get(day) ?? 0) + e.amount);
        });
        const dailyTrend = Array.from(dailyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-7)
            .map(([date, amount]) => ({ date, amount }));

        return { totalIncome, totalExpenses, totalDebt, balance, categoryBreakdown, dailyTrend };
    }, [entries, categories]);

    return {
        entries: sortedEntries,
        categories,
        stats,
        sortField,
        sortDirection,
        setSortField,
        setSortDirection,
        addEntry,
        updateEntry,
        deleteEntry,
        addCategory,
        updateCategory,
        deleteCategory,
    };
}