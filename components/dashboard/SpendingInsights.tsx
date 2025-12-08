"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Sparkles,
    Trophy,
    Target,
    Zap,
    Lightbulb,
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

interface Transaction {
    id: string;
    amount: number;
    category: string;
    type: "income" | "expense";
    date: string;
}

interface SpendingInsightsProps {
    transactions?: Transaction[];
    hasData?: boolean;
}

interface Insight {
    id: string;
    type: "positive" | "warning" | "neutral" | "achievement";
    icon: React.ElementType;
    title: string;
    description: string;
    value?: string;
}

export function SpendingInsights({ transactions = [], hasData = false }: SpendingInsightsProps) {
    const { preferredCurrency } = useUserSettings();

    // Generate insights from transaction data
    const insights = useMemo<Insight[]>(() => {
        if (!hasData || transactions.length === 0) {
            return [];
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Filter transactions by month
        const thisMonthTx = transactions.filter((t) => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const lastMonthTx = transactions.filter((t) => {
            const date = new Date(t.date);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });

        // Calculate totals
        const thisMonthExpenses = thisMonthTx
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const lastMonthExpenses = lastMonthTx
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const thisMonthIncome = thisMonthTx
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const lastMonthIncome = lastMonthTx
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Calculate savings rate
        const savingsRate = thisMonthIncome > 0
            ? ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100
            : 0;

        // Category spending
        const categorySpending: Record<string, number> = {};
        thisMonthTx
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount);
            });

        const lastMonthCategorySpending: Record<string, number> = {};
        lastMonthTx
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                lastMonthCategorySpending[t.category] = (lastMonthCategorySpending[t.category] || 0) + Math.abs(t.amount);
            });

        const generatedInsights: Insight[] = [];

        // Insight: Expense comparison
        if (lastMonthExpenses > 0) {
            const expenseChange = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
            if (expenseChange < -10) {
                generatedInsights.push({
                    id: "expense-down",
                    type: "positive",
                    icon: TrendingDown,
                    title: "Great job on spending!",
                    description: `You've spent ${Math.abs(expenseChange).toFixed(0)}% less than last month`,
                    value: formatCurrency(Math.abs(lastMonthExpenses - thisMonthExpenses), preferredCurrency),
                });
            } else if (expenseChange > 20) {
                generatedInsights.push({
                    id: "expense-up",
                    type: "warning",
                    icon: AlertTriangle,
                    title: "Spending increased",
                    description: `You've spent ${expenseChange.toFixed(0)}% more than last month`,
                    value: formatCurrency(thisMonthExpenses - lastMonthExpenses, preferredCurrency),
                });
            }
        }

        // Insight: Savings rate
        if (savingsRate >= 20) {
            generatedInsights.push({
                id: "savings-great",
                type: "achievement",
                icon: Trophy,
                title: "Excellent savings rate!",
                description: `You're saving ${savingsRate.toFixed(0)}% of your income`,
            });
        } else if (savingsRate >= 10) {
            generatedInsights.push({
                id: "savings-good",
                type: "positive",
                icon: Target,
                title: "Good savings habits",
                description: `You're saving ${savingsRate.toFixed(0)}% of your income. Try to reach 20%!`,
            });
        } else if (savingsRate < 5 && thisMonthIncome > 0) {
            generatedInsights.push({
                id: "savings-low",
                type: "warning",
                icon: Lightbulb,
                title: "Consider saving more",
                description: "Try setting aside at least 10% of your income",
            });
        }

        // Insight: Top spending category change
        const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
            const [category, amount] = topCategory;
            const lastMonthAmount = lastMonthCategorySpending[category] || 0;
            if (lastMonthAmount > 0) {
                const categoryChange = ((amount - lastMonthAmount) / lastMonthAmount) * 100;
                if (categoryChange > 30) {
                    generatedInsights.push({
                        id: "category-spike",
                        type: "neutral",
                        icon: Zap,
                        title: `${category} spending up`,
                        description: `${categoryChange.toFixed(0)}% increase in ${category} this month`,
                        value: formatCurrency(amount, preferredCurrency),
                    });
                }
            }
        }

        // Insight: Income growth
        if (lastMonthIncome > 0 && thisMonthIncome > lastMonthIncome * 1.1) {
            const incomeGrowth = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
            generatedInsights.push({
                id: "income-up",
                type: "positive",
                icon: TrendingUp,
                title: "Income increased!",
                description: `Your income is up ${incomeGrowth.toFixed(0)}% this month`,
                value: formatCurrency(thisMonthIncome - lastMonthIncome, preferredCurrency),
            });
        }

        // Always show at least one insight
        if (generatedInsights.length === 0 && transactions.length > 0) {
            generatedInsights.push({
                id: "keep-tracking",
                type: "neutral",
                icon: Sparkles,
                title: "Keep tracking!",
                description: "Add more transactions to get personalized insights",
            });
        }

        return generatedInsights.slice(0, 3); // Max 3 insights
    }, [transactions, hasData, preferredCurrency]);

    const getInsightStyles = (type: Insight["type"]) => {
        switch (type) {
            case "positive":
                return {
                    bg: "from-emerald-500/10 to-emerald-600/5",
                    icon: "from-emerald-400 to-emerald-600",
                    border: "border-emerald-500/20",
                };
            case "warning":
                return {
                    bg: "from-amber-500/10 to-amber-600/5",
                    icon: "from-amber-400 to-amber-600",
                    border: "border-amber-500/20",
                };
            case "achievement":
                return {
                    bg: "from-purple-500/10 to-purple-600/5",
                    icon: "from-purple-400 to-purple-600",
                    border: "border-purple-500/20",
                };
            default:
                return {
                    bg: "from-blue-500/10 to-blue-600/5",
                    icon: "from-blue-400 to-blue-600",
                    border: "border-blue-500/20",
                };
        }
    };

    return (
        <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
            <div className="rounded-3xl glass-card overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white ios-shadow">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Smart Insights
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {hasData ? "AI-powered analysis of your finances" : "Add transactions to get insights"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Insights List */}
                <div className="px-4 pb-6 space-y-3">
                    {!hasData || insights.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3 animate-float">
                                <Lightbulb className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No insights yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Add more transactions to unlock personalized tips
                            </p>
                        </div>
                    ) : (
                        insights.map((insight) => {
                            const styles = getInsightStyles(insight.type);
                            const Icon = insight.icon;

                            return (
                                <div
                                    key={insight.id}
                                    className={cn(
                                        "group relative overflow-hidden rounded-2xl p-4",
                                        "bg-gradient-to-br",
                                        styles.bg,
                                        "border",
                                        styles.border,
                                        "hover-glass ios-transition cursor-pointer",
                                        "active:scale-[0.98]"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                                "bg-gradient-to-br text-white",
                                                styles.icon,
                                                "ios-shadow ios-transition",
                                                "group-hover:scale-110 group-hover:rotate-6"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold">
                                                {insight.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {insight.description}
                                            </p>
                                        </div>
                                        {insight.value && (
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-bold">
                                                    {insight.value}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </TiltCard>
    );
}
