"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Calculator, Delete, Check } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                                  LOGIC                                     */
/* -------------------------------------------------------------------------- */

type Op = "+" | "−" | "×" | "÷";
type S = {
  display: string;
  acc: number | null;
  op: Op | null;
  fresh: boolean;
  expr: string;
};

const INIT: S = { display: "0", acc: null, op: null, fresh: true, expr: "" };
const OPS: string[] = ["+", "−", "×", "÷"];

const calc = (a: number, b: number, o: Op) => {
  const r = o === "+" ? a + b : o === "−" ? a - b : o === "×" ? a * b : b === 0 ? NaN : a / b;
  return Number(r.toFixed(8));
};

function reducer(prev: S, key: string): S {
  const s = prev.display === "Error" ? INIT : prev;

  if (/^\d$/.test(key)) {
    if (s.fresh) return { ...s, display: key, fresh: false };
    if (s.display.replace(/[-.]/g, "").length >= 12) return s;
    return { ...s, display: s.display === "0" ? key : s.display + key };
  }

  if (key === ".") {
    if (s.fresh) return { ...s, display: "0.", fresh: false };
    return s.display.includes(".") ? s : { ...s, display: s.display + "." };
  }

  if (key === "C") return INIT;

  if (key === "⌫") {
    if (s.fresh) return s;
    const short = s.display.length === 1 || (s.display.length === 2 && s.display.startsWith("-"));
    return { ...s, display: short ? "0" : s.display.slice(0, -1) };
  }

  if (key === "±") {
    if (s.display === "0") return s;
    return { ...s, display: s.display.startsWith("-") ? s.display.slice(1) : "-" + s.display };
  }

  if (key === "%") {
    return { ...s, display: String(Number((Number(s.display) / 100).toFixed(8))), fresh: true };
  }

  if (key === "=") {
    if (s.acc === null || !s.op) return s;
    const cur = Number(s.display);
    const r = calc(s.acc, cur, s.op);
    if (Number.isNaN(r)) return { ...INIT, display: "Error" };
    return { display: String(r), acc: null, op: null, fresh: true, expr: `${s.acc} ${s.op} ${cur} =` };
  }

  if (OPS.includes(key)) {
    const op = key as Op;
    const cur = Number(s.display);
    // changing operator before typing the next number
    if (s.op && s.fresh && s.acc !== null) return { ...s, op, expr: `${s.acc} ${op}` };
    if (s.acc !== null && s.op) {
      const r = calc(s.acc, cur, s.op);
      if (Number.isNaN(r)) return { ...INIT, display: "Error" };
      return { display: String(r), acc: r, op, fresh: true, expr: `${r} ${op}` };
    }
    return { ...s, acc: cur, op, fresh: true, expr: `${cur} ${op}` };
  }

  return s;
}

const show = (d: string) => {
  if (d === "Error") return d;
  const [i, f] = d.split(".");
  const n = Number(i).toLocaleString("en-PK");
  return f !== undefined ? `${n}.${f}` : n;
};

const KEYS = [
  "C", "±", "%", "÷",
  "7", "8", "9", "×",
  "4", "5", "6", "−",
  "1", "2", "3", "+",
  "0", ".", "⌫", "=",
];

const KEYBOARD: Record<string, string> = {
  "*": "×",
  x: "×",
  "/": "÷",
  "-": "−",
  Enter: "=",
  Backspace: "⌫",
  Delete: "C",
  c: "C",
  C: "C",
};

/* -------------------------------------------------------------------------- */
/*                               COMPONENT                                    */
/* -------------------------------------------------------------------------- */

export default function CalculatorButton({
  label,
  className,
}: {
  label?: string;
  className?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const [s, press] = useReducer(reducer, INIT);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Outside click + keyboard support
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);

      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const k = KEYBOARD[e.key] ?? e.key;
      if (/^\d$/.test(k) || [".", "%", "C", "⌫", "="].includes(k) || OPS.includes(k)) {
        e.preventDefault();
        press(k);
      }
    };

    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(s.display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1100);
    } catch {}
  };

  const text = show(s.display);
  const size = text.length > 13 ? "text-xl" : text.length > 9 ? "text-2xl" : "text-3xl";

  return (
    <div ref={wrapRef} className="relative">
      {/* Header button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Calculator"
        aria-expanded={open}
        title="Calculator"
        className={className ?? `flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 ${
          open
            ? "border-transparent bg-[var(--brand-primary)] text-white shadow-[0_6px_16px_rgba(200,16,46,0.3)]"
            : "border-gray-200 bg-white text-gray-600 hover:border-[var(--brand-primary)]/30 hover:text-[var(--brand-primary)]"
        }`}
      >
        <Calculator className="h-[16px] w-[16px]" strokeWidth={1.9} />
        {label && <span>{label}</span>}
      </button>

      {/* Popover */}
      {open && (
        <div
          role="dialog"
          aria-label="Calculator"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[264px] origin-top-right rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_20px_50px_rgba(15,23,42,0.18)]"
        >
          {/* Display */}
          <button
            type="button"
            onClick={copy}
            title="Click to copy"
            className="group relative mb-2.5 w-full rounded-xl bg-[var(--brand-primary-lighter)] px-3.5 pb-2 pt-1.5 text-right transition hover:brightness-[0.98]"
          >
            <span className="block h-4 truncate text-[11px] font-medium text-gray-500">
              {s.expr || "\u00A0"}
            </span>
            <span className={`block truncate font-extrabold tracking-tight text-[var(--text-dark)] ${size}`}>
              {text}
            </span>
            <span className="absolute left-3 top-2 flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
              {copied && (
                <>
                  <Check className="h-3 w-3" /> Copied
                </>
              )}
            </span>
          </button>

          {/* Keys */}
          <div className="grid grid-cols-4 gap-1.5">
            {KEYS.map((k) => {
              const isOp = OPS.includes(k);
              const isFn = k === "C" || k === "±" || k === "%" || k === "⌫";
              const active = isOp && s.op === k && s.fresh;

              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => press(k)}
                  aria-label={k === "⌫" ? "Backspace" : k}
                  className={`flex h-10 items-center justify-center rounded-xl text-[15px] font-bold transition-all duration-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]/40 ${
                    k === "="
                      ? "bg-primary text-white hover:brightness-110"
                      : active
                      ? "bg-[var(--brand-primary)] text-white"
                      : isOp
                      ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/20"
                      : isFn
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-50 text-[var(--text-dark)] hover:bg-gray-100"
                  }`}
                >
                  {k === "⌫" ? <Delete className="h-4 w-4" /> : k}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}