"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoveLeft,
  X,
  Users,
  Wallet,
  Package,
  ReceiptText,
  UserRound,
  ChartNoAxesCombined,
  ArrowUpRight,
  Plus,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                BACKGROUNDS                                 */
/* -------------------------------------------------------------------------- */

const SKYLINE_BG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='420' height='110' viewBox='0 0 420 110'>
  <g fill='#C8102E' fill-opacity='0.055'>
    <rect x='0' y='55' width='26' height='55'/>
    <rect x='30' y='30' width='20' height='80'/>
    <rect x='54' y='68' width='34' height='42'/>
    <rect x='92' y='42' width='18' height='68'/>
    <rect x='114' y='58' width='28' height='52'/>
    <rect x='146' y='20' width='22' height='90'/>
    <rect x='172' y='64' width='30' height='46'/>
    <rect x='206' y='36' width='18' height='74'/>
    <rect x='228' y='60' width='26' height='50'/>
    <rect x='258' y='48' width='20' height='62'/>
    <rect x='282' y='70' width='32' height='40'/>
    <rect x='318' y='28' width='20' height='82'/>
    <rect x='342' y='58' width='26' height='52'/>
    <rect x='372' y='44' width='18' height='66'/>
    <rect x='394' y='66' width='26' height='44'/>
  </g>

  <g fill='#C8102E' fill-opacity='0.07'>
    <rect x='30' y='30' width='4' height='4'/>
    <rect x='38' y='40' width='4' height='4'/>
    <rect x='30' y='50' width='4' height='4'/>
    <rect x='150' y='30' width='4' height='4'/>
    <rect x='158' y='42' width='4' height='4'/>
    <rect x='150' y='54' width='4' height='4'/>
    <rect x='322' y='38' width='4' height='4'/>
    <rect x='330' y='50' width='4' height='4'/>
  </g>
</svg>
`)}`;

const DOT_GRID_BG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>
  <circle cx='2' cy='2' r='1.15' fill='#C8102E' fill-opacity='0.055'/>
</svg>
`)}`;

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
        className="
          relative
          h-[180px]
          w-full
          overflow-hidden
          rounded-2xl
          bg-[var(--brand-primary-lighter)]
          shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        "
      >
        {/* ---------------------------------------------------------------- */}
        {/* BACKGROUND                                                        */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${DOT_GRID_BG}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "24px 24px",
          }}
        />

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[85px] opacity-60"
          style={{
            backgroundImage: `url("${SKYLINE_BG}")`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "bottom",
            backgroundSize: "auto 85px",
          }}
        />

        {/* Soft light */}
        <div className="pointer-events-none absolute -left-20 -top-28 h-64 w-64 rounded-full bg-white/50 blur-3xl" />

        <div className="pointer-events-none absolute right-[28%] top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -right-20 h-64 w-64 rounded-full bg-[var(--brand-primary)]/10 blur-3xl" />

        {/* ---------------------------------------------------------------- */}
        {/* LEFT — DIGITAL KHATA MODULES                                      */}
        {/* ---------------------------------------------------------------- */}

       {/* ---------------------------------------------------------------- */}
{/* LEFT — DIGITAL KHATA MODULES                                      */}
{/* ---------------------------------------------------------------- */}

<div className="absolute inset-y-0 left-0 z-20 flex w-[29%] flex-col justify-center px-4 lg:px-5">
  {/* Heading */}
  <div className="mb-2.5 flex items-center gap-2">
    <span className="h-[2px] w-5 rounded-full bg-[var(--brand-primary)]" />
    <span className="text-[10px] font-extrabold uppercase tracking-[2px] text-[var(--brand-primary)]">
      Digital Khata
    </span>
  </div>

  {/* Modules */}
  <div className="grid grid-cols-2 gap-2">
    {MODULES.map(({ key, title, icon: Icon }) => (
      <button
        key={key}
        type="button"
        aria-label={`Add ${title}`}
        onClick={() => setActive(key)}
        className="
          group relative flex h-[46px] items-center gap-2 overflow-hidden
          rounded-xl border border-white bg-white px-2 text-left
          shadow-[0_4px_14px_rgba(200,16,46,0.09)]
          transition-all duration-200
          hover:-translate-y-0.5 hover:border-[var(--brand-primary)]/25
          hover:shadow-[0_10px_22px_rgba(200,16,46,0.18)]
          active:translate-y-0 active:scale-[0.98]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-[var(--brand-primary)]/40
        "
      >
        {/* Gradient icon tile */}
        <span
          className="
            flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]
            bg-primary 
            text-white 
            
          "
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>

        <span className="min-w-0 flex-1 truncate text-[11.5px] font-bold text-[var(--text-dark)]">
          {title}
        </span>

        {/* Plus button */}
        <span
          className="
            flex h-5 w-5 shrink-0 items-center justify-center rounded-full
            bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]
            transition-all duration-200
            group-hover:rotate-90 group-hover:bg-[var(--brand-primary)] group-hover:text-white
          "
        >
          <Plus className="h-3 w-3" strokeWidth={2.6} />
        </span>
      </button>
    ))}
  </div>
</div>

        {/* ---------------------------------------------------------------- */}
        {/* CENTER — PHONE MOCKUP                                             */}
        {/* ---------------------------------------------------------------- */}

        <div className="absolute inset-y-0 left-[28%] right-[28%] z-10 flex items-center justify-center">
          {/* Glow behind mockup */}
          <div className="pointer-events-none absolute h-[125px] w-[180px] rounded-full bg-[var(--brand-primary)]/10 blur-2xl" />

          <img
            src="/promo-ex.png"
            alt="Filernow Digital Khata"
            className="
              relative
              z-10
              max-h-[195px]
              max-w-[300px]
              object-contain
              drop-shadow-[0_15px_18px_rgba(0,0,0,0.16)]
            "
          />

          {/* Decorative floating cards */}
          <div className="pointer-events-none absolute left-[16%] top-[38%] flex h-7 w-7 rotate-[-12deg] items-center justify-center rounded-lg bg-white shadow-[0_6px_15px_rgba(0,0,0,0.08)]">
            <ReceiptText
              className="h-3.5 w-3.5 text-[var(--brand-primary)]"
              strokeWidth={1.8}
            />
          </div>

          <div className="pointer-events-none absolute right-[15%] top-[28%] flex h-7 w-7 rotate-[10deg] items-center justify-center rounded-lg bg-white shadow-[0_6px_15px_rgba(0,0,0,0.08)]">
            <Wallet
              className="h-3.5 w-3.5 text-[var(--brand-primary)]"
              strokeWidth={1.8}
            />
          </div>

          <div className="pointer-events-none absolute right-[12%] bottom-[25%] flex h-7 w-7 rotate-[-8deg] items-center justify-center rounded-lg bg-white shadow-[0_6px_15px_rgba(0,0,0,0.08)]">
            <Users
              className="h-3.5 w-3.5 text-[var(--brand-primary)]"
              strokeWidth={1.8}
            />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT — URDU CONTENT                                              */}
        {/* ---------------------------------------------------------------- */}

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
              اب Filernow کے ساتھ مزید آسانی
            </div>

            {/* Main copy */}
            <h2 className="text-[15px] font-bold leading-[1.65] tracking-[-0.2px] text-[var(--text-dark)]">
              اب صرف آپ کی ٹیکسیشن میں مدد نہیں کرے گا،
              <br />
              بلکہ اب آپ Filernow سے اپنا{" "}
              <span className="text-[var(--brand-primary)]">
                ڈیجیٹل کھاتا
              </span>{" "}
              بھی مینج کر سکتے ہیں۔
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
                shadow-[0_7px_20px_rgba(200,16,46,0.20)]
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
                <MoveLeft
                  className="h-3.5 w-3.5"
                  strokeWidth={2.5}
                />
              </span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* CENTER DIVIDER                                                    */}
        {/* ---------------------------------------------------------------- */}

        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[15] h-[115px] w-px -translate-x-1/2 -translate-y-1/2 bg-white/35" />

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