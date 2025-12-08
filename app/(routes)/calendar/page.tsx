"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { useTransactions, useCategories } from "@/lib/supabase/hooks";
import { TiltCard } from "@/components/ui/TiltCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Tag,
} from "lucide-react";

interface DayData {
    income: number;
    expenses: number;
    transactions: Array<{
        id: string;
        description: string;
        amount: number;
        type: string;
        category?: { name: string; icon?: string; color?: string };
        date: string;
    }>;
}

export default function CalendarPage() {
    const { preferredCurrency } = useUserSettings();
    const { transactions, isLoading: txLoading } = useTransactions();
    const { categories } = useCategories();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Get month name
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Navigate months
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDay(new Date().getDate());
    };

    // Process transactions for the current month
    const monthData = useMemo(() => {
        const data: Record<number, DayData> = {};

        // Initialize all days
        for (let d = 1; d <= daysInMonth; d++) {
            data[d] = { income: 0, expenses: 0, transactions: [] };
        }

        // Filter and group transactions for this month
        transactions.forEach(t => {
            const txDate = new Date(t.date);
            if (txDate.getMonth() === month && txDate.getFullYear() === year) {
                const day = txDate.getDate();
                if (data[day]) {
                    data[day].transactions.push(t);
                    if (t.type === "income") {
                        data[day].income += Math.abs(t.amount);
                    } else {
                        data[day].expenses += Math.abs(t.amount);
                    }
                }
            }
        });

        return data;
    }, [transactions, month, year, daysInMonth]);

    // Calculate monthly totals from real data
    const monthlyStats = useMemo(() => {
        let totalIncome = 0;
        let totalExpenses = 0;
        let transactionCount = 0;
        let daysWithActivity = 0;

        Object.values(monthData).forEach(day => {
            totalIncome += day.income;
            totalExpenses += day.expenses;
            transactionCount += day.transactions.length;
            if (day.transactions.length > 0) daysWithActivity++;
        });

        return {
            totalIncome,
            totalExpenses,
            netBalance: totalIncome - totalExpenses,
            transactionCount,
            daysWithActivity,
            avgDailySpending: daysWithActivity > 0 ? totalExpenses / daysWithActivity : 0,
        };
    }, [monthData]);

    // Selected day data
    const selectedDayData = useMemo(() => {
        if (!selectedDay || !monthData[selectedDay]) return null;
        return monthData[selectedDay];
    }, [selectedDay, monthData]);

    // Get intensity for day (for heat map effect)
    const getIntensity = (day: number): "none" | "low" | "medium" | "high" => {
        const data = monthData[day];
        if (!data || data.transactions.length === 0) return "none";

        const total = data.income + data.expenses;
        const maxTotal = Math.max(...Object.values(monthData).map(d => d.income + d.expenses));

        if (total === 0) return "none";
        const ratio = total / maxTotal;

        if (ratio > 0.6) return "high";
        if (ratio > 0.3) return "medium";
        return "low";
    };

    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

    if (txLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Transaction Calendar"
                    subtitle="View your transactions by date"
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-24 rounded-3xl" />
                    ))}
                </div>
                <Skeleton className="h-96 rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Transaction Calendar"
                subtitle="View your transactions by date"
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                    <div className="rounded-3xl glass-card p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                            <p className="text-xs text-muted-foreground">Income</p>
                        </div>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(monthlyStats.totalIncome, preferredCurrency)}
                        </p>
                    </div>
                </TiltCard>

                <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                    <div className="rounded-3xl glass-card p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <ArrowDownRight className="h-4 w-4 text-rose-500" />
                            <p className="text-xs text-muted-foreground">Expenses</p>
                        </div>
                        <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(monthlyStats.totalExpenses, preferredCurrency)}
                        </p>
                    </div>
                </TiltCard>

                <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                    <div className="rounded-3xl glass-card p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet className="h-4 w-4 text-blue-500" />
                            <p className="text-xs text-muted-foreground">Net Balance</p>
                        </div>
                        <p className={cn(
                            "text-xl font-bold",
                            monthlyStats.netBalance >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                        )}>
                            {formatCurrency(monthlyStats.netBalance, preferredCurrency)}
                        </p>
                    </div>
                </TiltCard>

                <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                    <div className="rounded-3xl glass-card p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="h-4 w-4 text-amber-500" />
                            <p className="text-xs text-muted-foreground">Avg Daily Spend</p>
                        </div>
                        <p className="text-xl font-bold">
                            {formatCurrency(monthlyStats.avgDailySpending, preferredCurrency)}
                        </p>
                    </div>
                </TiltCard>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <TiltCard className="rounded-3xl lg:col-span-2" tiltAmount={3} scale={1.005}>
                    <div className="rounded-3xl glass-card p-6">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">{monthName}</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {monthlyStats.transactionCount} transactions
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-lg">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={goToToday} className="rounded-lg text-xs">
                                    Today
                                </Button>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-lg">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Days of week header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Empty cells for days before month starts */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square" />
                            ))}

                            {/* Day cells */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayData = monthData[day];
                                const isToday = isCurrentMonth && day === today.getDate();
                                const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                const isSelected = selectedDay === day;
                                const intensity = getIntensity(day);
                                const hasTransactions = dayData.transactions.length > 0;

                                return (
                                    <motion.button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={cn(
                                            "aspect-square rounded-xl p-1 flex flex-col items-center justify-start relative",
                                            "ios-transition",
                                            isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                                            isSelected && "bg-primary/10",
                                            !isSelected && intensity === "low" && "bg-muted/30",
                                            !isSelected && intensity === "medium" && "bg-muted/50",
                                            !isSelected && intensity === "high" && "bg-muted/70",
                                            isPast && !hasTransactions && "opacity-40"
                                        )}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <span className={cn(
                                            "text-sm font-medium",
                                            isToday && "text-primary font-bold"
                                        )}>
                                            {day}
                                        </span>

                                        {/* Transaction indicators */}
                                        {hasTransactions && (
                                            <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                                                {dayData.income > 0 && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                )}
                                                {dayData.expenses > 0 && (
                                                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                )}
                                                {dayData.transactions.length > 2 && (
                                                    <span className="text-[8px] text-muted-foreground">
                                                        {dayData.transactions.length}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-xs text-muted-foreground">Income</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-rose-500" />
                                <span className="text-xs text-muted-foreground">Expense</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="h-3 w-6 rounded bg-muted/50" />
                                <span className="text-xs text-muted-foreground">Activity</span>
                            </div>
                        </div>
                    </div>
                </TiltCard>

                {/* Selected Day Details */}
                <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
                    <div className="rounded-3xl glass-card p-6 h-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white">
                                <Tag className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">
                                    {selectedDay
                                        ? new Date(year, month, selectedDay).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : "Select a Day"
                                    }
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {selectedDayData
                                        ? `${selectedDayData.transactions.length} transaction${selectedDayData.transactions.length !== 1 ? 's' : ''}`
                                        : "Click a day to see details"
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Day Summary */}
                        {selectedDayData && selectedDayData.transactions.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                {selectedDayData.income > 0 && (
                                    <div className="flex-1 rounded-xl bg-emerald-500/10 p-2 text-center">
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Income</p>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            +{formatCurrency(selectedDayData.income, preferredCurrency)}
                                        </p>
                                    </div>
                                )}
                                {selectedDayData.expenses > 0 && (
                                    <div className="flex-1 rounded-xl bg-rose-500/10 p-2 text-center">
                                        <p className="text-[10px] text-rose-600 dark:text-rose-400">Expenses</p>
                                        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                                            -{formatCurrency(selectedDayData.expenses, preferredCurrency)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Transaction List */}
                        <div className="space-y-2 max-h-[350px] overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {selectedDayData?.transactions.map((tx) => (
                                    <motion.div
                                        key={tx.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex items-center gap-3 p-3 rounded-xl hover-glass ios-transition"
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center",
                                            tx.type === "income"
                                                ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                                : "bg-gradient-to-br from-rose-400 to-rose-600",
                                            "text-white"
                                        )}>
                                            {tx.type === "income"
                                                ? <TrendingUp className="h-5 w-5" />
                                                : <TrendingDown className="h-5 w-5" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {tx.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {tx.category?.name || "Uncategorized"}
                                            </p>
                                        </div>
                                        <p className={cn(
                                            "text-sm font-bold",
                                            tx.type === "income"
                                                ? "text-emerald-600 dark:text-emerald-400"
                                                : "text-rose-600 dark:text-rose-400"
                                        )}>
                                            {tx.type === "income" ? "+" : "-"}
                                            {formatCurrency(Math.abs(tx.amount), preferredCurrency)}
                                        </p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Empty state */}
                            {!selectedDay && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Select a day on the calendar</p>
                                    <p className="text-xs mt-1">to view transactions</p>
                                </div>
                            )}

                            {selectedDay && selectedDayData?.transactions.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No transactions on this day</p>
                                </div>
                            )}
                        </div>
                    </div>
                </TiltCard>
            </div>
        </div>
    );
}
