"use client";
import { RadialBarChart, RadialBar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ICard } from "@/types/expenseManagerTy";

const CARD_COLORS = ["#C8102E", "#34B08D", "#7C3AED", "#2563EB"];
interface CardsBalanceChartProps { cards: ICard[]; variant?: "radial" | "area" | "line" }

export default function CardsBalanceChart({ cards, variant = "radial" }: CardsBalanceChartProps) {
    if (cards.length === 0) {
        return (
            <div className="rounded-brand-16 border border-dashed border-border-clr-dark bg-white p-5">
                <h3 className="heading-h5 mb-4 text-text-dark">Balance Distribution</h3>
                <p className="para-small text-text-secondary-muted">Add a card to see balance distribution.</p>
            </div>
        );
    }

    const totalBalance = cards.reduce((s, c) => s + c.balance, 0);
    // area/line plot CURRENT balance per card (categorical axis), not a time
    // trend — no historical balance snapshots are persisted yet; that needs
    // a backend snapshot table, not something to fake client-side.
    const data = cards.map((c, i) => ({ name: c.label, value: c.balance, fill: CARD_COLORS[i % CARD_COLORS.length] }));

    return (
        <div className="rounded-brand-16 border border-border-clr bg-white p-5">
            <h3 className="heading-h5 mb-1 text-text-dark">Balance Distribution</h3>
            <p className="para-tiny mb-4 text-text-secondary-muter">Across all linked cards</p>
            <ResponsiveContainer width="100%" height={220}>
                {variant === "area" ? (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="cardsAreaFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#C8102E" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#C8102E" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                        <Tooltip formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString("en-PK")}`, "Balance"]} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                        <Area type="monotone" dataKey="value" stroke="#C8102E" strokeWidth={2} fill="url(#cardsAreaFill)" />
                    </AreaChart>
                ) : variant === "line" ? (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                        <Tooltip formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString("en-PK")}`, "Balance"]} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                        <Line type="monotone" dataKey="value" stroke="#C8102E" strokeWidth={2.5} dot={{ r: 4, fill: "#C8102E" }} />
                    </LineChart>
                ) : (
                    <RadialBarChart data={data} innerRadius="35%" outerRadius="100%" startAngle={90} endAngle={-270}>
                        <RadialBar background dataKey="value" cornerRadius={8} />
                        <Tooltip formatter={(v) => [`PKR ${Number(v ?? 0).toLocaleString("en-PK")}`, "Balance"]} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
                    </RadialBarChart>
                )}
            </ResponsiveContainer>
            <div className="mt-3 flex flex-col gap-2">
                {data.map((d) => (
                    <div key={d.name} className="flex items-center justify-between para-tiny text-text-secondary">
                        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />{d.name}</span>
                        <span className="font-semibold text-text-dark">PKR {d.value.toLocaleString("en-PK")} ({totalBalance > 0 ? Math.round((d.value / totalBalance) * 100) : 0}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}