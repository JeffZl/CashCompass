"use client";

import { PageHeader } from "@/components/PageHeader";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { FinancialHealth } from "@/components/dashboard/FinancialHealth";
import {
    Wallet,
    TrendingDown,
    TrendingUp,
    PiggyBank,
} from "lucide-react";

// Mock data - will be replaced with Supabase data later
const dashboardData = {
    totalBalance: 12345.67,
    expenses: 2847.32,
    income: 5400.0,
    savings: 1250.0,
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    }).format(amount);
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Dashboard"
                subtitle="Welcome back! Here's your financial overview."
            />

            {/* Summary Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Total Balance"
                    value={formatCurrency(dashboardData.totalBalance)}
                    description="across all accounts"
                    icon={Wallet}
                    trend={{ value: 2.5, isPositive: true }}
                    variant="gradient"
                    gradientFrom="from-blue-500"
                    gradientTo="to-indigo-600"
                />
                <SummaryCard
                    title="Expenses"
                    value={formatCurrency(dashboardData.expenses)}
                    description="this month"
                    icon={TrendingDown}
                    trend={{ value: 4.1, isPositive: false }}
                />
                <SummaryCard
                    title="Income"
                    value={formatCurrency(dashboardData.income)}
                    description="this month"
                    icon={TrendingUp}
                    trend={{ value: 12.3, isPositive: true }}
                />
                <SummaryCard
                    title="Savings"
                    value={formatCurrency(dashboardData.savings)}
                    description="this month"
                    icon={PiggyBank}
                    trend={{ value: 8.2, isPositive: true }}
                />
            </div>

            {/* Charts Section */}
            <IncomeExpenseChart />

            {/* Bottom Section: Transactions & Financial Health */}
            <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <RecentTransactions />
                </div>
                <div className="lg:col-span-2">
                    <FinancialHealth />
                </div>
            </div>
        </div>
    );
}
