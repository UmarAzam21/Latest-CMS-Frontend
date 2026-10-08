// dashboard\lib\schemas\partySchema.ts

import { PARTY_TYPES } from "@/types/expenseManagerTy";
import { z } from "zod";

export const partySchema = z.object({
    name: z.string().trim().min(2, "Naam likhein"),
    phone: z.string().trim().regex(/^(\+92|0)3\d{9}$/, "Sahi number likhein").or(z.literal("")).optional(),
    // type: z.enum(["customer", "supplier", "bank"]),
    type: z.enum(PARTY_TYPES),
});
export type PartyFormValues = z.infer<typeof partySchema>;