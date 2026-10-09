// dashboard\lib\schemas\partySchema.ts

import { z } from "zod";
import { PARTY_TYPES } from "@/types/expenseManagerTy";

export const partySchema = z.object({
    name: z.string().trim().min(2, "Party ka naam likhein (kam az kam 2 huroof)"),
    phone: z.string().trim().regex(/^(\+92|0)3\d{9}$/, "Number is tarah likhein: 03001234567").or(z.literal("")).optional(),
    type: z.enum(PARTY_TYPES),
});
export type PartyFormValues = z.infer<typeof partySchema>;