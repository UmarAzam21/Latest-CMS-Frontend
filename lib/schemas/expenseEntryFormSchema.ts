// lib/schemas/expenseEntryFormSchema.ts
import { z } from "zod";

export const expenseEntryFormValuesSchema = z.object({
  kind: z.enum(["expense", "income", "debt"]),
  subject: z.string().min(2, "Subject is required"),
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Enter an amount greater than 0"),
  date: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  accountId: z.string().optional(),
});

export type ExpenseEntryFormValues = z.infer<typeof expenseEntryFormValuesSchema>;