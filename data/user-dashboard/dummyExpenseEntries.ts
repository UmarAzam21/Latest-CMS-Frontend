// /data/user-dashboard/dummyExpenseEntries.ts
import { IExpenseEntry } from "@/types/expenseManagerTy";

// Dummy seed data, gives a first-time user a fully populated dashboard to
// explore before they add real entries. Fully deletable via existing CRUD
// (deleteEntry) once the user starts entering their own data. Backend
// contract pending: this seed logic disappears once GET /api/expense-manager/entries
// returns real user data, the store should stop seeding once that exists.
export const dummyExpenseEntries: IExpenseEntry[] = [
    // Expenses, spread across last 6 months, several in the last 7 days
    { id: "e1", kind: "expense", subject: "Electricity Bill", categoryId: "cat-utilities", amount: 8500, date: "2026-09-10" },
    { id: "e2", kind: "expense", subject: "Grocery Run", categoryId: "cat-food", amount: 12300, date: "2026-09-08" },
    { id: "e3", kind: "expense", subject: "Fuel", categoryId: "cat-transport", amount: 6200, date: "2026-09-06" },
    { id: "e4", kind: "expense", subject: "Internet Bill", categoryId: "cat-utilities", amount: 4200, date: "2026-09-05" },
    { id: "e5", kind: "expense", subject: "Grocery Run", categoryId: "cat-food", amount: 9800, date: "2026-09-04" },
    { id: "e6", kind: "expense", subject: "Office Rent Share", categoryId: "cat-rent", amount: 35000, date: "2026-08-15" },
    { id: "e7", kind: "expense", subject: "Business Software Subscription", categoryId: "cat-business", amount: 15000, date: "2026-08-05" },
    { id: "e8", kind: "expense", subject: "Clinic Visit", categoryId: "cat-other", amount: 3000, date: "2026-07-18" },
    { id: "e9", kind: "expense", subject: "Car Maintenance", categoryId: "cat-transport", amount: 9800, date: "2026-06-22" },
    { id: "e10", kind: "expense", subject: "Grocery Run", categoryId: "cat-food", amount: 11000, date: "2026-05-14" },
    { id: "e11", kind: "expense", subject: "Office Rent Share", categoryId: "cat-rent", amount: 35000, date: "2026-04-15" },

    // Income
    { id: "i1", kind: "income", subject: "Freelance Payment", categoryId: "cat-business", amount: 65000, date: "2026-09-05" },
    { id: "i2", kind: "income", subject: "Monthly Salary", categoryId: "cat-business", amount: 120000, date: "2026-08-01" },
    { id: "i3", kind: "income", subject: "Consulting Fee", categoryId: "cat-business", amount: 45000, date: "2026-07-10" },

    // Debt
    { id: "d1", kind: "debt", subject: "Car Loan Installment", categoryId: "cat-other", amount: 25000, date: "2026-09-01", isSettled: false },
    { id: "d2", kind: "debt", subject: "Credit Card Balance", categoryId: "cat-other", amount: 18000, date: "2026-08-20", isSettled: false },
    { id: "d3", kind: "debt", subject: "Personal Loan (Friend)", categoryId: "cat-other", amount: 10000, date: "2026-07-05", isSettled: true },
];