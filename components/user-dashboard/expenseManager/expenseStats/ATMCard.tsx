// components/user-dashboard/expenseManager/ATMCard.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Wifi } from "lucide-react";
import { ICard } from "@/types/expenseManagerTy";
import { cn } from "@/lib/cn";

export const fmt = (v: number) => `PKR ${v.toLocaleString("en-PK")}`;

const two = (n: number | undefined, placeholder: string) =>
    n === undefined || Number.isNaN(n) ? placeholder : String(n).padStart(2, "0");

export const expiry = (c: { expiryMonth?: number; expiryYear?: number }) =>
    `${two(c.expiryMonth, "MM")}/${two(c.expiryYear, "YY")}`;

export const gradientStyles: Record<ICard["gradient"], string> = {
    primary: "bg-gradient-wallet-card",
    secondary: "bg-gradient-to-br from-secondary to-secondary-light",
    dark: "bg-gradient-to-br from-[#1F2937] to-[#111827]",
};

// Every field except gradient is optional so the form can preview a half-filled card
export type ATMCardData = Partial<Pick<ICard, "label" | "balance" | "last4" | "expiryMonth" | "expiryYear">> & {
    id?: string;
    gradient: ICard["gradient"];
};

interface ATMCardProps {
    card: ATMCardData;
    /** Pass a boolean to control the flip from outside (e.g. the form). Leave undefined for click-to-flip. */
    flipped?: boolean;
    /** Play the 3D flip-in animation on mount */
    animateIn?: boolean;
    className?: string;
}

export default function ATMCard({ card, flipped: flippedProp, animateIn = true, className }: ATMCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50 });
    const [hovering, setHovering] = useState(false);
    const [internalFlipped, setInternalFlipped] = useState(false);

    const controlled = flippedProp !== undefined;
    const flipped = controlled ? flippedProp : internalFlipped;

    // reset flip whenever a different card is shown
    useEffect(() => setInternalFlipped(false), [card.id]);

    const label = card.label?.trim() || "Bank Name";
    const last4 = card.last4 || "••••";
    const balance = card.balance ?? 0;

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        setTilt({ x: (0.5 - py) * 18, y: (px - 0.5) * 18 });
        setGlare({ x: px * 100, y: py * 100 });
    };

    const handleLeave = () => {
        setHovering(false);
        setTilt({ x: 0, y: 0 });
        if (!controlled) setInternalFlipped(false);
    };

    return (
        <>
            <style>{`
                @keyframes atmCardIn {
                    0%   { opacity: 0; transform: rotateY(-80deg) translateY(12px) scale(.94); }
                    100% { opacity: 1; transform: rotateY(0) translateY(0) scale(1); }
                }
                .atm-card-in { animation: atmCardIn 600ms cubic-bezier(.2,.8,.2,1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .atm-card-in { animation: none; }
                    .atm-tilt, .atm-flip { transition: none !important; }
                }
            `}</style>

            <div
                className={cn(animateIn && "atm-card-in", "aspect-[85.6/54] w-full max-w-[320px]", className)}
                style={{ perspective: "1000px" }}
            >
                {/* TILT LAYER */}
                <div
                    ref={ref}
                    onMouseEnter={() => {
                        setHovering(true);
                        if (!controlled) setInternalFlipped(true);
                    }}
                    onMouseMove={handleMove}
                    onMouseLeave={handleLeave}
                    className="atm-tilt relative h-full w-full"
                    style={{
                        transformStyle: "preserve-3d",
                        transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                        transition: hovering ? "transform 90ms linear" : "transform 600ms cubic-bezier(.2,.8,.2,1)",
                    }}
                >
                    {/* FLIP LAYER */}
                    <div
                        className="atm-flip relative h-full w-full"
                        style={{
                            transformStyle: "preserve-3d",
                            transform: `rotateY(${flipped ? 180 : 0}deg)`,
                            transition: "transform 700ms cubic-bezier(.2,.8,.2,1)",
                        }}
                    >
                        {/* FRONT */}
                        <div
                            className={cn(
                                "absolute inset-0 overflow-hidden rounded-[14px] p-4 text-white shadow-xl transition-colors",
                                gradientStyles[card.gradient]
                            )}
                            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                        >
                            <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
                            <span className="pointer-events-none absolute -bottom-14 -left-8 h-40 w-40 rounded-full bg-black/10" />

                            {/* glare that follows the cursor */}
                            <span
                                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                                style={{
                                    opacity: hovering ? 1 : 0,
                                    background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)`,
                                }}
                            />

                            <div className="relative flex h-full flex-col justify-between" style={{ transform: "translateZ(20px)" }}>
                                <div className="flex items-start justify-between">
                                    <p className="max-w-[200px] truncate text-[13px] font-semibold tracking-wide">{label}</p>
                                    <Wifi size={18} className="rotate-90 text-white/80" strokeWidth={2} />
                                </div>

                                <div className="flex items-center justify-between">
                                    <CardChipEMV />
                                    <div className="text-right">
                                        <p className="text-[9px] uppercase tracking-widest text-white/60">Balance</p>
                                        <p className="text-[15px] font-semibold leading-tight">{fmt(balance)}</p>
                                    </div>
                                </div>

                                <p className="font-mono text-[15px] tracking-[0.22em] text-white/95">
                                    •••• •••• •••• {last4}
                                </p>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-white/60">Valid thru</p>
                                        <p className="text-[12px] font-medium">{expiry(card)}</p>
                                    </div>
                                    <CardChip />
                                </div>
                            </div>
                        </div>

                        {/* BACK */}
                        <div
                            className={cn(
                                "absolute inset-0 overflow-hidden rounded-[14px] text-white shadow-xl transition-colors",
                                gradientStyles[card.gradient]
                            )}
                            style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                            }}
                        >
                            <div className="mt-5 h-9 w-full bg-black/80" />

                            <div className="px-4 pt-4">
                                <div className="flex h-7 items-center justify-end rounded-[4px] bg-white/90 px-2">
                                    <span className="font-mono text-[11px] italic text-gray-500">•••</span>
                                </div>

                                <div className="mt-4 flex items-end justify-between">
                                    <div>
                                        <p className="text-[8px] uppercase tracking-widest text-white/60">Available balance</p>
                                        <p className="text-[16px] font-semibold leading-tight">{fmt(balance)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] uppercase tracking-widest text-white/60">Card</p>
                                        <p className="font-mono text-[12px] tracking-widest">•••• {last4}</p>
                                    </div>
                                </div>

                                <p className="mt-3 truncate text-[9px] text-white/60">{label}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function CardChipEMV() {
    return (
        <div className="relative h-[26px] w-[34px] overflow-hidden rounded-[5px] bg-gradient-to-br from-[#F5D98B] via-[#D9B45A] to-[#B8923A]">
            <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-black/20" />
            <span className="absolute bottom-0 left-1/3 top-0 w-px bg-black/20" />
            <span className="absolute bottom-0 right-1/3 top-0 w-px bg-black/20" />
        </div>
    );
}

function CardChip() {
    return (
        <div className="flex items-center">
            <span className="h-6 w-6 rounded-full bg-white/85" />
            <span className="-ml-2.5 h-6 w-6 rounded-full bg-secondary-light mix-blend-screen" />
        </div>
    );
}