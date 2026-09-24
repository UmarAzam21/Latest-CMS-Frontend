// dashboard\data\user-dashboard\dummyBusinessKhata.ts

import { IStockItem, IBill, ICashEntry } from "@/types/businessKhataTy";

export const dummyStock: IStockItem[] = [
    {
        id: "s1",
        itemName: "Rice Bag 25kg",
        buyingRate: 3200,
        sellingRate: 3600,
        quantity: 40,
        unit: "box",
        supplierName: "Ahmed Traders",
        supplierContact: "0300-1234567",
        date: "2026-09-01"
    },
    {
        id: "s2",
        itemName: "Cooking Oil",
        buyingRate: 480,
        sellingRate: 560,
        quantity: 60,
        unit: "ltr",
        supplierName: "Malik Suppliers",
        supplierContact: "0321-9876543",
        date: "2026-09-05"
    },
];

export const dummyBills: IBill[] = [
    {
        id: "b1",
        customerName: "Bilal Store",
        customerContact: "0333-1112223",
        items: [
            {
                itemName: "Rice Bag 25kg",
                quantity: 2,
                rate: 3600
            }
        ],
        total: 7200,
        date: "2026-09-10"
    },
];

export const dummyCash: ICashEntry[] = [
    {
        id: "c1",
        direction: "in",
        amount: 7200,
        date: "2026-09-10",
        category: "customer",
        paymentMethod: "cash",
        note: "Bilal Store bill payment"
    },
    {
        id: "c2",
        direction: "out",
        amount: 25000,
        date: "2026-09-01",
        category: "salary",
        paymentMethod: "bank"
    },
];
