// dashboard\types\businessKhataTy.ts

export type StockUnit = "item" | "Pieces (pcs)" | "Gram (g)" | "Metre (m)" | "Bottle (btl)" | "Liters (ltr)" | "Kilogram (kg)" | "Box (box)";

export interface IStockItem {
    id: string;
    itemName: string;
    buyingRate: number;
    sellingRate: number;
    quantity: number;
    unit: StockUnit;
    supplierName: string;
    supplierContact: string;
    date: string;
}

export interface IBillItem {
    itemName: string;
    quantity: number;
    rate: number;
}

export interface IBill {
    id: string;
    customerName: string;
    customerContact: string;
    items: IBillItem[];
    total: number;
    date: string;
}

export type CashCategoryTy = "customer" | "salary" | "fees" | "rent" | "electricity" | "other";

export type PaymentMethodTy = "cash" | "bank" | "jazzcash" | "easypaisa";

export interface ICashEntry {
    id: string;
    direction: "in" | "out";
    amount: number;
    date: string;
    category: CashCategoryTy;
    note?: string;
    paymentMethod: PaymentMethodTy;
}
