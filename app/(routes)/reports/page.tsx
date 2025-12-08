"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
} from "recharts";
import { useTransactions, useBudgets, useAccounts } from "@/lib/supabase/hooks";
import { useUserSettings } from "@/lib/stores/userSettings";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { exportTransactions } from "@/lib/export";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/ui/TiltCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    PieChart as PieChartIcon,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Target,
} from "lucide-react";

const COLORS = [
    "#10b981", "#f43f5e", "#8b5cf6", "#f59e0b", "#3b82f6",
    "#ec4899", "#14b8a6", "#6366f1", "#84cc16", "#06b6d4",
];

type TimeRange = "7d" | "30d" | "90d" | "12m" | "all";

export default function ReportsPage() {
    const { transactions, isLoading: txLoading } = useTransactions();
    const { budgets, isLoading: budgetLoading } = useBudgets();
    const { accounts, isLoading: accountLoading } = useAccounts();
    const { preferredCurrency } = useUserSettings();
    const [timeRange, setTimeRange] = useState<TimeRange>("30d");

    const currencySymbol = getCurrencySymbol(preferredCurrency);

    // Filter transactions by time range
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case "7d":
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case "30d":
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case "90d":
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
            case "12m":
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                return transactions;
        }

        return transactions.filter(t => new Date(t.date) >= startDate);
    }, [transactions, timeRange]);

    // Calculate summary stats
    const stats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const expenses = filteredTransactions
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const balance = income - expenses;
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

        return { income, expenses, balance, savingsRate };
    }, [filteredTransactions]);

    // Monthly trend data
    const monthlyData = useMemo(() => {
        const months: Record<string, { month: string; income: number; expenses: number }> = {};

        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

            if (!months[key]) {
                months[key] = { month: monthName, income: 0, expenses: 0 };
            }

            if (t.type === "income") {
                months[key].income += Math.abs(t.amount);
            } else {
                months[key].expenses += Math.abs(t.amount);
            }
        });

        return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
    }, [filteredTransactions]);

    // Category breakdown
    const categoryData = useMemo(() => {
        const categories: Record<string, number> = {};

        filteredTransactions
            .filter(t => t.type === "expense")
            .forEach(t => {
                const category = t.category?.name || "Uncategorized";
                categories[category] = (categories[category] || 0) + Math.abs(t.amount);
            });

        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [filteredTransactions]);

    // Daily spending trend
    const dailySpending = useMemo(() => {
        const days: Record<string, number> = {};

        filteredTransactions
            .filter(t => t.type === "expense")
            .forEach(t => {
                const date = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
                days[date] = (days[date] || 0) + Math.abs(t.amount);
            });

        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return weekdays.map(day => ({ day, amount: days[day] || 0 }));
    }, [filteredTransactions]);

    // Top expenses
    const topExpenses = useMemo(() => {
        return filteredTransactions
            .filter(t => t.type === "expense")
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, 5);
    }, [filteredTransactions]);

    const handleExport = () => {
        const exportData = filteredTransactions.map(t => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            type: t.type,
            category: t.category?.name || "",
            account: t.account?.name || "",
            date: t.date,
            currency: t.currency,
        }));
        exportTransactions(exportData, `transactions-${timeRange}`);
    };

    const isLoading = txLoading || budgetLoading || accountLoading;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Reports & Analytics"
                subtitle="Detailed insights into your financial health"
            />

            {/* Controls */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                    <SelectTrigger className="w-40 rounded-xl">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                        <SelectItem value="12m">Last 12 months</SelectItem>
                        <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    onClick={handleExport}
                    className="rounded-xl gap-2"
                >
                    <Download className="h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                    <div className="rounded-3xl glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                <ArrowUpRight className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Income</p>
                                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(stats.income, preferredCurrency)}
                                </p>
                            </div>
                        </div>
                    </div>
                </TiltCard>

                <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                    <div className="rounded-3xl glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center">
                                <ArrowDownRight className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Expenses</p>
                                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                                    {formatCurrency(stats.expenses, preferredCurrency)}
                                </p>
                            </div>
                        </div>
                    </div>
                </TiltCard>

                <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                    <div className="rounded-3xl glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Net Balance</p>
                                <p className={cn(
                                    "text-lg font-bold",
                                    stats.balance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                )}>
                                    {formatCurrency(stats.balance, preferredCurrency)}
                                </p>
                            </div>
                        </div>
                    </div>
                </TiltCard>

                <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                    <div className="rounded-3xl glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Savings Rate</p>
                                <p className={cn(
                                    "text-lg font-bold",
                                    stats.savingsRate >= 20 ? "text-emerald-600 dark:text-emerald-400" :
                                        stats.savingsRate >= 10 ? "text-amber-600 dark:text-amber-400" :
                                            "text-rose-600 dark:text-rose-400"
                                )}>
                                    {stats.savingsRate.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </TiltCard>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Income vs Expenses Trend */}
                <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
                    <div className="rounded-3xl glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Income vs Expenses</h3>
                                <p className="text-xs text-muted-foreground">Monthly comparison</p>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData as any}>
                                    <defs>
                                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                                    <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground"
                                        tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                    <Tooltip content={({ active, payload, label }) => (
                                        active && payload ? (
                                            <div className="glass rounded-lg p-3 ios-shadow border border-border/50">
                                                <p className="text-xs font-medium mb-2">{label}</p>
                                                {payload.map((p, i) => (
                                                    <p key={i} className="text-xs" style={{ color: p.color }}>
                                                        {p.name}: {formatCurrency(p.value as number, preferredCurrency)}
                                                    </p>
                                                ))}
                                            </div>
                                        ) : null
                                    )} />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </TiltCard>

                {/* Category Breakdown */}
                <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
                    <div className="rounded-3xl glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center">
                                <PieChartIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Spending by Category</h3>
                                <p className="text-xs text-muted-foreground">Where your money goes</p>
                            </div>
                        </div>
                        <div className="h-64 flex items-center">
                            <ResponsiveContainer width="50%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData as any}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {categoryData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={({ active, payload }) => (
                                        active && payload?.[0] ? (
                                            <div className="glass rounded-lg p-2 ios-shadow border border-border/50">
                                                <p className="text-xs font-medium">{payload[0].name}</p>
                                                <p className="text-xs">{formatCurrency(payload[0].value as number, preferredCurrency)}</p>
                                            </div>
                                        ) : null
                                    )} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-1/2 space-y-2 pl-4">
                                {categoryData.slice(0, 5).map((cat, i) => (
                                    <div key={cat.name} className="flex items-center gap-2 text-xs">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="flex-1 truncate">{cat.name}</span>
                                        <span className="font-medium">{formatCurrency(cat.value, preferredCurrency)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TiltCard>

                {/* Daily Spending Pattern */}
                <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
                    <div className="rounded-3xl glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Spending by Day</h3>
                                <p className="text-xs text-muted-foreground">Weekly pattern</p>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailySpending as any}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                                    <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground"
                                        tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                    <Tooltip content={({ active, payload, label }) => (
                                        active && payload?.[0] ? (
                                            <div className="glass rounded-lg p-2 ios-shadow border border-border/50">
                                                <p className="text-xs font-medium">{label}</p>
                                                <p className="text-xs">{formatCurrency(payload[0].value as number, preferredCurrency)}</p>
                                            </div>
                                        ) : null
                                    )} />
                                    <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </TiltCard>

                {/* Top Expenses */}
                <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
                    <div className="rounded-3xl glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Top Expenses</h3>
                                <p className="text-xs text-muted-foreground">Largest transactions</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {topExpenses.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No expenses in this period</p>
                            ) : (
                                topExpenses.map((tx, i) => (
                                    <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover-glass ios-transition">
                                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">
                                            #{i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground">{tx.category?.name || "Uncategorized"}</p>
                                        </div>
                                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                            -{formatCurrency(Math.abs(tx.amount), preferredCurrency)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </TiltCard>
            </div>
        </div>
    );
}
