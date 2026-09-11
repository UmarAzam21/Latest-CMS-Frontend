"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog"; // via shadcn's dialog primitive
import { ExpenseEntryFormValues, expenseEntryFormValuesSchema } from "@/lib/schemas/expenseEntryFormSchema";

interface NewExpenseDialogProps {
  onSaved?: (values: ExpenseEntryFormValues) => void;
}

export default function NewExpenseDialog({ onSaved }: NewExpenseDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseEntryFormValues>({
    resolver: zodResolver(expenseEntryFormValuesSchema),
    defaultValues: { kind: "expense" },
  });

  const onSubmit = async (values: ExpenseEntryFormValues) => {
    // Static-data phase: no real POST yet. Wire to
    // /api/expense-manager/entries once Umar's endpoint exists.
    onSaved?.(values);
    reset();
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-brand-8 bg-primary px-4 py-2.5 para-small font-semibold text-white default-transition hover:opacity-90"
        >
          <Plus size={15} />
          New Expense
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-card-bg-clr p-6 shadow-card-hover">
          <div className="mb-5 flex items-center justify-between border-b border-border-clr pb-4">
            <Dialog.Title className="heading-h4 text-text-dark">New Expense</Dialog.Title>
            <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 para-small text-text-secondary">
                <input type="radio" value="expense" {...register("kind")} defaultChecked />
                Expense
              </label>
              <label className="flex items-center gap-1.5 para-small text-text-secondary">
                <input type="radio" value="income" {...register("kind")} />
                Income
              </label>
            </div>

            <Field label="Subject" error={errors.subject?.message}>
              <input
                {...register("subject")}
                className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                placeholder="e.g. Electricity Bill"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" error={errors.category?.message}>
                <select
                  {...register("category")}
                  className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                  defaultValue=""
                >
                  <option value="" disabled>Select</option>
                  <option value="utilities">Utilities</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="rent">Rent</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Amount (PKR)" error={errors.amount?.message}>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                  placeholder="0.00"
                />
              </Field>
            </div>

            <Field label="Date" error={errors.date?.message}>
              <input
                type="date"
                {...register("date")}
                className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
              />
            </Field>

            <Field label="Description">
              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
              />
            </Field>

            <div className="mt-2 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-brand-8 border border-border-clr px-4 py-2 para-small font-semibold text-text-secondary default-transition hover:bg-page-bg"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-brand-8 bg-primary px-4 py-2 para-small font-semibold text-white default-transition hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="para-small font-medium text-text-secondary">{label}</label>
      {children}
      {error && <span className="para-tiny text-danger">{error}</span>}
    </div>
  );
}