"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  BarChart3,
  Bus,
  ChevronDown,
  House,
  PiggyBank,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import NewExpenseDialog from "./NewExpenseDialog";
import { expenseEntriesData } from "@/data/user-dashboard/expenseEntriesData";
import { ExpenseEntryFormValues } from "@/lib/schemas/expenseEntryFormSchema";
import {
  ExpenseCategory,
  IExpenseEntry,
  IFinancialAccount,
} from "@/types/expenseManager";
import {
  CircleCheck,
  Landmark,
  Plus,
  Wallet,
} from "lucide-react";

type RangeFilter = "all" | "month";

// Only the categories actually shown in the dashboard's CategoryRail breakdown.
const categoryBreakdownKeys: Array<"rent" | "transport" | "food"> = [
  "rent",
  "transport",
  "food",
];

const categoryLabels: Record<"rent" | "transport" | "food", string> = {
  rent: "Rent",
  transport: "Transport",
  food: "Food",
};

const categoryIcons: Record<"rent" | "transport" | "food", LucideIcon> = {
  rent: House,
  transport: Bus,
  food: UtensilsCrossed,
};

const categoryAccentColors: Record<"rent" | "transport" | "food", string> = {
  rent: "var(--brand-primary)",
  transport: "color-mix(in srgb, var(--brand-primary) 72%, white)",
  food: "color-mix(in srgb, var(--brand-primary) 48%, white)",
};

const categoryAccentBackgrounds: Record<"rent" | "transport" | "food", string> = {
  rent: "color-mix(in srgb, var(--brand-primary) 12%, white)",
  transport: "color-mix(in srgb, var(--brand-primary) 9%, white)",
  food: "color-mix(in srgb, var(--brand-primary) 7%, white)",
};

const defaultAccounts: IFinancialAccount[] = [
  {
    id: "cash-wallet",
    name: "Cash wallet",
    type: "cash",
    accountNumber: "1024",
    last4: "1024",
    startingBalance: 45000,
  },
  {
    id: "main-bank",
    name: "Main bank account",
    type: "bank",
    accountNumber: "4821",
    last4: "4821",
    startingBalance: 180000,
  },
];

function formatCurrency(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function getMonthKey(date: string) {
  return date.slice(0, 7);
}

export default function AdvancedExpenseWorkspace() {
  const [entries, setEntries] = useState<IExpenseEntry[]>(expenseEntriesData);
  const [accounts, setAccounts] =
    useState<IFinancialAccount[]>(defaultAccounts);
  const [range, setRange] = useState<RangeFilter>("month");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedEntries = window.localStorage.getItem(
      "filernow-expense-entries",
    );
    const storedAccounts = window.localStorage.getItem(
      "filernow-expense-accounts",
    );

    if (storedEntries) {
      try {
        setEntries(JSON.parse(storedEntries) as IExpenseEntry[]);
      } catch {
        window.localStorage.removeItem("filernow-expense-entries");
      }
    }
    if (storedAccounts) {
      try {
        setAccounts(JSON.parse(storedAccounts) as IFinancialAccount[]);
      } catch {
        window.localStorage.removeItem("filernow-expense-accounts");
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(
      "filernow-expense-entries",
      JSON.stringify(entries),
    );
    window.localStorage.setItem(
      "filernow-expense-accounts",
      JSON.stringify(accounts),
    );
  }, [accounts, entries, isHydrated]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const visibleEntries = useMemo(
    () =>
      entries.filter(
        (entry) => range === "all" || getMonthKey(entry.date) === currentMonth,
      ),
    [currentMonth, entries, range],
  );

  const totals = useMemo(
    () =>
      visibleEntries.reduce(
        (result, entry) => {
          result[entry.kind] += entry.amount;
          return result;
        },
        { income: 0, expense: 0 },
      ),
    [visibleEntries],
  );

  const categoryTotals = useMemo(
    () =>
      visibleEntries
        .filter((entry) => entry.kind === "expense")
        .reduce<Partial<Record<ExpenseCategory, number>>>((result, entry) => {
          result[entry.category] = (result[entry.category] ?? 0) + entry.amount;
          return result;
        }, {}),
    [visibleEntries],
  );

  const totalSpent = totals.expense;

  const chartData = useMemo(() => {
    const startingBalance = accounts.reduce(
      (total, account) => total + account.startingBalance,
      0,
    );
    const datedEntries = [...entries]
      .filter(
        (entry) => range === "all" || getMonthKey(entry.date) === currentMonth,
      )
      .sort((first, second) => first.date.localeCompare(second.date));

    const dailyImpact = new Map<string, number>();
    for (const entry of datedEntries) {
      const day = new Date(entry.date).toLocaleDateString("en-GB", {
        day: "2-digit",
      });
      dailyImpact.set(
        day,
        (dailyImpact.get(day) ?? 0) +
        (entry.kind === "income" ? entry.amount : -entry.amount),
      );
    }

    const totalDays = new Date(
      Number(currentMonth.slice(0, 4)),
      Number(currentMonth.slice(5, 7)),
      0,
    ).getDate();

    let runningNetWorth = startingBalance;
    return Array.from({ length: totalDays }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      runningNetWorth += dailyImpact.get(day) ?? 0;
      return {
        day,
        netWorth: runningNetWorth,
      };
    });
  }, [accounts, currentMonth, entries, range]);

  function addEntry(values: ExpenseEntryFormValues) {
    const account = accounts.find((item) => item.id === values.accountId);
    setEntries((currentEntries) => [
      { ...values, id: `local-${Date.now()}`, accountName: account?.name },
      ...currentEntries,
    ]);
  }

  return (
    <section
      className="mt-5 rounded-brand-16 border border-border-clr bg-page-bg p-3 shadow-card sm:p-5"
      aria-label="Advanced expense manager"
    >
      <div className="flex flex-col gap-3 border-b border-border-clr pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="para-small font-semibold mb-1">Personal Finance</h2>
          <p className="para-tiny text-text-muted">Spending </p>
        </div>
        <div className="flex items-center gap-6">
          <span className="hidden para-tiny font-semibold text-text-secondary-muted sm:inline">
            {range === "month" ? "September 2026" : "All activity"}
          </span>
          <NewExpenseDialog accounts={accounts} onSaved={addEntry} />
        </div>
      </div>

      <DashboardPreviewLayout
        chartData={chartData}
        balance={totals.income - totalSpent}
        totalSpent={totalSpent}
        range={range}
        setRange={setRange}
        categoryTotals={categoryTotals}
        visibleEntries={visibleEntries}
      />
    </section>
  );
}

function DashboardPreviewLayout({
  chartData,
  balance,
  totalSpent,
  range,
  setRange,
  categoryTotals,
  visibleEntries,
}: {
  chartData: Array<{ day: string; netWorth: number }>;
  balance: number;
  totalSpent: number;
  range: RangeFilter;
  setRange: (value: RangeFilter) => void;
  categoryTotals: Partial<Record<ExpenseCategory, number>>;
  visibleEntries: IExpenseEntry[];
}) {
  return (
    <div className="pt-3">
      <div className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[minmax(0,7fr)_minmax(0,3.4fr)]">
        {/* Net Worth */}
        <div className="h-full min-h-[380px]">
          <NetWorthCard
            chartData={chartData}
            balance={balance}
            totalSpent={totalSpent}
            range={range}
            setRange={setRange}
            className="h-full min-h-[380px]"
          />
        </div>

        {/* Financial Accounts */}
        <div className="h-full min-h-[380px]">
          <ConnectAccounts />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <TransactionPreview entries={visibleEntries} />
        <CategoryRail
          categoryTotals={categoryTotals}
          totalSpent={totalSpent}
          className="min-h-[380px]"
        />
      </div>
    </div>
  );
}

function NetWorthCard({
  chartData,
  balance,
  totalSpent,
  range,
  setRange,
  className = "",
}: {
  chartData: Array<{ day: string; netWorth: number }>;
  balance: number;
  totalSpent: number;
  range: RangeFilter;
  setRange: (value: RangeFilter) => void;
  className?: string;
}) {
  const [activeMetric, setActiveMetric] = useState<"netWorth" | "income" | "expenses">("netWorth");
  const [isRangeOpen, setIsRangeOpen] = useState(false);
  const metricTabs = [
    { key: "netWorth" as const, label: "Net worth", value: balance, detail: "Expenses" },
    { key: "income" as const, label: "Income", value: balance + totalSpent, detail: "Spent" },
    { key: "expenses" as const, label: "Expenses", value: totalSpent, detail: "Net worth" },
  ];
  const selectedMetric = metricTabs.find((tab) => tab.key === activeMetric) ?? metricTabs[0];
  const chartDisplayData =
    chartData.length > 6
      ? Array.from({ length: 6 }, (_, index) =>
        chartData[Math.round((index * (chartData.length - 1)) / 5)],
      )
      : chartData;

  return (
    <div
      className={`rounded-brand-12 border border-border-clr bg-white p-4 sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex w-fit items-center gap-1 rounded-brand-8 bg-[#f8fafc] p-1">
            {metricTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                aria-pressed={activeMetric === tab.key}
                onClick={() => setActiveMetric(tab.key)}
                className={`rounded-md px-3 py-1.5 para-tiny font-semibold default-transition ${activeMetric === tab.key ? "bg-primary text-white " : "text-text-secondary hover:text-text-dark"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="mt-4 heading-h3 text-text-dark">
            {formatCurrency(selectedMetric.value)}
          </p>
          <div className="mt-1 para-tiny text-text-secondary-muted">
            {selectedMetric.key === "netWorth" && (
              <>
                Spent{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(totalSpent)}
                </span>{" "}
                against{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(balance + totalSpent)}
                </span>{" "}
                income this month
              </>
            )}
            {selectedMetric.key === "income" && (
              <>
                Income{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(balance + totalSpent)}
                </span>{" "}
                against{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(totalSpent)}
                </span>{" "}
                spent this month
              </>
            )}
            {selectedMetric.key === "expenses" && (
              <>
                Expenses{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(totalSpent)}
                </span>{" "}
                against{" "}
                <span className="font-bold text-primary">
                  {formatCurrency(balance)}
                </span>{" "}
                net worth
              </>
            )}
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isRangeOpen}
            onClick={() => setIsRangeOpen((open) => !open)}
            className="flex items-center gap-1 rounded-brand-8 border border-border-clr px-2.5 py-1.5 para-tiny text-text-secondary hover:border-primary hover:text-primary"
          >
            {range === "month" ? "September" : "All time"}
            <ChevronDown size={13} />
          </button>
          {isRangeOpen && (
            <div
              role="listbox"
              aria-label="Date range"
              className="absolute right-0 z-10 mt-1 min-w-full overflow-hidden rounded-brand-8 border border-border-clr bg-white p-1 shadow-card"
            >
              {([
                ["month", "September"],
                ["all", "All time"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="option"
                  aria-selected={range === value}
                  onClick={() => {
                    setRange(value);
                    setIsRangeOpen(false);
                  }}
                  className={`block w-full whitespace-nowrap rounded-brand-8 px-3 py-2 text-left para-tiny ${range === value ? "bg-primary font-semibold text-white" : "text-text-secondary hover:bg-page-bg hover:text-text-dark"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartDisplayData}
            margin={{ top: 12, right: 8, left: -24, bottom: 8 }}
          >
            <defs>
              <linearGradient id="netWorthFillPreview" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--border-clr)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              interval={0}
              tickMargin={8}
              tick={{ fontSize: 10, fill: "var(--text-secondary-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={["dataMin - 5000", "dataMax + 5000"]} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border-clr)",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="var(--brand-primary)"
              strokeWidth={3}
              fill="url(#netWorthFillPreview)"
              activeDot={{ r: 5, fill: "var(--brand-primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TransactionPreview({ entries }: { entries: IExpenseEntry[] }) {
  const visibleEntries = entries.slice(0, 4);

  return (
    <div className="rounded-brand-12 border border-border-clr bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="para-small font-semibold text-text-dark">
            Latest transactions
          </h3>
          <p className="mt-0.5 para-tiny text-text-secondary-muted">
            Your most recent activity
          </p>
        </div>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-brand-8 border border-border-clr text-text-secondary-muter transition hover:border-primary hover:bg-primary/5 hover:text-primary"
          aria-label="View transactions"
        >
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Transactions */}
      <div className="space-y-2">
        {visibleEntries.map((entry) => {
          const isIncome = entry.kind === "income";

          return (
            <div
              key={entry.id}
              className="group flex items-center justify-between gap-3 rounded-brand-8 border border-transparent px-2.5 py-2.5 transition hover:border-border-clr hover:bg-slate-50"
            >
              {/* Left */}
              <div className="flex min-w-0 items-center gap-3">
                {/* Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isIncome
                      ? "bg-success-bg/20 text-success"
                      : "bg-primary/10 text-primary"
                    }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft size={15} />
                  ) : (
                    <ArrowUpRight size={15} />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <p className="truncate para-small font-semibold text-text-dark">
                    {entry.subject}
                  </p>

                  <div className=" flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isIncome ? "bg-success" : "bg-primary"
                        }`}
                    />

                    <p className="para-tiny text-text-secondary-muted">
                      {new Date(entry.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="shrink-0 text-right">
                <p
                  className={`para-small font-semibold ${isIncome ? "text-success" : "text-text-dark"
                    }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(entry.amount)}
                </p>

                <p className="mt-0.5 para-tiny text-text-secondary-muted">
                  {isIncome ? "Income" : "Expense"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {visibleEntries.length === 0 && (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-brand-8 border border-dashed border-border-clr bg-slate-50/50">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
            <ArrowUpRight
              size={15}
              className="text-text-secondary-muter"
            />
          </div>

          <p className="para-small font-medium text-text-secondary">
            No transactions yet
          </p>

          <p className="mt-1 para-tiny text-text-secondary-muted">
            Your latest activity will appear here
          </p>
        </div>
      )}

      {/* Footer */}
      {/* {visibleEntries.length > 0 && (
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-brand-8 border border-border-clr py-2.5 para-tiny font-semibold text-text-secondary transition hover:border-primary hover:bg-primary/5 hover:text-primary"
        >
          View all transactions
          <ArrowUpRight size={13} />
        </button>
      )} */}
    </div>
  );
}

function ConnectAccounts() {
  const accounts = [
    {
      name: "Primary Bank",
      type: "Checking",
      last4: "4821",
      balance: 125000,
      connected: true,
    },
    {
      name: "Savings Account",
      type: "Savings",
      last4: "7319",
      balance: 85000,
      connected: true,
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-brand-12 border border-border-clr bg-white p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="para-tiny font-semibold uppercase text-black">
              Financial accounts
            </h3>

            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase text-primary">
              {accounts.length} connected
            </span>
          </div>

          <p className="mt-1 para-tiny text-text-secondary-muted">
            All your accounts in one place
          </p>
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-brand-8 bg-gray-100 text-black transition"
          aria-label="Add account"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Accounts */}
      <div className="mt-4 flex flex-1 flex-col">
        <div className="mb-2 flex items-center justify-between">
          <p className="para-small font-semibold text-text-dark">
            Connected accounts
          </p>

          <button
            type="button"
            className="para-tiny font-semibold text-primary hover:underline"
          >
            Manage
          </button>
        </div>

        <div className="space-y-2">
          {accounts.map((account) => (
            <div
              key={account.last4}
              className="flex items-center gap-3 rounded-brand-8 bg-page-bg p-3 transition"
            >
              {/* Bank Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-brand-8 bg-primary/10">
                <Landmark size={18} className="text-primary" />
              </div>

              {/* Account Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate para-tiny font-semibold text-text-dark">
                    {account.name}
                  </p>

                  <CircleCheck
                    size={12}
                    className="shrink-0 text-primary"
                  />
                </div>

                <p className="mt-0.5 para-tiny text-text-secondary-muted">
                  {account.type} •••• {account.last4}
                </p>
              </div>

              {/* Balance */}
              <div className="text-right">
                <p className="para-tiny font-semibold text-text-dark">
                  {formatCurrency(account.balance)}
                </p>

                <p className="mt-0.5 text-[9px] text-text-secondary-muted">
                  Available
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Account CTA */}
      <button
        type="button"
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-brand-8 border border-dashed border-slate-400 py-2.5 para-tiny font-semibold text-text-secondary transition hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <Plus size={14} />
        Connect another account
      </button>
    </div>
  );
}
function CategoryRail({
  categoryTotals,
  totalSpent,
  className = "",
}: {
  categoryTotals: Partial<Record<ExpenseCategory, number>>;
  totalSpent: number;
  className?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Category Breakdown
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Expense distribution by category
          </p>
        </div>

        <button className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50">
          View
        </button>
      </div>

      {/* Chart Area */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

        {/* Donut */}
        <div className="relative mx-auto h-[190px] w-[190px] shrink-0 sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryBreakdownKeys.map((key) => ({
                  name: categoryLabels[key],
                  value: categoryTotals[key] ?? 0,
                }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={3}
                cornerRadius={4}
                stroke="none"
              >
                {categoryBreakdownKeys.map((key) => (
                  <Cell
                    key={key}
                    fill={categoryAccentColors[key]}
                  />
                ))}
              </Pie>

              <Tooltip
                cursor={false}
                formatter={(value, name) => [
                  Number(value).toLocaleString(),
                  name,
                ]}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 25px rgba(15, 23, 42, 0.08)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Content */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[11px] font-medium text-slate-400">
              Total
            </span>

            <span className="mt-1 text-xl font-bold tracking-tight text-slate-800">
              {Object.values(categoryTotals)
                .reduce((sum, value) => sum + (value ?? 0), 0)
                .toLocaleString()}
            </span>

            <span className="mt-0.5 text-[10px] text-slate-400">
              Expenses
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="flex-1 space-y-3">
          {categoryBreakdownKeys.map((key) => {
            const total = categoryTotals[key] ?? 0;

            return (
              <div
                key={key}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-3">

                  {/* Category */}
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: categoryAccentColors[key],
                      }}
                    />

                    <span className="truncate text-xs font-medium text-slate-600">
                      {categoryLabels[key]}
                    </span>
                  </div>

                  {/* Value */}
                  <span className="shrink-0 text-sm font-semibold text-slate-800">
                    {total.toLocaleString()}
                  </span>
                </div>

                {/* Progress */}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Object.values(categoryTotals).reduce(
                        (sum, value) => sum + (value ?? 0),
                        0
                      ) > 0
                          ? (total /
                            Object.values(categoryTotals).reduce(
                              (sum, value) => sum + (value ?? 0),
                              0
                            )) *
                          100
                          : 0
                        }%`,
                      backgroundColor: categoryAccentColors[key],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400">
          {categoryBreakdownKeys.length} categories
        </span>

        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active breakdown
        </div>
      </div>
    </div>
  );
}