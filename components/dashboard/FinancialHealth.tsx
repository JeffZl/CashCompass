"use client";

import { TrendingUp, Percent, Target, AlertCircle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { TiltCard } from "@/components/ui/TiltCard";

interface HealthMetrics {
    savingsRate: number;
    income: number;
    expenses: number;
    netIncome: number;
    budgetUsed: number;
    currentSavings: number;
    monthlyTarget: number;
}

interface FinancialHealthProps {
    metrics?: HealthMetrics;
    hasData?: boolean;
}

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

const defaultMetrics: HealthMetrics = {
    savingsRate: 0,
    income: 0,
    expenses: 0,
    netIncome: 0,
    budgetUsed: 0,
    currentSavings: 0,
    monthlyTarget: 1000,
};

export function FinancialHealth({ metrics = defaultMetrics, hasData = false }: FinancialHealthProps) {
    const { preferredCurrency } = useUserSettings();

    const savingsProgress = metrics.monthlyTarget > 0
        ? (metrics.currentSavings / metrics.monthlyTarget) * 100
        : 0;

    return (
        <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
            <div className="rounded-3xl glass-card overflow-hidden h-full">
                {/* Header */}
                <div className="p-6 pb-4">
                    <h3 className="text-lg font-semibold tracking-tight">
                        Financial Health
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {hasData ? "Your financial wellness snapshot" : "Add transactions to see your financial health"}
                    </p>
                </div>

                {/* Metrics Grid - Each metric has glass hover */}
                <div className="px-4 pb-6 space-y-2">
                    {!hasData ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                                <Activity className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No data available
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Add transactions to track your financial health
                            </p>
                        </div>
                    ) : (
                        <>
                            <MetricCard
                                title="Savings Rate"
                                value={`${metrics.savingsRate.toFixed(1)}%`}
                                subtitle="of income saved"
                                icon={Percent}
                                status={
                                    metrics.savingsRate >= 20
                                        ? "good"
                                        : metrics.savingsRate >= 10
                                            ? "warning"
                                            : "danger"
                                }
                                progress={metrics.savingsRate}
                            />

                            <MetricCard
                                title="Net Income"
                                value={formatCurrency(metrics.netIncome, preferredCurrency)}
                                subtitle="income minus expenses"
                                icon={TrendingUp}
                                status={metrics.netIncome > 0 ? "good" : "danger"}
                            />

                            <MetricCard
                                title="Savings Goal"
                                value={formatCurrency(metrics.currentSavings, preferredCurrency)}
                                subtitle={`of ${formatCurrency(metrics.monthlyTarget, preferredCurrency)} target`}
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
                                value={`${metrics.budgetUsed.toFixed(0)}%`}
                                subtitle="of monthly budget"
                                icon={AlertCircle}
                                status={
                                    metrics.budgetUsed <= 70
                                        ? "good"
                                        : metrics.budgetUsed <= 90
                                            ? "warning"
                                            : "danger"
                                }
                                progress={metrics.budgetUsed}
                            />
                        </>
                    )}
                </div>
            </div>
        </TiltCard>
    );
}
