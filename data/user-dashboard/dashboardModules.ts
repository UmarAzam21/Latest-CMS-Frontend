// data/dashboardModules.ts
import { DashboardModule } from "../../types/user-dashboard";

export const dashboardModules: DashboardModule[] = [
    {
        id: "legal-consultancy",
        title: "Legal Cases & Consultancy",
        description: "Get expert legal help for tax disputes and compliance.",
        icon: "FileText",
        href: "/user/legal-consultancy",
        accentColor: "primary",
    },
    {
        id: "expense-manager",
        title: "Expense Manager",
        description: "Track income and expenses in one place.",
        icon: "Wallet",
        href: "/user/expense-manager",
        accentColor: "neutral",
    },
];