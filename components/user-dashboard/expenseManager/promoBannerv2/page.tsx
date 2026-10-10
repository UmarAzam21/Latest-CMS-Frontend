"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    ChartNoAxesCombined,
    MoveLeft,
    X,
    Users,
    Wallet,
    Package,
    ArrowUpRight,
    Sparkles,
    CalendarDays,
    BriefcaseBusiness,
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
    { key: "party" as ModuleKey, title: "Party", icon: Users },
    { key: "cash" as ModuleKey, title: "Cash", icon: Wallet },
    { key: "stock" as ModuleKey, title: "Stock", icon: Package },
    { key: "expense" as ModuleKey, title: "Expense", icon: ChartNoAxesCombined },
];

/* -------------------------------------------------------------------------- */
/*                              BANNER SLIDES                                 */
/*  Every slide uses the SAME promo structure:                                */
/*  badge → headline (with highlighted name) → subline → CTA                  */
/* -------------------------------------------------------------------------- */

const BANNER_SLIDES = [
    {
        id: "digital-khata",
        label: "Digital Khata",
        badge: "کاروبار کا حساب، اب اور بھی آسان",
        badgeIcon: Sparkles,
        titleBefore: "اپنا",
        highlight: "Digital Khata",
        titleAfter: "آسانی سے مینج کریں",
        subtitle: "خرچ اور آمدنی کا ریکارڈ رکھیں اور حساب کتاب کی جھنجھٹ سے جان چھڑائیں۔",
        cta: "آج ہی شروع کریں",
        image: "/FilernowBanner2-12.png",
        imageAlt: "Digital Khata overview on a phone",
        href: "/user-dashboard/digital-khata/daily",
    },
    {
        id: "daily-khata",
        label: "Daily Khata",
        badge: "روزانہ کا حساب، ایک نظر میں",
        badgeIcon: CalendarDays,
        titleBefore: "ہر دن کا حساب",
        highlight: "Daily Khata",
        titleAfter: "کے ساتھ",
        subtitle: "روزانہ کی آمدنی اور خرچ درج کریں اور اپنے اخراجات پر نظر رکھیں۔",
        cta: "روزانہ کھاتہ کھولیں",
        image: "/FilernowBanner-11.png",
        imageAlt: "Daily Khata tracking on a phone",
        href: "/user-dashboard/digital-khata/daily",
    },
    {
        id: "business-khata",
        label: "Business Khata",
        badge: "کیش، اسٹاک اور بل — سب ایک جگہ",
        badgeIcon: BriefcaseBusiness,
        titleBefore: "پورا کاروبار",
        highlight: "Business Khata",
        titleAfter: "میں",
        subtitle: "کیش، اسٹاک اور بلوں کا ریکارڈ منظم رکھیں اور جب چاہیں دیکھیں۔",
        cta: "بزنس کھاتہ کھولیں",
        image: "/FilernowBanner1-10.png",
        imageAlt: "Business Khata tools on a phone",
        href: "/user-dashboard/digital-khata/business",
    },
] as const;

/* -------------------------------------------------------------------------- */
/*                              KHATA ACTIONS                                 */
/* -------------------------------------------------------------------------- */

function useKhataActions() {
    const add = (key: ModuleKey, amount: number, note: string) => {
        /*
          Connect your real stores here.

          party   -> addParty(...)
          cash    -> addCashEntry(...)
          stock   -> addStockEntry(...)
          bills   -> addBill(...)
          staff   -> addStaffExpense(...)
          expense -> addExpense(...)
        */
        console.log("Digital Khata entry:", { module: key, amount, note });
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
                        <span className="ml-1 font-normal text-gray-400">(optional)</span>
                    </label>

                    <input
                        type="text"
                        placeholder="Add a short note"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10"
                    />

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
/*                            BANNER BACKDROP                                 */
/*  Brand red only, kept minimal: soft base tint → two blurred blobs →        */
/*  one faint dot patch → two layered waves (the front wave is solid red under the phone and    */
/*  fades out before it reaches the text).                                    */
/* -------------------------------------------------------------------------- */

const DOT_GRID =
    "[background-image:radial-gradient(rgba(200,16,46,0.28)_1.2px,transparent_1.4px)]";

function BannerBackdrop() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* Base: warm brand tint on the left, clean white under the text */}
            <div className="absolute inset-0 bg-[linear-gradient(110deg,#fde9ec_0%,#fff5f6_38%,#ffffff_62%,#fff7f8_100%)]" />

            {/* Gradient blobs */}
            <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-[rgba(200,16,46,0.14)] blur-3xl" />
            <div className="absolute -right-20 -top-24 h-60 w-60 rounded-full bg-[rgba(200,16,46,0.07)] blur-3xl" />

            {/* Dot grids — faded at their edges so they feel like texture */}
            <div
                className={`absolute left-0 top-0 h-full w-[40%] opacity-60 ${DOT_GRID} [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_22%_30%,#000_0%,transparent_50%)] [-webkit-mask-image:radial-gradient(ellipse_at_22%_30%,#000_0%,transparent_50%)]`}
            />

            {/* Layered waves */}
            <svg
                className="absolute inset-x-0 bottom-0 h-[46%] w-full"
                viewBox="0 0 1440 220"
                preserveAspectRatio="none"
            >
                <defs>
                    <linearGradient id="promo-wave-front" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0" style={{ stopColor: "var(--brand-primary)", stopOpacity: 0.78 }} />
                        <stop offset="0.3" style={{ stopColor: "var(--brand-primary)", stopOpacity: 0.42 }} />
                        <stop offset="0.52" style={{ stopColor: "var(--brand-primary)", stopOpacity: 0.1 }} />
                        <stop offset="0.75" style={{ stopColor: "var(--brand-primary)", stopOpacity: 0 }} />
                    </linearGradient>
                    <linearGradient id="promo-wave-mid" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0" style={{ stopColor: "var(--brand-primary)", stopOpacity: 0.1 }} />
                        <stop offset="0.6" style={{ stopColor: "var(--brand-primary)", stopOpacity: 0.04 }} />
                        <stop offset="1" style={{ stopColor: "var(--brand-primary)", stopOpacity: 0.06 }} />
                    </linearGradient>
                </defs>

                {/* Middle wave */}
                <path
                    d="M0,120 C250,60 520,175 810,125 C1090,78 1270,150 1440,112 L1440,220 L0,220 Z"
                    fill="url(#promo-wave-mid)"
                />
                {/* Front wave — the red base under the phone */}
                <path
                    d="M0,150 C190,104 410,190 690,162 C960,136 1190,192 1440,168 L1440,220 L0,220 Z"
                    fill="url(#promo-wave-front)"
                />
            </svg>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                              PROMO BANNER                                  */
/* -------------------------------------------------------------------------- */

function PromoBanner() {
    const { add } = useKhataActions();

    const [active, setActive] = useState<ModuleKey | null>(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const activeModule = useMemo(
        () => MODULES.find((module) => module.key === active),
        [active]
    );

    const hasMultipleSlides = BANNER_SLIDES.length > 1;

    useEffect(() => {
        if (isPaused || !hasMultipleSlides) return;

        const timer = window.setInterval(() => {
            setActiveSlide((current) => (current + 1) % BANNER_SLIDES.length);
        }, 2000);

        return () => window.clearInterval(timer);
    }, [isPaused, hasMultipleSlides]);

    const showSlide = (index: number) => {
        setActiveSlide((index + BANNER_SLIDES.length) % BANNER_SLIDES.length);
    };

    return (
        <section className="relative w-full">
            <div
                className="relative h-[250px] w-full overflow-hidden rounded-3xl border border-primary/10 bg-white sm:h-[235px] lg:h-[225px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocusCapture={() => setIsPaused(true)}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setIsPaused(false);
                    }
                }}
                aria-roledescription="carousel"
                aria-label="Digital Khata highlights"
            >
                <BannerBackdrop />

                <div className="absolute inset-0 z-10">
                    {BANNER_SLIDES.map((slide, index) => (
                        <article
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-500 ${
                                index === activeSlide
                                    ? "z-10 opacity-100"
                                    : "pointer-events-none z-0 opacity-0"
                            }`}
                            aria-hidden={index !== activeSlide}
                            inert={index !== activeSlide}
                        >
                            <div
                                dir="ltr"
                                className="relative grid h-full grid-cols-[38%_62%] items-center"
                            >
                                {/* IMAGE — let the banner graphic occupy the left visual area naturally */}
                                <div className="relative flex h-full w-full items-center justify-start overflow-hidden">
                                    <img
                                        src={slide.image}
                                        alt={slide.imageAlt}
                                        className="relative z-10 -ml-4 h-[100%] w-auto max-w-none object-contain object-left drop-shadow-[0_16px_20px_rgba(80,0,15,0.22)] sm:-ml-6 lg:-ml-8"
                                    />
                                </div>

                                {/* COPY — same promo layout on every slide */}
                                <div
                                    dir="rtl"
                                    className="flex h-full min-w-0 items-center  py-4 pb-7 pe-2 ps-6 sm:pe-3 sm:ps-10"
                                    style={{ fontFamily: "var(--font-noto-nastaliq-urdu), serif" }}
                                >
                                    <div className="flex w-full max-w-[520px] flex-col items-start gap-2 text-right">
                                        {/* Badge */}
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/80 px-2.5 py-0.5 text-[10px] font-bold leading-[1.9] text-primary shadow-sm sm:text-[11px]">
                                            <slide.badgeIcon aria-hidden="true" className="h-3 w-3 shrink-0" />
                                            {slide.badge}
                                        </span>

                                        {/* Headline */}
                                        <h2 className="text-[17px] font-extrabold leading-[1.75] text-text-dark sm:text-[20px] lg:text-[23px]">
                                            {slide.titleBefore}{" "}
                                            <span
                                                dir="ltr"
                                                className="inline-block whitespace-nowrap font-sans font-extrabold text-primary"
                                            >
                                                {slide.highlight}
                                            </span>{" "}
                                            {slide.titleAfter}
                                        </h2>

                                        {/* Subline */}
                                        <p className="line-clamp-2 text-[11px] leading-[1.9] text-text-secondary sm:text-[12px]">
                                            {slide.subtitle}
                                        </p>

                                        {/* CTA */}
                                        <div className="flex w-full flex-wrap items-center gap-x-3 gap-y-2">
                                            <Link
                                                href={slide.href}
                                                className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-primary py-1 ps-3.5 pe-1 text-[11px] font-bold leading-[1.9] text-white shadow-[0_6px_16px_rgba(200,16,46,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_22px_rgba(200,16,46,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                                            >
                                                <span>{slide.cta}</span>
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary transition-transform group-hover:-translate-x-0.5">
                                                    <MoveLeft className="h-3.5 w-3.5" />
                                                </span>
                                            </Link>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}

                    {hasMultipleSlides && (
                        <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/85 px-2 py-1 shadow-sm sm:bottom-2.5">
                            {BANNER_SLIDES.map((slide, index) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    aria-label={`Show ${slide.label} banner`}
                                    aria-current={index === activeSlide}
                                    onClick={() => showSlide(index)}
                                    className={`h-1.5 rounded-full transition-all ${
                                        index === activeSlide
                                            ? "w-5 bg-primary"
                                            : "w-1.5 bg-primary/30 hover:bg-primary/60"
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ADD AMOUNT MODAL */}
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