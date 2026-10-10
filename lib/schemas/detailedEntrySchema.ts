// dashboard\lib\schemas\detailedEntrySchema.ts

import { EntryKind } from "@/types/expenseManagerTy";
import { z } from "zod";

const base = z.object({
    subject: z.string().optional(),
    partyId: z.string().optional(),
    categoryId: z.string().min(1, "Category chunein"),
    amount: z.number({ message: "Sahi amount likhein" }).positive("Sahi amount likhein"),
    date: z.string().min(1),
    time: z.string().optional(),
    description: z.string().optional(),
    cardId: z.string().optional(),
});
export type DetailedEntryValues = z.infer<typeof base>;

// Debt requires a party (subject is derived from it); other kinds require a subject.
export const makeEntrySchema = (kind: EntryKind | null) =>
    base.superRefine((v, ctx) => {
        if (kind === "debt") {
            if (!v.partyId) ctx.addIssue({ code: "custom", path: ["partyId"], message: "Party chunein" });
        } else if ((v.subject?.trim().length ?? 0) < 2) {
            ctx.addIssue({ code: "custom", path: ["subject"], message: "Zaroori hai" });
        }
    });