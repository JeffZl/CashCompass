"use client";

import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { FinancialHealth } from "@/components/dashboard/FinancialHealth";
import { SpendingInsights } from "@/components/dashboard/SpendingInsights";
import { ExpenseBreakdown } from "@/components/dashboard/ExpenseBreakdown";
import { SpendingHeatmap } from "@/components/dashboard/SpendingHeatmap";
import { Achievements } from "@/components/dashboard/Achievements";
import { YearInReview } from "@/components/dashboard/YearInReview";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Wallet,
    TrendingDown,
    TrendingUp,
    PiggyBank,
} from "lucide-react";
import { useTransactions, useAccounts, useBudgets } from "@/lib/supabase";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";

export default function DashboardPage() {
    const { preferredCurrency } = useUserSettings();

    // Supabase hooks
    const { transactions, isLoading: transactionsLoading } = useTransactions();
    const { accounts, isLoading: accountsLoading } = useAccounts();
    const { budgets, isLoading: budgetsLoading } = useBudgets();

    const isLoading = transactionsLoading || accountsLoading || budgetsLoading;

    // Calculate dashboard metrics from Supabase data
    const dashboardData = useMemo(() => {
        // Total balance from accounts
        const totalBalance = accounts.reduce((sum, acc: any) => sum + (acc.balance || 0), 0);

        // Get current month transactions
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthTransactions = transactions.filter((t: any) => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        // Calculate income and expenses for this month
        const income = thisMonthTransactions
            .filter((t: any) => t.type === 'income')
            .reduce((sum, t: any) => sum + Math.abs(t.amount), 0);

        const expenses = thisMonthTransactions
            .filter((t: any) => t.type === 'expense')
            .reduce((sum, t: any) => sum + Math.abs(t.amount), 0);

        // Savings = income - expenses
        const savings = income - expenses;

        return {
            totalBalance,
            expenses,
            income,
            savings,
        };
    }, [transactions, accounts]);

    // Calculate chart data (last 6 months)
    const chartData = useMemo(() => {
        const months: { month: string; income: number; expenses: number }[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            const month = date.getMonth();
            const year = date.getFullYear();

            const monthTransactions = transactions.filter((t: any) => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === month && tDate.getFullYear() === year;
            });

            const income = monthTransactions
                .filter((t: any) => t.type === 'income')
                .reduce((sum, t: any) => sum + Math.abs(t.amount), 0);

            const expenses = monthTransactions
                .filter((t: any) => t.type === 'expense')
                .reduce((sum, t: any) => sum + Math.abs(t.amount), 0);

            months.push({ month: monthName, income, expenses });
        }

        return months;
    }, [transactions]);

    // Get recent transactions (last 5)
    const recentTransactions = useMemo(() => {
        return [...transactions]
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map((t: any) => ({
                id: t.id,
                description: t.description,
                amount: t.amount,
                date: t.date,
                type: t.type,
                category: t.category?.name || 'Unknown',
                account: t.account?.name || 'Unknown',
            }));
    }, [transactions]);

    // Insights transactions format
    const insightsTransactions = useMemo(() => {
        return transactions.map((t: any) => ({
            id: t.id,
            amount: t.amount,
            category: t.category?.name || 'Unknown',
            type: t.type as "income" | "expense",
            date: t.date,
        }));
    }, [transactions]);

    // Calculate financial health metrics
    const healthMetrics = useMemo(() => {
        const { income, expenses, savings } = dashboardData;

        const savingsRate = income > 0 ? (savings / income) * 100 : 0;

        // Budget usage calculation
        const activeBudgets = budgets.filter((b: any) => {
            const now = new Date();
            const start = new Date(b.start_date);
            const end = new Date(b.end_date);
            return now >= start && now <= end;
        });

        const totalBudgeted = activeBudgets.reduce((sum, b: any) => sum + (b.amount || 0), 0);
        const totalSpent = activeBudgets.reduce((sum, b: any) => sum + (b.spent || 0), 0);
        const budgetUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

        return {
            savingsRate: Math.max(0, savingsRate),
            income,
            expenses,
            netIncome: savings,
            budgetUsed: Math.min(100, budgetUsed),
            currentSavings: savings,
            monthlyTarget: 1000, // Default target, could come from user settings
        };
    }, [dashboardData, budgets]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Dashboard"
                    subtitle="Welcome back! Here's your financial overview."
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-3xl" />
                    ))}
                </div>
                <Skeleton className="h-80 rounded-3xl" />
                <div className="grid gap-6 lg:grid-cols-5">
                    <Skeleton className="h-96 rounded-3xl lg:col-span-3" />
                    <Skeleton className="h-96 rounded-3xl lg:col-span-2" />
                </div>
            </div>
        );
    }

    const hasData = transactions.length > 0 || accounts.length > 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <PageHeader
                    title="Dashboard"
                    subtitle={hasData
                        ? "Welcome back! Here's your financial overview."
                        : "Welcome! Start by adding some accounts and transactions."
                    }
                />
                {hasData && <YearInReview />}
            </div>

            {/* Summary Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Total Balance"
                    value={hasData ? formatCurrency(dashboardData.totalBalance, preferredCurrency) : "-"}
                    description="across all accounts"
                    icon={Wallet}
                    variant="gradient"
                    gradientFrom="from-blue-500"
                    gradientTo="to-indigo-600"
                />
                <SummaryCard
                    title="Expenses"
                    value={hasData ? formatCurrency(dashboardData.expenses, preferredCurrency) : "-"}
                    description="this month"
                    icon={TrendingDown}
                />
                <SummaryCard
                    title="Income"
                    value={hasData ? formatCurrency(dashboardData.income, preferredCurrency) : "-"}
                    description="this month"
                    icon={TrendingUp}
                />
                <SummaryCard
                    title="Savings"
                    value={hasData ? formatCurrency(dashboardData.savings, preferredCurrency) : "-"}
                    description="this month"
                    icon={PiggyBank}
                />
            </div>

            {/* Smart Insights Section */}
            <SpendingInsights transactions={insightsTransactions} hasData={hasData} />

            {/* Charts & Breakdown Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <IncomeExpenseChart data={chartData} hasData={hasData} />
                <ExpenseBreakdown
                    transactions={insightsTransactions}
                    hasData={hasData}
                />
            </div>

            {/* Spending Heatmap */}
            <SpendingHeatmap
                transactions={insightsTransactions.map(t => ({ ...t, date: transactions.find((tx: any) => tx.id === t.id)?.date || new Date().toISOString() }))}
                hasData={hasData}
            />

            {/* Achievements */}
            <Achievements
                transactions={insightsTransactions.map(t => ({ ...t, date: transactions.find((tx: any) => tx.id === t.id)?.date || new Date().toISOString() }))}
                budgets={budgets.map((b: any) => ({ id: b.id, amount: b.amount, spent: b.spent ?? 0 }))}
                hasData={hasData}
            />

            {/* Bottom Section: Transactions & Financial Health */}
            <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <RecentTransactions transactions={recentTransactions} hasData={hasData} />
                </div>
                <div className="lg:col-span-2">
                    <FinancialHealth metrics={healthMetrics} hasData={hasData} />
                </div>
            </div>
        </div>
    );
}

