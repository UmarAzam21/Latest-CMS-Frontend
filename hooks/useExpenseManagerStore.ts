// hooks/useExpenseManagerStore.ts
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { IExpenseEntry, ICategory, SortField, SortDirection, ICard } from "@/types/expenseManager";
import { defaultCategories } from "@/data/user-dashboard/defaultCategoriesData";
import { dummyExpenseEntries } from "@/data/user-dashboard/dummyExpenseEntries";
import { dummyCards } from "@/data/user-dashboard/dummyCards";

const STORAGE_KEY_ENTRIES = "filernow_expense_entries_v2";
const STORAGE_KEY_CATEGORIES = "filernow_expense_categories_v2";
const STORAGE_KEY_SEEDED = "filernow_expense_seeded_v2";
const STORAGE_KEY_CARDS = "filernow_expense_cards_v1";


function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useExpenseManagerStore() {
  const [entries, setEntries] = useState<IExpenseEntry[]>([]);
  const [categories, setCategories] = useState<ICategory[]>(defaultCategories);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [cards, setCards] = useState<ICard[]>([]);

  useEffect(() => {
    // "Seeded" is tracked independently of entries' emptiness, so that a
    // user who deletes every entry themselves stays at a real empty state
    // instead of getting re-seeded with dummy data on next load.
    const alreadySeeded = window.localStorage.getItem(STORAGE_KEY_SEEDED) === "true";

    if (alreadySeeded) {
      setEntries(readLocal(STORAGE_KEY_ENTRIES, []));
      setCards(readLocal(STORAGE_KEY_CARDS, dummyCards));
    } else {
      setEntries(dummyExpenseEntries);
      window.localStorage.setItem(STORAGE_KEY_SEEDED, "true");
    }

    setCategories(readLocal(STORAGE_KEY_CATEGORIES, defaultCategories));
    setHasLoaded(true);
  }, []);

  // Guarded: never persist before the load-effect has actually run, so we
  // can't repeat the "write [] over real data on first paint" bug.
  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
  }, [entries, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  }, [categories, hasLoaded]);

  // const addEntry = useCallback((entry: Omit<IExpenseEntry, "id">) => {
  //   setEntries((prev) => [{ ...entry, id: crypto.randomUUID() }, ...prev]);
  // }, []);

  const addEntry = useCallback((entry: Omit<IExpenseEntry, "id"> & { cardId?: string }) => {
    const { cardId, ...rest } = entry;
    setEntries((prev) => [{ ...rest, id: crypto.randomUUID() }, ...prev]);
    if (cardId && entry.kind !== "debt") {
      const delta = entry.kind === "income" ? entry.amount : -entry.amount;
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, balance: c.balance + delta } : c)));
    }
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
    const fallback = categories.find((c) => c.label === "Other");
    setEntries((prev) =>
      prev.map((e) => (e.categoryId === id && fallback ? { ...e, categoryId: fallback.id } : e))
    );
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, [categories]);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortField === "amount") cmp = a.amount - b.amount;
      if (sortField === "subject") cmp = a.subject.localeCompare(b.subject);
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [entries, sortField, sortDirection]);

  // new persist effect
  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  }, [cards, hasLoaded]);

  const addCard = useCallback((card: Omit<ICard, "id">) => {
    setCards((prev) => [...prev, { ...card, id: crypto.randomUUID() }]);
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const adjustCardBalance = useCallback((id: string, delta: number) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, balance: c.balance + delta } : c)));
  }, []);

  const transferBetweenCards = useCallback((fromId: string, toId: string, amount: number) => {
    setCards((prev) => prev.map((c) => {
      if (c.id === fromId) return { ...c, balance: c.balance - amount };
      if (c.id === toId) return { ...c, balance: c.balance + amount };
      return c;
    }));
  }, []);


  const stats = useMemo(() => {
    const totalIncome = entries.filter((e) => e.kind === "income").reduce((s, e) => s + e.amount, 0);
    const totalExpenses = entries.filter((e) => e.kind === "expense").reduce((s, e) => s + e.amount, 0);
    const totalDebt = entries.filter((e) => e.kind === "debt" && !e.isSettled).reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const categoryTotals = categories
      .map((cat) => {
        const amount = entries
          .filter((e) => e.categoryId === cat.id && e.kind === "expense")
          .reduce((s, e) => s + e.amount, 0);
        return { category: cat, amount };
      })
      .filter((c) => c.amount > 0);

    const totalCategorized = categoryTotals.reduce((s, c) => s + c.amount, 0);
    const categoryBreakdown = categoryTotals.map((c) => ({
      ...c,
      percentOfTotal: totalCategorized > 0 ? Math.round((c.amount / totalCategorized) * 100) : 0,
    }));

    const dailyMap = new Map<string, number>();
    entries.filter((e) => e.kind === "expense").forEach((e) => {
      const day = e.date.slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + e.amount);
    });
    const dailyTrend = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, amount]) => ({ label: date, amount }));

    const monthlyMap = new Map<string, number>();
    entries.filter((e) => e.kind === "expense").forEach((e) => {
      const month = e.date.slice(0, 7);
      monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + e.amount);
    });
    const monthlyTrend = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({ label: month, amount }));

    return { totalIncome, totalExpenses, totalDebt, balance, categoryBreakdown, dailyTrend, monthlyTrend };
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
    cards, addCard, deleteCard, adjustCardBalance, transferBetweenCards,
  };
}