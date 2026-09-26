// hooks/useExpenseManagerStore.ts
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { IExpenseEntry, ICategory, SortField, SortDirection, ICard } from "@/types/expenseManagerTy";
import { defaultCategories } from "@/data/user-dashboard/defaultCategoriesData";
import { dummyExpenseEntries } from "@/data/user-dashboard/dummyExpenseEntries";
import { dummyCards } from "@/data/user-dashboard/dummyCards";
import { buildTrend, weekKey } from "@/lib/utils/trend";
import { toast } from "sonner";


// Bump ONLY this one line when IExpenseEntry/ICategory/ICard fields are
// RENAMED or REMOVED. Adding a new OPTIONAL field does NOT require a bump —
// old stored JSON simply parses with that field undefined, which is valid.
const SCHEMA_VERSION = "v5";
const STORAGE_KEY_ENTRIES = `filernow_expense_entries_${SCHEMA_VERSION}`;
const STORAGE_KEY_CATEGORIES = `filernow_expense_categories_${SCHEMA_VERSION}`;
const STORAGE_KEY_SEEDED = `filernow_expense_seeded_${SCHEMA_VERSION}`;
const STORAGE_KEY_CARDS = `filernow_expense_cards_${SCHEMA_VERSION}`;
const STORAGE_KEY_MODE = `filernow_khata_mode_${SCHEMA_VERSION}`; // "demo" | "blank"

// Safety net for teammates who forget to bump: if stored entries don't match
// the current required shape (e.g. still using old `category` instead of
// `categoryId`), auto-reseed instead of silently rendering broken/empty data.
function isValidEntry(e: any): e is IExpenseEntry {
  return e &&
    typeof e.id === "string" &&
    typeof e.kind === "string" &&
    typeof e.categoryId === "string" &&
    typeof e.amount === "number" &&
    typeof e.date === "string";
}


function readLocalT<T>(key: string, fallback: T): T {
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
  const [dataMode, setDataMode] = useState<"demo" | "blank">("demo");


  useEffect(() => {
    // "Seeded" is tracked independently of entries' emptiness, so that a
    // user who deletes every entry themselves stays at a real empty state
    // instead of getting re-seeded with dummy data on next load.
    const alreadySeeded = window.localStorage.getItem(STORAGE_KEY_SEEDED) === "true";

    if (alreadySeeded) {
      const raw = readLocalT<IExpenseEntry[]>(STORAGE_KEY_ENTRIES, []);
      const isHealthy = Array.isArray(raw) && (raw.length === 0 || raw.every(isValidEntry));
      setEntries(isHealthy ? raw : dummyExpenseEntries); // auto-heal on shape mismatch
    } else {
      setEntries(dummyExpenseEntries);
      window.localStorage.setItem(STORAGE_KEY_SEEDED, "true");
    }

    // Cards seed unconditionally, not gated behind entries' seeded flag,
    // since it's an independent dataset with its own storage key.
    setCards(readLocalT(STORAGE_KEY_CARDS, dummyCards));
    setCategories(readLocalT(STORAGE_KEY_CATEGORIES, defaultCategories));
    setHasLoaded(true);
    setDataMode((readLocalT(STORAGE_KEY_MODE, "demo") as "demo" | "blank"));
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

  // load demo data
  const loadDemoData = useCallback(() => {
    setEntries(dummyExpenseEntries);
    setCards(dummyCards);
    window.localStorage.setItem(STORAGE_KEY_MODE, "demo");
    setDataMode("demo");
  }, []);

  // reset to blank
  const resetToBlank = useCallback(() => {
    setEntries([]);
    setCards([]);
    window.localStorage.setItem(STORAGE_KEY_MODE, "blank");
    setDataMode("blank");
  }, []);

  const addEntry = useCallback((entry: Omit<IExpenseEntry, "id">) => {
    try {
      const withBaseline = entry.kind === "debt"
        ? { ...entry, originalAmount: entry.originalAmount ?? entry.amount }
        : entry;

      setEntries((prev) => [{ ...withBaseline, id: crypto.randomUUID() }, ...prev]);

      if (entry.cardId && entry.kind !== "debt") {
        const delta = entry.kind === "income" ? entry.amount : -entry.amount;
        setCards((prev) => prev.map((c) => (c.id === entry.cardId ? { ...c, balance: c.balance + delta } : c)));
      }

      toast.success(`${entry.subject} saved`);
    } catch {
      toast.error("Couldn't save entry. Please try again.");
    }
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<IExpenseEntry>) => {
    try {
      setEntries((prev) => {
        const old = prev.find((e) => e.id === id);
        if (!old) return prev;
        const updated = { ...old, ...patch };

        setCards((prevCards) => {
          let next = prevCards;

          if (old.cardId && old.kind !== "debt") {
            const reverse = old.kind === "income" ? -old.amount : old.amount;
            next = next.map((c) => (c.id === old.cardId ? { ...c, balance: c.balance + reverse } : c));
          }

          if (updated.cardId && updated.kind !== "debt") {
            const apply = updated.kind === "income" ? updated.amount : -updated.amount;
            next = next.map((c) => (c.id === updated.cardId ? { ...c, balance: c.balance + apply } : c));
          }

          return next;
        });

        return prev.map((e) => (e.id === id ? updated : e));
      });

      toast.success(`${patch.subject ?? "Entry"} updated`);
    } catch {
      toast.error("Couldn't update entry. Please try again.");
    }
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const target = prev.find((e) => e.id === id);

      if (target?.cardId && target.kind !== "debt") {
        const reverse = target.kind === "income" ? -target.amount : target.amount;
        setCards((prevCards) => prevCards.map((c) => (c.id === target.cardId ? { ...c, balance: c.balance + reverse } : c)));
      }

      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const makeDebtPayment = useCallback((id: string, paymentAmount: number) => {
    setEntries((prev) => prev.map((e) => {
      if (e.id !== id) return e;
      const remaining = Math.max(0, e.amount - paymentAmount);
      return { ...e, amount: remaining, isSettled: remaining === 0 };
    }));
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

      if (sortField === "date") {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortField === "amount") {
        cmp = a.amount - b.amount;
      }
      if (sortField === "subject") {
        cmp = a.subject.localeCompare(b.subject);
      }

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

  const updateCard = useCallback((id: string, patch: Partial<ICard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
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
    const totalIncome = entries
      .filter((e) => e.kind === "income")
      .reduce((s, e) => s + e.amount, 0);

    const totalExpenses = entries
      .filter((e) => e.kind === "expense")
      .reduce((s, e) => s + e.amount, 0);

    const totalDebt = entries
      .filter((e) => e.kind === "debt" && !e.isSettled)
      .reduce((s, e) => s + e.amount, 0);

    const balance = totalIncome - totalExpenses;
    const weeklyTrend = buildTrend(entries, weekKey, 8);

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

    const dailyTrend = buildTrend(entries, (d) => d.slice(0, 10), 7);
    const monthlyTrend = buildTrend(entries, (d) => d.slice(0, 7), 6);

    return {
      totalIncome,
      totalExpenses,
      totalDebt,
      balance,
      categoryBreakdown,
      dailyTrend,
      weeklyTrend,
      monthlyTrend
    };
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
    makeDebtPayment,
    addCategory,
    updateCategory,
    deleteCategory,
    cards, addCard, updateCard, deleteCard, adjustCardBalance, transferBetweenCards,
    dataMode, loadDemoData, resetToBlank,
  };
}