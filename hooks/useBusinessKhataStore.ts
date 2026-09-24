// dashboard\hooks\useBusinessKhataStore.ts

"use client";
import { useState, useEffect, useCallback } from "react";
import { IStockItem, IBill, ICashEntry } from "@/types/businessKhataTy";
import { dummyStock, dummyBills, dummyCash } from "@/data/user-dashboard/dummyBusinessKhata";

const SCHEMA_VERSION = "v1";
const K_STOCK = `filernow_bk_stock_${SCHEMA_VERSION}`;
const K_BILLS = `filernow_bk_bills_${SCHEMA_VERSION}`;
const K_CASH = `filernow_bk_cash_${SCHEMA_VERSION}`;
const K_SEEDED = `filernow_bk_seeded_${SCHEMA_VERSION}`;

function readLocal<T>(key: string, fb: T): T {
    if (typeof window === "undefined") return fb;
    try {
        const r = localStorage.getItem(key);
        return r ? JSON.parse(r) : fb;
    } catch {
        return fb;
    }
}

export function useBusinessKhataStore() {
    const [stock, setStock] = useState<IStockItem[]>([]);
    const [bills, setBills] = useState<IBill[]>([]);
    const [cash, setCash] = useState<ICashEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const seeded = localStorage.getItem(K_SEEDED) === "true";
        if (seeded) {
            setStock(readLocal(K_STOCK, []));
            setBills(readLocal(K_BILLS, []));
            setCash(readLocal(K_CASH, []));
        } else {
            setStock(dummyStock);
            setBills(dummyBills);
            setCash(dummyCash);
            localStorage.setItem(K_SEEDED, "true");
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) localStorage.setItem(K_STOCK, JSON.stringify(stock));
    }, [stock, loaded]);

    useEffect(() => {
        if (loaded) localStorage.setItem(K_BILLS, JSON.stringify(bills));
    }, [bills, loaded]);

    useEffect(() => {
        if (loaded) localStorage.setItem(K_CASH, JSON.stringify(cash));
    }, [cash, loaded]);

    const addStock = useCallback((item: Omit<IStockItem, "id">) => {
        setStock((p) => [{ ...item, id: crypto.randomUUID() }, ...p]);
    }, []);

    const deleteStock = useCallback((id: string) => {
        setStock((p) => p.filter((s) => s.id !== id));
    }, []);

    const addBill = useCallback((bill: Omit<IBill, "id">) => {
        setBills((p) => [{ ...bill, id: crypto.randomUUID() }, ...p]);
    }, []);

    const deleteBill = useCallback((id: string) => {
        setBills((p) => p.filter((b) => b.id !== id));
    }, []);

    const addCash = useCallback((entry: Omit<ICashEntry, "id">) => {
        setCash((p) => [{ ...entry, id: crypto.randomUUID() }, ...p]);
    }, []);

    const deleteCash = useCallback((id: string) => {
        setCash((p) => p.filter((c) => c.id !== id));
    }, []);

    return {
        stock,
        bills,
        cash,
        addStock,
        deleteStock,
        addBill,
        deleteBill,
        addCash,
        deleteCash
    };
}
