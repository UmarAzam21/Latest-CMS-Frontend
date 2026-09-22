import { MoveLeft, FileText, Calculator, UserCheck, Building2 } from "lucide-react";
import React from "react";

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

function PromoBanner() {
  const modules = [
    {
      title: (
        <>Check Filer<br />Status</>
      ),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <circle cx="11" cy="13" r="3" />
          <path d="m13.5 15.5 2 2" />
        </svg>
      ),
    },
    {
      title: (
        <>
          Tax
          <br />
          Calculator
        </>
      ),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8" />
          <path d="M8 10h8" />
          <path d="M8 14h3" />
          <path d="M14 14h2" />
          <path d="M8 18h3" />
          <path d="M14 18h2" />
        </svg>
      ),
    },
    {
      title: (
        <>
          Become
          <br />
          Filer
        </>
      ),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
      ),
    },
    {
      title: (
        <>
          Register Your
          <br />
          Business
        </>
      ),
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
        >
          <path d="M3 10h18" />
          <path d="M5 10v10h14V10" />
          <path d="M4 10l2-6h12l2 6" />
          <path d="M9 20v-5h6v5" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative w-full">
      {/* Main banner */}
      <div
        className="relative h-[180px] w-full overflow-hidden rounded-2xl bg-[var(--brand-primary-lighter)]"
      >
        {/* ================= DECORATIVE BACKGROUND ================= */}

        {/* Fine dot-grid texture across the whole banner */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${DOT_GRID_BG}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Faint skyline silhouette along the bottom edge */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[90px] opacity-50"
          style={{
            backgroundImage: `url("${SKYLINE_BG}")`,
            backgroundRepeat: "repeat-x",
            backgroundPosition: "bottom",
            backgroundSize: "auto 90px",
          }}
        />

        <div
          className=" pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-white/30 blur-3xl"
        />

        <div
          className=" pointer-events-none absolute f-right-20 -bottom-24 h-56 w-56 rounded-full bg-[var(--brand-primary)]/10 blur-3xl"
        />

        {/* ================= LEFT : MODULES ================= */}

        <div
          className=" absolute inset-y-0 left-0 z-10 flex w-[28%] flex-col justify-center px-3 lg:px-4"
        >
          {/* Section label */}
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-[2px] w-5 rounded-full bg-[var(--brand-primary)]" />

            <span
              className=" text-[9px] font-bold uppercase tracking-[2.2px] text-[var(--text-dark)]"
            >
              Our Modules
            </span>
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-2 gap-2">
            {modules.map((module, index) => (
              <div
                key={index}
                className=" group flex h-[54px] items-center gap-2 rounded-xl border border-white/70 bg-white/90 px-2 shadow-[0_5px_18px_rgba(17,17,17,0.06)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(17,17,17,0.10)]"
              >
                {/* Icon */}
                <div
                  className=" flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-white shadow-[0_4px_10px_rgba(200,16,46,0.18)]"
                >
                  {module.icon}
                </div>

                {/* Text */}
                <p
                  className=" text-[10px] font-bold leading-[1.3] text-[var(--text-dark)]"
                >
                  {module.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CENTER : MOCKUP ================= */}

        <div className="flex h-full items-center justify-center">
          <img
            src="/promo-ex.png"
            alt="Promo"
            className="max-h-xs max-w-xs object-contain "
          />
        </div>

        {/* ================= RIGHT : CONTENT ================= */}

        <div
          className=" absolute inset-y-0 right-0 z-10 flex w-[32%] items-center justify-center px-5 lg:px-7"
        >
          <div
            dir="rtl"
            className="flex w-full max-w-[310px] flex-col items-start text-right"
            style={{ fontFamily: 'var(--font-noto-nastaliq-urdu), serif' }}
          >
            {/* Small label */}
            <div
              className=" mb-1.5 text-[14px] font-bold tracking-wide text-[var(--brand-primary)]"
            >
              اب Filernow کے ساتھ مزید آسانی
            </div>

            {/* Main heading */}
            <h2
              className=" text-[15px] font-bold leading-[1.6] tracking-[-0.2px] text-[var(--text-dark)]"
            >
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
              dir="rtl"
              className="group mt-3 flex items-center gap-2 rounded-full bg-[var(--brand-primary)] py-1.5 ps-4 pe-1.5 text-[11px] font-bold text-white shadow-[0_6px_18px_rgba(200,16,46,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_9px_22px_rgba(200,16,46,0.28)]"
            >
              <span className="text-[12px] leading-none">آج ہی شروع کریں</span>

              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-primary)] transition-transform duration-200 group-hover:-translate-x-1"
              >
                <MoveLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>

        {/* ================= CENTER DIVIDER GLOW ================= */}

        <div className=" pointer-events-none absolute left-1/2 top-1/2 z-[15] h-[125px] w-px -translate-x-1/2 -translate-y-1/2 bg-white/30"
        />
      </div>
    </section>
  );
}

export default PromoBanner;