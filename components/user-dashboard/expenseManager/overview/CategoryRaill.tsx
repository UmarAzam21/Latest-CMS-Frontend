"use client";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ICategoryBreakdownItem } from "@/types/expenseManager";

const PALETTE = [
    "var(--brand-primary)",
    "color-mix(in srgb, var(--brand-primary) 65%, white)",
    "var(--brand-secondary)",
    "color-mix(in srgb, var(--brand-secondary) 60%, white)",
    "color-mix(in srgb, var(--text-secondary-muter) 55%, white)"
];

export default function CategoryRail({ data }: { data: ICategoryBreakdownItem[] }) {
    const top = [...data].sort((a, b) => b.amount - a.amount).slice(0, 5);
    const total = top.reduce((s, i) => s + i.amount, 0);

    return (
        <div className="rounded-brand-16 border border-border-clr bg-white p-brand-12">
            <div className="mb-4">
                <h3 className="heading-h6 text-sm">Category Breakdown</h3>
                <p className="para-tiny text-text-secondary-muter">Expense distribution this period</p>
            </div>

            {top.length === 0 ? (
                <p className="para-small text-text-secondary-muted">No expenses recorded for this period.</p>
            ) : (
                <div className="flex flex-col gap-brand-12 sm:flex-rowx sm:items-centerx">
                    <div className="flex self-center">
                        <div className="relative mx-auto h-[160px] w-[160px] shrink-0 sm:mx-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={top}
                                        dataKey="amount"
                                        nameKey="category.label"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={56}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        cornerRadius={4}
                                        stroke="none"
                                    >
                                        {top.map((_, i) => (
                                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(v) => [`PKR ${Number(v).toLocaleString("en-PK")}`, ""]}
                                        contentStyle={{ borderRadius: 10, border: "1px solid var(--border-clr)", fontSize: 12 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="para-tiny text-text-secondary-muter">Total</span>
                                <span className="heading-h5 text-text-dark">PKR {total.toLocaleString("en-PK")}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2.5">
                        {top.map((item, i) => (
                            <div key={item.category.id}>
                                <div className="flex items-center justify-between para-tiny">
                                    <span className="flex items-center gap-2 text-text-secondary">
                                        <span
                                            className="h-2 w-2 rounded-full"
                                            style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                                        />
                                        {item.category.label}
                                    </span>
                                    <span className="font-semibold text-text-dark">
                                        PKR {item.amount.toLocaleString("en-PK")}
                                    </span>
                                </div>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-page-bg">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${item.percentOfTotal}%`,
                                            backgroundColor: PALETTE[i % PALETTE.length]
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
