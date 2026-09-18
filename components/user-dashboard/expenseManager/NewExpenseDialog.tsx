"use client";

import { useEffect, useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X, Upload, Trash2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ExpenseEntryFormValues,
  expenseEntryFormValuesSchema,
} from "@/lib/schemas/expenseEntryFormSchema";
import { ICard, ICategory, IExpenseEntry, IFinancialAccount } from "@/types/expenseManager";

interface NewExpenseDialogProps {
  categories?: ICategory[];
  cards?: ICard[];
  accounts?: IFinancialAccount[];
  onSaved: (values: ExpenseEntryFormValues & { receiptImage?: string; cardId?: string }) => void;
  editingEntry?: IExpenseEntry | null;
  onClose?: () => void;
}

export default function NewExpenseDialog({
  categories = [],
  cards = [],
  onSaved,
  editingEntry,
  onClose,
}: NewExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseEntryFormValues>({
    resolver: zodResolver(expenseEntryFormValuesSchema),
    defaultValues: {
      kind: "expense",
      accountId: "",
      isSettled: false,
    },
  });

  const kind = watch("kind");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (editingEntry) {
      reset({
        kind: editingEntry.kind,
        subject: editingEntry.subject,
        categoryId: editingEntry.categoryId,
        amount: editingEntry.amount,
        date: editingEntry.date.slice(0, 10),
        description: editingEntry.description,
        accountId: "",
        isSettled: Boolean(editingEntry.isSettled),
      });
      setImagePreview(editingEntry.receiptImage ?? null);
      setOpen(true);
      setCardId(editingEntry.cardId ?? "");
    }
  }, [editingEntry, reset]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      reset({
        kind: "expense",
        subject: "",
        categoryId: "",
        amount: 0,
        date: "",
        description: "",
        accountId: "",
        isSettled: false,
      });
      setImagePreview(null);
      setCardId("");
      onClose?.();
    }
  };

  const onSubmit = async (values: ExpenseEntryFormValues) => {
    onSaved({ ...values, receiptImage: imagePreview ?? undefined, cardId: cardId || undefined });
    handleOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-brand-8 bg-primary px-3 py-2 para-small font-semibold text-white default-transition hover:opacity-90"
        >
          <Plus size={15} />
          New Entry
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modal bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-modal w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-brand-16 bg-card-bg-clr p-6 shadow-card-hover">
          <div className="mb-5 flex items-center justify-between border-b border-border-clr pb-4">
            <Dialog.Title className="heading-h4 text-text-dark">New Entry</Dialog.Title>
            <Dialog.Close className="text-text-secondary-muter hover:text-text-secondary">
              <X size={18} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <RadioOption label="Expense" value="expense" register={register} />
                <RadioOption label="Income" value="income" register={register} />
                <RadioOption label="Debt" value="debt" register={register} />
              </div>

              <Field label="Subject" error={errors.subject?.message}>
                <input
                  {...register("subject")}
                  className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                  placeholder={kind === "debt" ? "e.g. Car Loan" : "e.g. Electricity Bill"}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category" error={errors.categoryId?.message}>
                  <select
                    {...register("categoryId")}
                    className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                    defaultValue=""
                  >
                    <option value="" disabled>Select</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
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

              {kind === "debt" && (
                <label className="flex items-center gap-2 para-small text-text-secondary">
                  <input type="checkbox" {...register("isSettled")} />
                  Mark as settled
                </label>
              )}

              {kind !== "debt" && (
                <Field label="Pay From Card (optional)">
                  <select
                    value={cardId}
                    onChange={(e) => setCardId(e.target.value)}
                    className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                  >
                    <option value="">No card — record only</option>
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>{c.label} — PKR {c.balance.toLocaleString("en-PK")}</option>
                    ))}
                  </select>
                </Field>
              )}

              <Field label="Description">
                <textarea
                  {...register("description")}
                  rows={2}
                  className="w-full rounded-brand-8 border border-border-clr px-3 py-2 para-small outline-none focus:border-primary"
                />
              </Field>
            </div>

            <div className="flex flex-col gap-2">
              <label className="para-small font-medium text-text-secondary">Receipt / Document</label>
              {imagePreview ? (
                <div className="relative h-56 overflow-hidden rounded-brand-12 border border-border-clr">
                  <img src={imagePreview} alt="Receipt preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-brand-12 border border-dashed border-border-clr-dark text-text-secondary-muter default-transition hover:border-primary hover:text-primary">
                  <Upload size={22} />
                  <span className="para-small">Upload an image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            <div className="col-span-full mt-2 flex justify-end gap-3 border-t border-border-clr pt-4">
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

function RadioOption({
  label,
  value,
  register,
}: {
  label: string;
  value: string;
  register: UseFormRegister<ExpenseEntryFormValues>;
}) {
  return (
    <label className="flex items-center gap-1.5 para-small text-text-secondary">
      <input type="radio" value={value} {...register("kind")} defaultChecked={value === "expense"} />
      {label}
    </label>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="para-small font-medium text-text-secondary">{label}</label>
      {children}
      {error && <span className="para-tiny text-danger">{error}</span>}
    </div>
  );
}