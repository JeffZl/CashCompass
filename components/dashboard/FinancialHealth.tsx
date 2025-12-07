"use client";

import { TrendingUp, Percent, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data - will be replaced with Supabase data later
const healthMetrics = {
    savingsRate: 23.5,
    incomeThisMonth: 5400,
    expensesThisMonth: 2847,
    budgetUsed: 68,
    monthlyTarget: 1500,
    currentSavings: 1250,
};

interface MetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ElementType;
    status: "good" | "warning" | "danger";
    progress?: number;
}

function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    status,
    progress,
}: MetricCardProps) {
    const statusConfig = {
        good: {
            gradient: "from-emerald-400 to-emerald-600",
            bg: "bg-emerald-500/10",
            text: "text-emerald-600 dark:text-emerald-400",
            progress: "bg-emerald-500",
        },
        warning: {
            gradient: "from-amber-400 to-amber-600",
            bg: "bg-amber-500/10",
            text: "text-amber-600 dark:text-amber-400",
            progress: "bg-amber-500",
        },
        danger: {
            gradient: "from-rose-400 to-rose-600",
            bg: "bg-rose-500/10",
            text: "text-rose-600 dark:text-rose-400",
            progress: "bg-rose-500",
        },
    };

    const config = statusConfig[status];

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl p-4",
                "border border-transparent",
                // Glass hover effect
                "hover-glass",
                // Press effect
                "active:scale-[0.98]",
                "cursor-pointer"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {title}
                    </p>
                    <p className="text-xl font-bold tracking-tight">{value}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                        {subtitle}
                    </p>
                </div>
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        "bg-gradient-to-br text-white",
                        config.gradient,
                        "ios-shadow ios-transition",
                        "group-hover:scale-110 group-hover:rotate-6"
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </div>

            {progress !== undefined && (
                <div className="mt-4">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/5">
                        <div
                            className={cn(
                                "h-full rounded-full ios-transition",
                                config.progress
                            )}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export function FinancialHealth() {
    const netIncome =
        healthMetrics.incomeThisMonth - healthMetrics.expensesThisMonth;
    const savingsProgress =
        (healthMetrics.currentSavings / healthMetrics.monthlyTarget) * 100;

    return (
        <div className="rounded-3xl glass-card overflow-hidden h-full">
            {/* Header */}
            <div className="p-6 pb-4">
                <h3 className="text-lg font-semibold tracking-tight">
                    Financial Health
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Your financial wellness snapshot
                </p>
            </div>

            {/* Metrics Grid - Each metric has glass hover */}
            <div className="px-4 pb-6 space-y-2">
                <MetricCard
                    title="Savings Rate"
                    value={`${healthMetrics.savingsRate}%`}
                    subtitle="of income saved"
                    icon={Percent}
                    status={
                        healthMetrics.savingsRate >= 20
                            ? "good"
                            : healthMetrics.savingsRate >= 10
                                ? "warning"
                                : "danger"
                    }
                    progress={healthMetrics.savingsRate}
                />

                <MetricCard
                    title="Net Income"
                    value={`$${netIncome.toLocaleString()}`}
                    subtitle="income minus expenses"
                    icon={TrendingUp}
                    status={netIncome > 0 ? "good" : "danger"}
                />

                <MetricCard
                    title="Savings Goal"
                    value={`$${healthMetrics.currentSavings.toLocaleString()}`}
                    subtitle={`of $${healthMetrics.monthlyTarget.toLocaleString()} target`}
                    icon={Target}
                    status={
                        savingsProgress >= 100
                            ? "good"
                            : savingsProgress >= 50
                                ? "warning"
                                : "danger"
                    }
                    progress={savingsProgress}
                />

                <MetricCard
                    title="Budget Used"
                    value={`${healthMetrics.budgetUsed}%`}
                    subtitle="of monthly budget"
                    icon={AlertCircle}
                    status={
                        healthMetrics.budgetUsed <= 70
                            ? "good"
                            : healthMetrics.budgetUsed <= 90
                                ? "warning"
                                : "danger"
                    }
                    progress={healthMetrics.budgetUsed}
                />
            </div>
        </div>
    );
}
