"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    Trophy,
    Target,
    Flame,
    PiggyBank,
    Shield,
    Star,
    Zap,
    Crown,
    Award,
    TrendingUp,
    Coins,
    Lock,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

interface Transaction {
    id: string;
    amount: number;
    type: "income" | "expense";
    date: string;
}

interface Budget {
    id: string;
    amount: number;
    spent: number;
}

interface AchievementsProps {
    transactions?: Transaction[];
    budgets?: Budget[];
    hasData?: boolean;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    unlocked: boolean;
    progress?: number; // 0-100
}

export function Achievements({ transactions = [], budgets = [], hasData = false }: AchievementsProps) {
    // Calculate achievements based on data
    const achievements = useMemo<Achievement[]>(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter this month's transactions
        const thisMonthTx = transactions.filter((t) => {
            const d = new Date(t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        // Calculate total savings
        const totalIncome = thisMonthTx
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const totalExpenses = thisMonthTx
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

        // Check budget status
        const budgetsUnderLimit = budgets.filter((b) => b.spent <= b.amount).length;
        const totalBudgets = budgets.length;
        const allBudgetsUnder = totalBudgets > 0 && budgetsUnderLimit === totalBudgets;

        // Calculate streak (consecutive days with transactions)
        const transactionDates = new Set(
            transactions.map((t) => new Date(t.date).toISOString().split("T")[0])
        );
        let streak = 0;
        const checkDate = new Date();
        while (transactionDates.has(checkDate.toISOString().split("T")[0])) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        return [
            {
                id: "first-transaction",
                title: "First Steps",
                description: "Add your first transaction",
                icon: Star,
                color: "from-amber-400 to-yellow-600",
                unlocked: transactions.length > 0,
            },
            {
                id: "saver-10",
                title: "Saver",
                description: "Save 10% of your income",
                icon: PiggyBank,
                color: "from-emerald-400 to-green-600",
                unlocked: savingsRate >= 10,
                progress: Math.min(savingsRate, 10) * 10,
            },
            {
                id: "super-saver",
                title: "Super Saver",
                description: "Save 20% of your income",
                icon: Trophy,
                color: "from-yellow-400 to-orange-600",
                unlocked: savingsRate >= 20,
                progress: Math.min(savingsRate, 20) * 5,
            },
            {
                id: "budget-master",
                title: "Budget Master",
                description: "Stay under all budgets",
                icon: Target,
                color: "from-blue-400 to-indigo-600",
                unlocked: allBudgetsUnder,
                progress: totalBudgets > 0 ? (budgetsUnderLimit / totalBudgets) * 100 : 0,
            },
            {
                id: "streak-7",
                title: "On Fire",
                description: "7-day tracking streak",
                icon: Flame,
                color: "from-orange-400 to-red-600",
                unlocked: streak >= 7,
                progress: Math.min(streak, 7) * (100 / 7),
            },
            {
                id: "income-1000",
                title: "Earner",
                description: "Earn $1,000 in a month",
                icon: TrendingUp,
                color: "from-teal-400 to-cyan-600",
                unlocked: totalIncome >= 1000,
                progress: Math.min(totalIncome / 1000, 1) * 100,
            },
            {
                id: "guardian",
                title: "Guardian",
                description: "Set up 3 budgets",
                icon: Shield,
                color: "from-violet-400 to-purple-600",
                unlocked: totalBudgets >= 3,
                progress: Math.min(totalBudgets / 3, 1) * 100,
            },
            {
                id: "wealthy",
                title: "Wealthy",
                description: "Save $5,000 total",
                icon: Crown,
                color: "from-pink-400 to-rose-600",
                unlocked: savings >= 5000,
                progress: Math.min(Math.max(savings, 0) / 5000, 1) * 100,
            },
        ];
    }, [transactions, budgets]);

    // Separate unlocked and locked achievements
    const unlockedAchievements = achievements.filter((a) => a.unlocked);
    const lockedAchievements = achievements.filter((a) => !a.unlocked);

    return (
        <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
            <div className="rounded-3xl glass-card overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-white ios-shadow">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight">
                                    Achievements
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {unlockedAchievements.length} of {achievements.length} unlocked
                                </p>
                            </div>
                        </div>

                        {/* Progress Ring */}
                        <div className="relative h-12 w-12">
                            <svg className="h-12 w-12 -rotate-90">
                                <circle
                                    className="text-muted/30"
                                    strokeWidth="3"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="20"
                                    cx="24"
                                    cy="24"
                                />
                                <circle
                                    className="text-amber-500"
                                    strokeWidth="3"
                                    strokeDasharray={`${(unlockedAchievements.length / achievements.length) * 126} 126`}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="20"
                                    cx="24"
                                    cy="24"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                {Math.round((unlockedAchievements.length / achievements.length) * 100)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="px-4 pb-6">
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                        {achievements.map((achievement) => {
                            const Icon = achievement.icon;
                            return (
                                <div
                                    key={achievement.id}
                                    className={cn(
                                        "group relative flex flex-col items-center p-3 rounded-xl ios-transition",
                                        achievement.unlocked
                                            ? "hover-glass cursor-pointer"
                                            : "opacity-50 grayscale"
                                    )}
                                >
                                    {/* Badge Icon */}
                                    <div
                                        className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-xl",
                                            "ios-transition",
                                            achievement.unlocked
                                                ? `bg-gradient-to-br ${achievement.color} text-white ios-shadow group-hover:scale-110`
                                                : "bg-muted/50 text-muted-foreground"
                                        )}
                                    >
                                        {achievement.unlocked ? (
                                            <Icon className="h-6 w-6" />
                                        ) : (
                                            <Lock className="h-5 w-5" />
                                        )}
                                    </div>

                                    {/* Title */}
                                    <p className="text-[11px] font-medium text-center mt-2 leading-tight">
                                        {achievement.title}
                                    </p>

                                    {/* Tooltip on hover */}
                                    <div
                                        className={cn(
                                            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
                                            "glass rounded-xl p-3 w-40 text-center",
                                            "opacity-0 group-hover:opacity-100 pointer-events-none",
                                            "ios-transition z-20",
                                            "border border-border/50 ios-shadow"
                                        )}
                                    >
                                        <p className="text-sm font-semibold">{achievement.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {achievement.description}
                                        </p>
                                        {!achievement.unlocked && achievement.progress !== undefined && (
                                            <div className="mt-2">
                                                <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full bg-gradient-to-r",
                                                            achievement.color
                                                        )}
                                                        style={{ width: `${achievement.progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    {achievement.progress.toFixed(0)}% complete
                                                </p>
                                            </div>
                                        )}
                                        {achievement.unlocked && (
                                            <p className="text-[10px] text-emerald-500 mt-1 font-medium">
                                                ✓ Unlocked!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </TiltCard>
    );
}
