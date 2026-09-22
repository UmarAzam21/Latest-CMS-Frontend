import { z } from "zod";
export const detailedEntrySchema = z.object({
    subject: z.string().min(2, "Zaroori hai"),
    categoryId: z.string().min(1, "Category chunein"),
    amount: z.number().positive("Sahi amount likhein"),
    date: z.string().min(1),
    description: z.string().optional(),
    cardId: z.string().optional(),
    isSettled: z.boolean().optional(),
});
export type DetailedEntryValues = z.infer<typeof detailedEntrySchema>;