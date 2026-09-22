import { z } from "zod";

// Deliberately smaller than expenseEntryFormValuesSchema — no receipt,
// no card selector, no radio choice (kind is fixed by which dialog opened).
export const quickEntrySchema = z.object({
    subject: z.string().min(1, "Zaroori hai"),
    amount: z.number().positive("Sahi amount likhein"),
    date: z.string().min(1),
    categoryId: z.string().optional(),
    note: z.string().optional(),
});
export type QuickEntryValues = z.infer<typeof quickEntrySchema>;