import React from "react";

function PromoBanner() {
  const modules = [
    {
      title: (
        <>
          Check Filer
          <br />
          Status
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
    <section className="relative mt-12 w-full">
      {/* Main banner */}
      <div
        className="
          relative
          h-[180px]
          w-full
          overflow-hidden
          rounded-2xl
          bg-[var(--brand-primary-lighter)]
        "
      >
        {/* ================= DECORATIVE BACKGROUND ================= */}

        <div
          className="
            pointer-events-none
            absolute
            -left-16
            -top-20
            h-48
            w-48
            rounded-full
            bg-white/30
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -bottom-24
            h-56
            w-56
            rounded-full
            bg-[var(--brand-primary)]/10
            blur-3xl
          "
        />

        {/* ================= LEFT : MODULES ================= */}

        <div
          className="
            absolute
            inset-y-0
            left-0
            z-10
            flex
            w-[31%]
            flex-col
            justify-center
            px-5
            lg:px-6
          "
        >
          {/* Section label */}
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-[2px] w-5 rounded-full bg-[var(--brand-primary)]" />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[2.2px]
                text-[var(--text-dark)]
              "
            >
              Our Services
            </span>
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-2 gap-2">
            {modules.map((module, index) => (
              <div
                key={index}
                className="
                  group
                  flex
                  h-[57px]
                  items-center
                  gap-2.5
                  rounded-xl
                  border
                  border-white/70
                  bg-white/90
                  px-2.5
                  shadow-[0_5px_18px_rgba(17,17,17,0.06)]
                  backdrop-blur-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_8px_22px_rgba(17,17,17,0.10)]
                "
              >
                {/* Icon */}
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-[var(--brand-primary)]
                    text-white
                    shadow-[0_4px_10px_rgba(200,16,46,0.18)]
                  "
                >
                  {module.icon}
                </div>

                {/* Text */}
                <p
                  className="
                    text-[8.5px]
                    font-bold
                    leading-[1.3]
                    text-[var(--text-dark)]
                  "
                >
                  {module.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ================= CENTER : MOCKUP ================= */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-20
            h-full
            w-[30%]
            -translate-x-1/2
            -translate-y-1/2
          "
        >
          {/* Soft glow behind mockup */}
          <div
            className="
              absolute
              left-1/2
              top-1/2
              h-[130px]
              w-[150px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-white/60
              blur-2xl
            "
          />

          <img
            src="/promo-banner.png"
            alt="Filernow digital account"
            className="
              absolute
              left-1/2
              top-1/2
              h-[170px]
              w-auto
              max-w-none
              -translate-x-1/2
              -translate-y-1/2
              object-contain
              drop-shadow-[0_15px_20px_rgba(0,0,0,0.18)]
            "
          />
        </div>

        {/* ================= RIGHT : CONTENT ================= */}

        <div
          className="
            absolute
            inset-y-0
            right-0
            z-10
            flex
            w-[32%]
            items-center
            justify-center
            px-5
            lg:px-7
          "
        >
          <div
            dir="rtl"
            className="flex w-full max-w-[310px] flex-col items-start text-right"
          >
            {/* Small label */}
            <div
              className="
                mb-1.5
                text-[9px]
                font-bold
                tracking-wide
                text-[var(--brand-primary)]
              "
            >
              اب Filernow کے ساتھ مزید آسانی
            </div>

            {/* Main heading */}
            <h2
              className="
                text-[15px]
                font-bold
                leading-[1.6]
                tracking-[-0.2px]
                text-[var(--text-dark)]
              "
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
              className="
                mt-3
                flex
                items-center
                gap-2.5
                rounded-full
                bg-[var(--brand-primary)]
                py-1.5
                pl-4
                pr-1.5
                text-[11px]
                font-bold
                text-white
                shadow-[0_6px_18px_rgba(200,16,46,0.20)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_9px_22px_rgba(200,16,46,0.28)]
              "
            >
              <span>آج ہی شروع کریں</span>

              <span
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  text-[16px]
                  font-bold
                  text-[var(--brand-primary)]
                "
              >
                ←
              </span>
            </button>
          </div>
        </div>

        {/* ================= CENTER DIVIDER GLOW ================= */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            z-[15]
            h-[125px]
            w-px
            -translate-x-1/2
            -translate-y-1/2
            bg-white/30
          "
        />
      </div>
    </section>
  );
}

export default PromoBanner;
