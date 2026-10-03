"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoveLeft,
  X,
  Users,
  Wallet,
  Package,
  ChartNoAxesCombined,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                  TYPES                                     */
/* -------------------------------------------------------------------------- */


type ModuleKey =
  | "party"
  | "cash"
  | "stock"
  | "bills"
  | "staff"
  | "expense";

/* -------------------------------------------------------------------------- */
/*                              MODULE CONFIG                                 */
/* -------------------------------------------------------------------------- */

const MODULES = [
  {
    key: "party" as ModuleKey,
    title: "Party",
    icon: Users,
  },
  {
    key: "cash" as ModuleKey,
    title: "Cash",
    icon: Wallet,
  },
  {
    key: "stock" as ModuleKey,
    title: "Stock",
    icon: Package,
  },
  {
    key: "expense" as ModuleKey,
    title: "Expense",
    icon: ChartNoAxesCombined,
  },
];

/* -------------------------------------------------------------------------- */
/*                              KHATA ACTIONS                                 */
/* -------------------------------------------------------------------------- */

function useKhataActions() {
  const add = (key: ModuleKey, amount: number, note: string) => {
    /*
      Connect your real stores here.

      Example:

      party   -> addParty(...)
      cash    -> addCashEntry(...)
      stock   -> addStockEntry(...)
      bills   -> addBill(...)
      staff   -> addStaffExpense(...)
      expense -> addExpense(...)
    */

    console.log("Digital Khata entry:", {
      module: key,
      amount,
      note,
    });
  };

  return { add };
}

/* -------------------------------------------------------------------------- */
/*                             FORMAT CURRENCY                                */
/* -------------------------------------------------------------------------- */

const fmt = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

/* -------------------------------------------------------------------------- */
/*                              ADD AMOUNT MODAL                              */
/* -------------------------------------------------------------------------- */

function AddAmountModal({
  title,
  onClose,
  onSave,
}: {
  title: string;
  onClose: () => void;
  onSave: (amount: number, note: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [mounted, setMounted] = useState(false);

  const value = Number(amount);
  const valid = value > 0;

  useEffect(() => {
    setMounted(true);

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--brand-primary)]">
              Digital Khata
            </p>

            <h3 className="mt-0.5 text-base font-bold text-[var(--text-dark)]">
              Add {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <label className="mb-1.5 block text-[11px] font-semibold text-gray-600">
            Amount
          </label>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
              Rs
            </span>

            <input
              autoFocus
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10"
            />
          </div>

          <label className="mb-1.5 mt-4 block text-[11px] font-semibold text-gray-600">
            Note
            <span className="ml-1 font-normal text-gray-400">
              (optional)
            </span>
          </label>

          <input
            type="text"
            placeholder="Add a short note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10"
          />

          {/* Save */}
          <button
            type="button"
            disabled={!valid}
            onClick={() => {
              onSave(value, note.trim());
              onClose();
            }}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-2.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(200,16,46,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_9px_22px_rgba(200,16,46,0.25)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            Save Entry
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/*                              PROMO BANNER                                  */
/* -------------------------------------------------------------------------- */

function PromoBanner() {
  const { add } = useKhataActions();

  const [active, setActive] = useState<ModuleKey | null>(null);

  const activeModule = useMemo(
    () => MODULES.find((module) => module.key === active),
    [active]
  );

  return (
    <section className="relative w-full">
      {/* ------------------------------------------------------------------ */}
      {/* MAIN BANNER                                                         */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="relative h-[180px] w-full overflow-hidden rounded-2xl border border-slate-200"
      >
        {/* ---------------------------------------------------------------- */}
        {/* BACKGROUND                                                        */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/FilernowBanner 3-03.png")',
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[85px] opacity-60" />

        {/* Soft light */}
        <div className="pointer-events-none absolute -left-20 -top-28 h-64 w-64 rounded-full bg-white/50 blur-3xl" />

        <div className="pointer-events-none absolute right-[28%] top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-[var(--brand-primary)]/10 blur-3xl" />

        <div className="absolute inset-0">
            {/* ------------------------------------------------------------ */}
            {/* LEFT — DIGITAL KHATA MODULES                                  */}
            {/* ------------------------------------------------------------ */}

            <div className="absolute inset-y-0 left-0 z-20 flex w-[29%] flex-col justify-center px-4 lg:px-5">
              {/* Heading */}
              <div className="mb-2.5 flex items-center gap-2">
                <span className="h-[2px] w-5 rounded-full bg-[var(--brand-primary)]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-[var(--brand-primary)]">
                  Digital Khata
                </span>
              </div>

              {/* Modules */}
              <div className="grid grid-cols-2 gap-1.5">
                {MODULES.map(({ key, title, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    aria-label={`Add ${title}`}
                    onClick={() => setActive(key)}
                    className="
                      group relative flex h-[46px] min-w-0 items-center gap-1 overflow-hidden
                      border border-slate-200
                      rounded-xl border border-slate-100 bg-white/95 pr-1.5 text-left
                      
                      transition-all duration-200
                      hover:-translate-y-0.5 hover:border-[var(--brand-primary)]/20
                      hover:shadow-[0_8px_18px_rgba(200,16,46,0.14)]
                      active:translate-y-0 active:scale-[0.98]
                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-[var(--brand-primary)]/40
                    "
                  >
                    {/* Icon tile */}
                    <span
                      className="
                        flex h-full w-[38px] shrink-0 items-center justify-center
                        rounded-l-xl rounded-r-[20px] bg-primary
                        text-white
                      "
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>

                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-[var(--text-dark)]">
                      {title}
                    </span>

                    {/* Arrow indicator */}
                    <span
                      className="
                        flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full
                        bg-rose-50 text-[var(--brand-primary)]
                        transition-colors duration-200
                        group-hover:bg-[var(--brand-primary)] group-hover:text-white
                      "
                    >
                      <ArrowRight className="h-3 w-3" strokeWidth={2} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* CENTER — PHONE MOCKUP                                         */}
            {/* ------------------------------------------------------------ */}

            <div className="absolute inset-y-0 left-[28%] right-[28%] z-10 flex items-center justify-center">
              {/* Glow behind mockup */}
              <div className="pointer-events-none absolute h-[125px] w-[180px] rounded-full bg-[var(--brand-primary)]/10 blur-2xl" />

              <img
                src="/MobileOverViewMockup.png"
                alt="Filernow Digital Khata"
                className="
                  relative
                  z-10
                  max-h-[230px]
                  max-w-[230px]
                  object-contain
                "
              />
            </div>

            {/* ------------------------------------------------------------ */}
            {/* RIGHT — URDU CONTENT                                          */}
            {/* ------------------------------------------------------------ */}

            <div className="absolute inset-y-0 right-0 z-20 flex w-[32%] items-center justify-center px-5 lg:px-7">
             <div
  dir="rtl"
  className="flex w-full max-w-[315px] flex-col items-start text-right"
  style={{
    fontFamily: "var(--font-noto-nastaliq-urdu), serif",
  }}
>
  {/* Eyebrow */}
  <div className="mb-1 text-[13px] font-bold tracking-wide text-[var(--brand-primary)]">
    کاروبار کا حساب، اب اور بھی آسان
  </div>

  {/* Main copy */}
  <h2 className="text-[15px] font-bold leading-[1.65] tracking-[-0.2px] text-[var(--text-dark)]">
    اب کاروبار کے حساب کتاب کی جھنجھٹ سے جان چھڑائیں،
    <br />
    خرچ اور آمدنی کا ریکارڈ رکھیں اور اپنا{" "}
    <span className="text-primary font-semibold">
      Digital Khata{" "}
    </span>{" "}
    آسانی سے مینج کریں۔
  </h2>

  {/* CTA */}
  <button
    type="button"
    dir="rtl"
    className="
      group
      mt-2.5
      flex
      items-center
      gap-2
      rounded-full
      bg-[var(--brand-primary)]
      py-1.5
      ps-4
      pe-1.5
      text-[11px]
      font-bold
      text-white
      transition-all
      duration-200
      hover:-translate-y-0.5
      hover:shadow-[0_10px_24px_rgba(200,16,46,0.28)]
      active:translate-y-0
    "
  >
    <span className="text-[12px] leading-none">
      آج ہی شروع کریں
    </span>

    <span
      className="
        flex
        h-6
        w-6
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-white
        text-[var(--brand-primary)]
        transition-transform
        duration-200
        group-hover:-translate-x-1
      "
    >
      <MoveLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
    </span>
  </button>
</div>
            </div>
        </div>

        {/* Subtle top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-white/70" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ADD AMOUNT MODAL                                                    */}
      {/* ------------------------------------------------------------------ */}

      {active && activeModule && (
        <AddAmountModal
          title={activeModule.title}
          onClose={() => setActive(null)}
          onSave={(amount, note) => add(active, amount, note)}
        />
      )}
    </section>
  );
}

export default PromoBanner;