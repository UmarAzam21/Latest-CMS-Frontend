"use client";

import { MoveRight } from "lucide-react";

function PromoBanner() {
  return (
    <section className="relative w-full">
      <div className="relative h-[180px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* Background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/FilernowBanner 3-03.png")',
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />

        {/* LEFT — PROMOTION */}
        <div className="absolute inset-y-0 left-0 z-20 flex w-[52%] items-center">
          <div
            dir="rtl"
            className="flex w-full max-w-[420px] flex-col items-end pl-8 text-left"
            style={{
              fontFamily: "var(--font-noto-nastaliq-urdu), serif",
            }}
          >
            {/* Label */}
            <div className="mb-1 flex items-center gap-1.5">
              <span className="h-[5px] w-[5px] rounded-full bg-[var(--brand-primary)]" />

              <span className="text-[10px] font-bold tracking-wide text-[var(--brand-primary)]">
                ڈیجیٹل کھاتا
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-[20px] font-bold leading-[1.45] tracking-[-0.4px] text-[var(--text-dark)]">
              اپنا{" "}
              <span className="text-[var(--brand-primary)]">
                Business QR
              </span>{" "}
              بنائیں
              <br />
              اور لین دین رکھیں آسانی سے
            </h2>

            {/* Description */}
            <p className="mt-1 text-[10.5px] font-medium leading-[1.6] text-slate-500">
              QR اسکین کریں، تفصیل درج کریں اور اپنا کھاتا فوراً اپڈیٹ کریں۔
            </p>

            {/* CTA */}
            <button
              type="button"
              dir="rtl"
              className="
                group mt-2.5
                flex items-center gap-2
                rounded-full
                bg-[var(--brand-primary)]
                py-1.5
                ps-3.5
                pe-1.5
                text-[11px]
                font-bold
                text-white
                shadow-[0_5px_14px_rgba(200,16,46,0.16)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_8px_20px_rgba(200,16,46,0.25)]
                active:translate-y-0
              "
            >
              <span className="whitespace-nowrap">
                اپنا QR بنائیں
              </span>

              <span
                className="
                  flex h-6 w-6 shrink-0
                  items-center justify-center
                  rounded-full bg-white
                  text-[var(--brand-primary)]
                  transition-transform duration-200
                  group-hover:-translate-x-1
                "
              >
                <MoveRight
                  className="h-3.5 w-3.5"
                  strokeWidth={2.5}
                />
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT — PHONE MOCKUP */}
        <div className="absolute inset-y-0 right-0 z-10 flex w-[50%] items-center justify-center">
          <div className="pointer-events-none absolute h-[135px] w-[260px] rounded-full bg-[var(--brand-primary)]/[0.07] blur-3xl" />

          <img
            src="/FilernowBanner-04.png"
            alt="Filernow Digital Khata Business QR"
            className="
              relative z-10
              h-[174px]
              w-auto
              max-w-full
              object-contain
            "
          />
        </div>

        {/* Subtle divider */}
        <div className="pointer-events-none absolute inset-y-5 left-1/2 z-20 w-px bg-slate-200/50" />

        {/* Top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-white/80" />
      </div>
    </section>
  );
}

export default PromoBanner;