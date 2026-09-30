"use client";

import { useState } from "react";
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
    BarChart3, ChevronDown, TrendingDown, TrendingUp, CircleDollarSign,
} from "lucide-react";
import { EntryKind } from "@/types/expenseManagerTy";

interface TrendDatum {
    label: string;
    expense: number;
    income: number;
    debt: number;
}

type Granularity = "day" | "week" | "month";
type KindFilter = "all" | EntryKind;

interface TrendChartProps {
    title: string;
    dataByGranularity: Record<Granularity, TrendDatum[]>;
    variant?: "bar" | "pie";
    defaultGranularity?: Granularity;
}

const KIND_META: Record<
    EntryKind,
    {
        label: string;
        color: string;
        icon: typeof TrendingUp;
    }
> = {
    expense: {
        label: "Expenses",
        color: "var(--brand-primary)",
        icon: TrendingDown,
    },
    income: {
        label: "Income",
        color: "var(--brand-secondary)",
        icon: TrendingUp,
    },
    debt: {
        label: "Debt",
        color: "var(--status-warning)",
        icon: CircleDollarSign,
    },
};

const PIE_PALETTE = [
    "var(--brand-primary)",
    "color-mix(in srgb, var(--brand-primary) 65%, white)",
    "var(--brand-secondary)",
    "color-mix(in srgb, var(--brand-secondary) 60%, white)",
    "color-mix(in srgb, var(--text-secondary-muter) 55%, white)",
];

function formatTick(label: string, granularity: Granularity) {
    if (granularity === "month") {
        const [year, month] = label.split("-");

        return new Date(
            Number(year),
            Number(month) - 1
        ).toLocaleDateString("en-GB", {
            month: "short",
        });
    }

    if (granularity === "week") {
        return label;
    }

    return new Date(label).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
    });
}

function formatAmount(value: number) {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(0)}K`;
    }

    return value.toString();
}

function CompactSelect({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-7 appearance-none rounded-brand-8 border border-border-clr bg-page-bg pl-2.5 pr-7 para-tiny font-semibold text-text-secondary outline-none transition focus:border-primary"
            >
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            <ChevronDown
                size={11}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary-muter"
            />
        </div>
    );
}

function ChartLegend({
    kinds,
}: {
    kinds: EntryKind[];
}) {
    return (
        <div className="flex items-center gap-brand-12">
            {kinds.map((kind) => {
                const Icon = KIND_META[kind].icon;

                return (
                    <span
                        key={kind}
                        className="flex items-center gap-1.5 para-tiny font-medium text-text-secondary-muted"
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                                backgroundColor:
                                    KIND_META[kind].color,
                            }}
                        />

                        {KIND_META[kind].label}
                    </span>
                );
            })}
        </div>
    );
}

export default function TrendChart({
    title,
    dataByGranularity,
    variant = "bar",
    defaultGranularity,
}: TrendChartProps) {
    // const [granularity, setGranularity] = useState<Granularity>("day");
    const [granularity, setGranularity] = useState<Granularity>(defaultGranularity ?? "day");
    const [kindFilter, setKindFilter] = useState<KindFilter>("all");

    const data = dataByGranularity[granularity];

    // Empty State
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full min-h-[255px] flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">
                <div className="flex items-center gap-2.5">

                    <div>
                        <h3 className="para-small font-semibold text-text-dark">
                            {title}
                        </h3>

                        <p className="para-tiny text-text-secondary-muter">
                            Spending activity
                        </p>
                    </div>
                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-page-bg">
                            <BarChart3
                                size={18}
                                className="text-text-secondary-muter"
                            />
                        </div>

                        <p className="para-tiny font-medium text-text-secondary">
                            No activity yet
                        </p>

                        <p className="mt-0.5 para-tiny text-text-secondary-muter">
                            Your financial activity will appear here.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // PIE
    if (variant === "pie") {
        const total = data.reduce(
            (sum, item) => sum + item.expense,
            0
        );

        return (
            <div className="flex h-full flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div>
                            <h3 className="para-small font-semibold text-text-dark">
                                {title}
                            </h3>

                            <p className="para-tiny text-text-secondary-muter">
                                Expense distribution
                            </p>
                        </div>
                    </div>

                    <CompactSelect
                        value={granularity}
                        onChange={(value) =>
                            setGranularity(
                                value as Granularity
                            )
                        }
                        options={[
                            {
                                value: "day",
                                label: "Daily",
                            },
                            {
                                value: "week",
                                label: "Weekly",
                            },
                            {
                                value: "month",
                                label: "Monthly",
                            },
                        ]}
                    />
                </div>

                <div className="relative flex-1 max-h-min my-brand-12">
                    <ResponsiveContainer
                        width="100%"
                        height={205}
                    >
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="expense"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                // innerRadius={80}
                                innerRadius={60}
                                // outerRadius={120}
                                outerRadius={95}
                                paddingAngle={3}
                                cornerRadius={5}
                                stroke="none"
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={index}
                                        fill={
                                            PIE_PALETTE[
                                            index %
                                            PIE_PALETTE.length
                                            ]
                                        }
                                    />
                                ))}
                            </Pie>

                            <Tooltip
                                formatter={(value) => [
                                    `PKR ${Number(
                                        value ?? 0
                                    ).toLocaleString(
                                        "en-PK"
                                    )}`,
                                    "Spent",
                                ]}
                                labelFormatter={(value) =>
                                    formatTick(
                                        value as string,
                                        granularity
                                    )
                                }
                                contentStyle={{
                                    borderRadius: 10,
                                    border: "1px solid var(--border-clr)",
                                    boxShadow:
                                        "0 8px 24px rgba(0,0,0,0.06)",
                                    fontSize: 11,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="para-tiny text-text-secondary-muter">
                            Total
                        </span>

                        <span className="text-base font-bold text-text-dark">
                            PKR {formatAmount(total)}
                        </span>
                    </div>
                </div>

                {/* footer description */}
                <div className="grid grid-cols-2 gap-x-30 gap-y-1.5">
                    {data.map((item, index) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-1.5"
                        >
                            <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{
                                    backgroundColor:
                                        PIE_PALETTE[
                                        index %
                                        PIE_PALETTE.length
                                        ],
                                }}
                            />

                            <span className="truncate para-tiny text-text-secondary-muted">
                                {formatTick(
                                    item.label,
                                    granularity
                                )}
                            </span>

                            <span className="ml-auto para-tiny font-semibold text-text-secondary">
                                PKR{" "}
                                {formatAmount(
                                    item.expense
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // BAR
    const kindsToShow: EntryKind[] =
        kindFilter === "all"
            ? ["expense", "income", "debt"]
            : [kindFilter];

    return (
        <div className="flex h-full min-h-0 flex-col rounded-brand-16 border border-border-clr bg-white p-brand-12">

            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">

                    <div className="flex flex-col gap-1">
                        <h3 className="para-small font-semibold text-text-dark">
                            {title}
                        </h3>

                        <p className="para-tiny text-text-secondary-muter">
                            Income, expenses & debt
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <CompactSelect
                        value={granularity}
                        onChange={(value) =>
                            setGranularity(
                                value as Granularity
                            )
                        }
                        options={[
                            {
                                value: "day",
                                label: "Daily",
                            },
                            {
                                value: "week",
                                label: "Weekly",
                            },
                            {
                                value: "month",
                                label: "Monthly",
                            },
                        ]}
                    />

                    <CompactSelect
                        value={kindFilter}
                        onChange={(value) =>
                            setKindFilter(
                                value as KindFilter
                            )
                        }
                        options={[
                            {
                                value: "all",
                                label: "All",
                            },
                            {
                                value: "expense",
                                label: "Expenses",
                            },
                            {
                                value: "income",
                                label: "Income",
                            },
                            {
                                value: "debt",
                                label: "Debt",
                            },
                        ]}
                    />
                </div>
            </div>

            {/* Bar Chart */}
            <div className="mt-2 flex-1">
                <ResponsiveContainer
                    width="100%"
                    height={225}
                >
                    <BarChart
                        data={data}
                        margin={{
                            top: 8,
                            right: 4,
                            left: -20,
                            bottom: 0,
                        }}
                        barGap={3}
                    >
                        <CartesianGrid
                            vertical={false}
                            strokeDasharray="3 3"
                            stroke="var(--border-clr)"
                        />

                        <XAxis
                            dataKey="label"
                            tickFormatter={(value) =>
                                formatTick(
                                    value,
                                    granularity
                                )
                            }
                            tick={{
                                fontSize: 11,
                                fill: "var(--text-secondary-muter)",
                            }}
                            axisLine={false}
                            tickLine={false}
                            dy={6}
                        />

                        <YAxis
                            tickFormatter={(value) =>
                                formatAmount(
                                    Number(value)
                                )
                            }
                            tick={{
                                fontSize: 11,
                                fill: "var(--text-secondary-muter)",
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={38}
                        />

                        <Tooltip
                            cursor={{
                                fill: "var(--page-bg-clr)",
                            }}
                            labelFormatter={(value) =>
                                formatTick(
                                    value as string,
                                    granularity
                                )
                            }
                            formatter={(value, name) => [
                                `PKR ${Number(
                                    value ?? 0
                                ).toLocaleString(
                                    "en-PK"
                                )}`,
                                KIND_META[
                                    name as EntryKind
                                ]?.label ?? name,
                            ]}
                            contentStyle={{
                                borderRadius: 10,
                                border: "1px solid var(--border-clr)",
                                boxShadow:
                                    "0 8px 24px rgba(0,0,0,0.06)",
                                fontSize: 12,
                            }}
                        />

                        {kindsToShow.map((kind) => (
                            <Bar
                                key={kind}
                                dataKey={kind}
                                fill={
                                    KIND_META[kind]
                                        .color
                                }
                                radius={[
                                    4,
                                    4,
                                    0,
                                    0,
                                ]}
                                name={kind}
                                maxBarSize={24}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            {kindFilter === "all" && (
                <div className="flex justify-center border-t border-border-clr/85 pt-brand-8">
                    <ChartLegend
                        kinds={kindsToShow}
                    />
                </div>
            )}
        </div>
    );
}