// dashboard\hooks\useExpenseManagerStore.tsx
"use client";

import { useState, useMemo, useCallback, useEffect, useContext, createContext, ReactNode } from "react";
import { IExpenseEntry, ICategory, SortField, SortDirection, ICard, IParty, PARTY_TYPES } from "@/types/expenseManagerTy";
import { defaultCategories } from "@/data/user-dashboard/defaultCategoriesData";
import { dummyExpenseEntries, dummyParties } from "@/data/user-dashboard/dummyExpenseEntries";
import { dummyCards } from "@/data/user-dashboard/dummyCards";
import { buildTrend, weekKey } from "@/lib/utils/trend";
import { toast } from "sonner";
import { cardDelta } from "@/lib/utils/cardDelta";
import { EntryKind, MAX_CARDS } from "@/types/expenseManagerTy"; // merge into your existing import
import { PartyFormValues } from "@/lib/schemas/partySchema";
import { debtBalances, debtTotals } from "@/lib/utils/debt";
import { makeSlug } from "@/lib/utils/party";


// Bump ONLY this one line when IExpenseEntry/ICategory/ICard fields are
// RENAMED or REMOVED. Adding a new OPTIONAL field does NOT require a bump —
// old stored JSON simply parses with that field undefined, which is valid.
const SCHEMA_VERSION = "v3";
const STORAGE_KEY_ENTRIES = `filernow_expense_entries_${SCHEMA_VERSION}`;
const STORAGE_KEY_CATEGORIES = `filernow_expense_categories_${SCHEMA_VERSION}`;
// const STORAGE_KEY_SEEDED = `filernow_expense_seeded_${SCHEMA_VERSION}`;
const STORAGE_KEY_CARDS = `filernow_expense_cards_${SCHEMA_VERSION}`;
const STORAGE_KEY_MODE = `filernow_khata_mode_${SCHEMA_VERSION}`; // "demo" | "blank"
const STORAGE_KEY_PARTIES = `filernow_expense_parties_${SCHEMA_VERSION}`;

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

// export function useExpenseManagerStore() {
function useExpenseManagerState() {
  const [entries, setEntries] = useState<IExpenseEntry[]>([]);
  const [categories, setCategories] = useState<ICategory[]>(defaultCategories);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [cards, setCards] = useState<ICard[]>([]);
  const [dataMode, setDataMode] = useState<"demo" | "blank">("blank");
  // parties state
  const [parties, setParties] = useState<IParty[]>([]);

  useEffect(() => {
    // "Seeded" is tracked independently of entries' emptiness, so that a
    // user who deletes every entry themselves stays at a real empty state
    // instead of getting re-seeded with dummy data on next load.
    const rawEntries = readLocalT<IExpenseEntry[]>(STORAGE_KEY_ENTRIES, []);
    setEntries(Array.isArray(rawEntries) && rawEntries.every(isValidEntry) ? rawEntries : []);

    // Cards seed unconditionally, not gated behind entries' seeded flag,
    // since it's an independent dataset with its own storage key.
    setCards(readLocalT<ICard[]>(STORAGE_KEY_CARDS, []));
    setParties(
      readLocalT<IParty[]>(STORAGE_KEY_PARTIES, []).map((p) => ({
        ...p,
        slug: p.slug ?? makeSlug(p.name),
        type: (PARTY_TYPES as readonly string[]).includes(p.type) ? p.type : "customer",
      }))
    );
    const rawCats = readLocalT<ICategory[]>(STORAGE_KEY_CATEGORIES, defaultCategories);
    setCategories(
      Array.isArray(rawCats) && rawCats.every((c) => typeof c.kind === "string") ? rawCats : defaultCategories
    );
    setDataMode(readLocalT(STORAGE_KEY_MODE, "blank") as "demo" | "blank");
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

  // persist effect for parties
  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(STORAGE_KEY_PARTIES, JSON.stringify(parties));
  }, [parties, hasLoaded]);

  // load demo data
  const loadDemoData = useCallback(() => {
    setEntries(dummyExpenseEntries);
    setCards(dummyCards);
    setParties(dummyParties);
    window.localStorage.setItem(STORAGE_KEY_MODE, "demo");
    setDataMode("demo");
    toast.success("Demo data load ho gaya");
  }, []);

  // reset to blank
  const resetToBlank = useCallback(() => {
    setEntries([]);
    setCards([]);
    setParties([]);
    window.localStorage.setItem(STORAGE_KEY_MODE, "blank");
    setDataMode("blank");
    toast.success("Khata saaf ho gaya. Naye sire se shuru karein");
  }, []);

  // ONE place that changes card balances + shows the separate balance toast.
  const applyCardDeltas = useCallback((deltas: Record<string, number>) => {
    const touched = Object.entries(deltas).filter(([, d]) => d !== 0);
    if (touched.length === 0) return;

    setCards((prev) =>
      prev.map((c) => (deltas[c.id] ? { ...c, balance: c.balance + deltas[c.id] } : c))
    );

    touched.forEach(([id, d]) => {
      const card = cards.find((c) => c.id === id);
      if (card) {
        toast.success(
          `${card.label}: ${d > 0 ? "+" : "-"}PKR ${Math.abs(d).toLocaleString("en-PK")} (naya balance PKR ${(card.balance + d).toLocaleString("en-PK")})`
        );
      }
    });
  }, [cards]);

  const addEntry = useCallback((entry: Omit<IExpenseEntry, "id">) => {
    const clean = entry.kind === "debt"
      ? { ...entry, cardId: undefined }
      : entry;

    setEntries((prev) => [
      {
        ...clean,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    toast.success(`${entry.subject} save ho gaya`);

    if (clean.cardId) {
      applyCardDeltas({ [clean.cardId]: cardDelta(clean) });
    }
  }, [applyCardDeltas]);

  const updateEntry = useCallback((id: string, patch: Partial<IExpenseEntry>) => {
    const old = entries.find((e) => e.id === id);
    if (!old) return;

    const updated = { ...old, ...patch };
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    toast.success(`${updated.subject} update ho gaya`);

    // Debt card effects are ledger-style (applied at creation + each payment),
    // never re-computed on edit. Income/expense are reconciled here.
    if (updated.kind !== "debt") {
      const deltas: Record<string, number> = {};

      if (old.cardId) {
        deltas[old.cardId] = (deltas[old.cardId] ?? 0) - cardDelta(old);
      }
      if (updated.cardId) {
        deltas[updated.cardId] = (deltas[updated.cardId] ?? 0) + cardDelta(updated);
      }

      applyCardDeltas(deltas);
    }
  }, [entries, applyCardDeltas]);

  const deleteEntry = useCallback((id: string) => {
    const target = entries.find((e) => e.id === id);
    if (!target) return;

    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success(`${target.subject} delete ho gaya`);

    if (target.cardId && target.kind !== "debt") {
      applyCardDeltas({ [target.cardId]: -cardDelta(target) });
    }
  }, [entries, applyCardDeltas]);

  // const makeDebtPayment = useCallback((id: string, paymentAmount: number) => {
  //   const target = entries.find((e) => e.id === id);
  //   if (!target || paymentAmount <= 0) return;

  //   const paid = Math.min(paymentAmount, target.amount);
  //   const remaining = target.amount - paid;

  //   setEntries((prev) =>
  //     prev.map((e) => (e.id === id ? { ...e, amount: remaining, isSettled: remaining === 0 } : e))
  //   );

  //   toast.success(
  //     remaining === 0
  //       ? `${target.subject} settle ho gaya`
  //       : `${target.subject}: PKR ${paid.toLocaleString("en-PK")} ada, baaki PKR ${remaining.toLocaleString("en-PK")}`
  //   );

  //   // lena = I owe -> paying reduces my card; dena = they owe me -> receiving increases it
  //   if (target.cardId && target.debtDirection) {
  //     applyCardDeltas({ [target.cardId]: target.debtDirection === "liya" ? -paid : paid });
  //   }
  // }, [entries, applyCardDeltas]);

  const addParty = useCallback((p: PartyFormValues): IParty => {
    const party: IParty = { ...p, id: crypto.randomUUID(), slug: makeSlug(p.name), createdAt: new Date().toISOString() };
    setParties((prev) => [party, ...prev]);
    toast.success(`${party.name} add ho gaya`);
    return party; // lets the entry dialog select it immediately
  }, []);

  const addParties = useCallback((list: PartyFormValues[]): number => {
    const now = new Date().toISOString();
    const created: IParty[] = list.map((p) => ({ ...p, id: crypto.randomUUID(), slug: makeSlug(p.name), createdAt: now }));
    setParties((prev) => [...created, ...prev]);
    toast.success(`${created.length} parties add ho gayin`);
    return created.length;
  }, []);

  const updateParty = useCallback((id: string, patch: Partial<IParty>) => {
    setParties((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const deleteParty = useCallback((id: string, withEntries = false): boolean => {
    const linked = entries.filter((e) => e.partyId === id);
    if (linked.length && !withEntries) {
      toast.error("Is party ki entries maujood hain, pehle woh delete karein");
      return false;
    }
    if (linked.length) {
      // undo card balance effects of linked income/expense entries (debt never touches cards)
      const deltas: Record<string, number> = {};
      linked.forEach((e) => {
        if (e.kind !== "debt" && e.cardId) deltas[e.cardId] = (deltas[e.cardId] ?? 0) - cardDelta(e);
      });
      applyCardDeltas(deltas);
      setEntries((prev) => prev.filter((e) => e.partyId !== id));
    }
    setParties((prev) => prev.filter((p) => p.id !== id));
    toast.success(linked.length ? `Party aur ${linked.length} entries delete ho gayin` : "Party delete ho gayi");
    return true;
  }, [entries, applyCardDeltas]);

  const addCategory = useCallback((label: string, color: ICategory["color"], kind: EntryKind) => {
    const clean = label.trim();

    if (categories.some((c) => c.kind === kind && c.label.toLowerCase() === clean.toLowerCase())) {
      toast.error(`"${clean}" pehle se maujood hai`);
      return;
    }

    setCategories((prev) => [...prev, { id: crypto.randomUUID(), label: clean, color, kind }]);
    toast.success(`${clean} category add ho gayi`);
  }, [categories]);

  const updateCategory = useCallback((id: string, patch: Partial<ICategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    const target = categories.find((c) => c.id === id);
    if (!target) return;

    if (target.kind === "debt") {
      toast.error("Udhaar categories delete nahi ho sakti");
      return;
    }

    const fallback = categories.find((c) => c.kind === target.kind && c.label === "Other" && c.id !== id);
    if (!fallback) {
      toast.error(`"Other" category delete nahi ho sakti`);
      return;
    }

    setEntries((prev) => prev.map((e) => (e.categoryId === id ? { ...e, categoryId: fallback.id } : e)));
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success(`${target.label} delete ho gayi (entries "Other" me chali gayin)`);
  }, [categories]);

  const addCard = useCallback((card: Omit<ICard, "id">) => {
    if (cards.length >= MAX_CARDS) {
      toast.error(`Sirf ${MAX_CARDS} cards add ho sakte hain`);
      return;
    }

    setCards((prev) => [...prev, { ...card, id: crypto.randomUUID() }]);
    toast.success(`${card.label} add ho gaya`);
  }, [cards.length]);

  const updateCard = useCallback((id: string, patch: Partial<ICard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    toast.success("Card update ho gaya");
  }, []);

  const deleteCard = useCallback((id: string) => {
    const target = cards.find((c) => c.id === id);

    setCards((prev) => prev.filter((c) => c.id !== id));
    setEntries((prev) => prev.map((e) => (e.cardId === id ? { ...e, cardId: undefined } : e)));

    if (target) {
      toast.success(`${target.label} delete ho gaya`);
    }
  }, [cards]);

  // new persist effect
  useEffect(() => {
    if (!hasLoaded) return;
    window.localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
  }, [cards, hasLoaded]);

  const adjustCardBalance = useCallback((id: string, delta: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, balance: c.balance + delta } : c))
    );
  }, []);

  const transferBetweenCards = useCallback((fromId: string, toId: string, amount: number) => {
    const from = cards.find((c) => c.id === fromId);
    const to = cards.find((c) => c.id === toId);

    if (!from || !to || fromId === toId || amount <= 0) {
      toast.error("Alag alag cards chunein");
      return;
    }

    if (from.balance < amount) {
      toast.error(`${from.label} me itna balance nahi hai`);
      return;
    }

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === fromId) {
          return { ...c, balance: c.balance - amount };
        }
        if (c.id === toId) {
          return { ...c, balance: c.balance + amount };
        }
        return c;
      })
    );

    toast.success(
      `PKR ${amount.toLocaleString("en-PK")} ${from.label} se ${to.label} me transfer hue`
    );
  }, [cards]);

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

  const stats = useMemo(() => {
    const totalIncome = entries
      .filter((e) => e.kind === "income")
      .reduce((s, e) => s + e.amount, 0);

    const totalExpenses = entries
      .filter((e) => e.kind === "expense")
      .reduce((s, e) => s + e.amount, 0);

    // const totalDebt = entries
    //   .filter((e) => e.kind === "debt" && !e.isSettled)
    //   .reduce((s, e) => s + e.amount, 0);

    const debtNet = debtBalances(entries);
    const { youWillGet, youWillGive } = debtTotals(debtNet);

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
      debtNet,
      youWillGet,
      youWillGive,
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
    hasLoaded, parties, addParty, addParties, updateParty, deleteParty,
    addCategory,
    updateCategory,
    deleteCategory,
    cards, addCard, updateCard, deleteCard, adjustCardBalance, transferBetweenCards,
    dataMode, loadDemoData, resetToBlank,
  };
}


type Store = ReturnType<typeof useExpenseManagerState>;
const StoreContext = createContext<Store | null>(null);

export function ExpenseManagerProvider({ children }: { children: ReactNode }) {
  const store = useExpenseManagerState(); // the ONLY place the state lives
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useExpenseManagerStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useExpenseManagerStore must be used inside <ExpenseManagerProvider>");
  return store;
}