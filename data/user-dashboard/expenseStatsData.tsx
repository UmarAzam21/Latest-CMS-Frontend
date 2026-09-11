import { IExpenseStatItem } from "@/types/expenseManager";
import { Wallet, Banknote, PlusCircle, ShoppingBag } from "lucide-react";

export const expenseStatsData: IExpenseStatItem[] = [
  {
    id: "total budget",
    title: "Total budget",
    value: "$21,563.00",
    trendDirection: "up",
    trendPercent: 16,
    trendLabel: "Increase since last month.",
    icon: Wallet,
    chip: "green",
  },
  {
    id: "monthly-income",
    title: "Monthly Income",
    value: "$529",
    trendDirection: "down",
    trendPercent: 2,
    trendLabel: "Decrease since last month.",
    icon: Banknote,
    chip: "blue",
  },
  {
    id: "monthly-expenses",
    title: "Monthly Expenses",
    value: "$1,536",
    trendDirection: "up",
    trendPercent: 23,
    trendLabel: "Increase since last month.",
    icon: PlusCircle,
    chip: "purple",
  },
  {
    id: "any-debt",
    title: "Any Debt",
    value: "$6,432",
    trendDirection: "down",
    trendPercent: 4,
    trendLabel: "Decrease since last month.",
    icon: ShoppingBag,
    chip: "red",
  },
];