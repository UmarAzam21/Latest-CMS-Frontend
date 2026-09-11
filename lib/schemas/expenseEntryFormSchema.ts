// lib/schemas/expenseEntryFormSchema.ts
import { z } from "zod";

export const expenseEntryFormValuesSchema = z.object({
  kind: z.enum(["expense", "income"]),
  subject: z.string().min(2, "Subject is required"),
  category: z.enum(["utilities", "food", "transport", "rent", "business", "other"]),
  amount: z.number().positive("Enter an amount greater than 0"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
});

export type ExpenseEntryFormValues = z.infer<typeof expenseEntryFormValuesSchema>;