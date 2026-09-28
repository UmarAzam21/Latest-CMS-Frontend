"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MoveLeft,
  TrendingUp,
  TrendingDown,
  HandCoins,
  Briefcase,
  Pencil,
  X,
} from "lucide-react";

const SKYLINE_BG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='420' height='110' viewBox='0 0 420 110'>
  <g fill='#C8102E' fill-opacity='0.07'>
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
  <g fill='#C8102E' fill-opacity='0.10'>
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
  <circle cx='2' cy='2' r='1.2' fill='#C8102E' fill-opacity='0.06'/>
</svg>
`)}`;

type ModuleKey = "aamdani" | "kharcha" | "udhaar" | "business";

/* ------------------------------------------------------------------
   ADAPTER: connect this to your real stores.
   Return totals + an add function per module.
------------------------------------------------------------------ */
function useKhataActions() {
  // const { entries, addEntry } = useExpenseManagerStore();
  // const { addCashEntry, cashBalance } = useBusinessKhataStore();

  // Example: derive totals from your entries
  // const total = (kind: string) =>
  //   entries.filter((e) => e.kind === kind).reduce((s, e) => s + e.amount, 0);

  const totals: Record<ModuleKey, number> = {
    aamdani: 0, // total("income")
    kharcha: 0, // total("expense")
    udhaar: 0, // total("debt")
    business: 0, // cashBalance
  };

  const add = (key: ModuleKey, amount: number, note: string) => {
    // aamdani  -> addEntry({ kind: "income",  amount, note })
    // kharcha  -> addEntry({ kind: "expense", amount, note })
    // udhaar   -> addEntry({ kind: "debt",    amount, note })
    // business -> addCashEntry({ amount, note })
  };

  return { totals, add };
}

const MODULES: {
  key: ModuleKey;
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  { key: "aamdani", title: "Add Aamdani", icon: TrendingUp },
  { key: "kharcha", title: "Add Kharcha", icon: TrendingDown },
  { key: "udhaar", title: "Add Udhaar", icon: HandCoins },
  { key: "business", title: "Business Khata", icon: Briefcase },
];

const fmt = (n: number) => `Rs ${n.toLocaleString("en-PK")}`;

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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-[var(--text-dark)]">{title}</h3>
          <button onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          autoFocus
          type="number"
          inputMode="decimal"
          min={0}
          placeholder="Amount (Rs)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mb-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)]"
        />
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--brand-primary)]"
        />

        <button
          disabled={!valid}
          onClick={() => {
            onSave(value, note.trim());
            onClose();
          }}
          className="w-full rounded-xl bg-[var(--brand-primary)] py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>,
    document.body
  );
}

function PromoBanner() {
  const { totals, add } = useKhataActions();
  const [active, setActive] = useState<ModuleKey | null>(null);
  const activeModule = useMemo(
    () => MODULES.find((m) => m.key === active),
    [active]
  );

  return (
    <section className="relative w-full">
      {/* Main banner */}
      <div className="relative h-[180px] w-full overflow-hidden rounded-2xl bg-[var(--brand-primary-lighter)]">
        {/* ================= DECORATIVE BACKGROUND ================= */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${DOT_GRID_BG}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[90px] opacity-50"
          style={{
            backgroundImage: `url("${SKYLINE_BG}")`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "bottom",
            backgroundSize: "auto 90px",
          }}
        />
        <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 -bottom-24 h-56 w-56 rounded-full bg-[var(--brand-primary)]/10 blur-3xl" />

        {/* ================= LEFT : KHATA BUTTONS ================= */}
        <div className="absolute inset-y-0 left-0 z-10 flex w-[30%] flex-col justify-center px-3 lg:px-4">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-[2px] w-5 rounded-full bg-[var(--brand-primary)]" />
            <span className="text-[9px] font-bold uppercase tracking-[2.2px] text-[var(--text-dark)]">
              Digital Khata
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MODULES.map(({ key, title, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                aria-label={`${title} - edit amount`}
                className="group relative flex h-[54px] items-center gap-2 rounded-xl border border-white/70 bg-white/90 px-2 text-left backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                {/* Edit pencil badge */}
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center text-[var(--brand-primary)] transition-colors duration-200">
                  <Pencil className="h-2.5 w-2.5" strokeWidth={2.2} />
                </span>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white ">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </div>

                <div className="min-w-0 pr-3">
                  <p className="truncate text-[10px] font-semibold leading-[1.8] text-[var(--text-dark)]">
                    {title}
                  </p>
                  <p className="truncate text-[12px] font-bold leading-tight text-[var(--brand-primary)]">
                    {fmt(totals[key])}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ================= CENTER : MOCKUP ================= */}
        <div className="flex h-full items-center justify-center">
          <img
            src="/promo-ex.png"
            alt="Promo"
            className="max-h-[200px] max-w-[300px] object-contain"
          />
        </div>

        {/* ================= RIGHT : CONTENT ================= */}
        <div className="absolute inset-y-0 right-0 z-10 flex w-[32%] items-center justify-center px-5 lg:px-7">
          <div
            dir="rtl"
            className="flex w-full max-w-[310px] flex-col items-start text-right"
            style={{ fontFamily: "var(--font-noto-nastaliq-urdu), serif" }}
          >
            <div className="mb-1.5 text-[14px] font-bold tracking-wide text-[var(--brand-primary)]">
              اب Filernow کے ساتھ مزید آسانی
            </div>

            <h2 className="text-[15px] font-bold leading-[1.6] tracking-[-0.2px] text-[var(--text-dark)]">
              اب صرف آپ کی ٹیکسیشن میں مدد نہیں کرے گا،
              <br />
              بلکہ اب آپ Filernow سے اپنا{" "}
              <span className="text-[var(--brand-primary)]">ڈیجیٹل کھاتا</span>{" "}
              بھی مینج کر سکتے ہیں۔
            </h2>

            <button
              dir="rtl"
              className="group mt-3 flex items-center gap-2 rounded-full bg-[var(--brand-primary)] py-1.5 ps-4 pe-1.5 text-[11px] font-bold text-white shadow-[0_6px_18px_rgba(200,16,46,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_9px_22px_rgba(200,16,46,0.28)]"
            >
              <span className="text-[12px] leading-none">آج ہی شروع کریں</span>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-primary)] transition-transform duration-200 group-hover:-translate-x-1">
                <MoveLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>

        {/* ================= CENTER DIVIDER GLOW ================= */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[15] h-[125px] w-px -translate-x-1/2 -translate-y-1/2 bg-white/30" />
      </div>

      {/* ================= ADD AMOUNT MODAL ================= */}
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