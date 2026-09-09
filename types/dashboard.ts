// types/dashboard.ts

export type FormStatus = "not_started" | "draft" | "assigned" | "fulfilled";

export interface DashboardModule {
    id: string;                 // e.g. "expense-manager", "legal-consultancy"
    title: string;
    description: string;
    icon: keyof typeof import("lucide-react"); // constrains to valid icon names
    href: string;                // route to the module's form/detail page
    accentColor: "primary" | "neutral"; // maps to your design tokens, not raw hex
}

export interface ServiceQueryForm {
    id: string;
    moduleId: DashboardModule["id"];
    userId: string;
    status: FormStatus;
    completionPercent: number;   // 0–100, server-computed — see note below
    assignedAgentId: string | null;
    lastUpdatedAt: string;       // ISO string from backend
    // fieldsSnapshot is intentionally NOT typed here — it's module-specific
    // and lives in a discriminated union per module if you need type safety
    // on the actual form fields (NTN form fields != GST form fields).
}

export interface DashboardStats {
    activeServices: number;
    pendingQueries: number;
}