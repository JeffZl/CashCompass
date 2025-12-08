"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { Calendar } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

interface Transaction {
    id: string;
    amount: number;
    type: "income" | "expense";
    date: string;
}

interface SpendingHeatmapProps {
    transactions?: Transaction[];
    hasData?: boolean;
}

interface DayData {
    date: Date;
    amount: number;
    intensity: number; // 0-4 scale
}

export function SpendingHeatmap({ transactions = [], hasData = false }: SpendingHeatmapProps) {
    const { preferredCurrency } = useUserSettings();

    // Generate heatmap data for the last 12 weeks
    const heatmapData = useMemo(() => {
        const now = new Date();
        const weeks: DayData[][] = [];

        // Calculate daily spending
        const dailySpending: Record<string, number> = {};
        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                const dateStr = new Date(t.date).toISOString().split("T")[0];
                dailySpending[dateStr] = (dailySpending[dateStr] || 0) + Math.abs(t.amount);
            });

        // Find max spending for intensity calculation
        const maxSpending = Math.max(...Object.values(dailySpending), 1);

        // Generate 12 weeks of data (going back from today)
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (12 * 7) + 1);

        // Align to start of week (Sunday)
        while (startDate.getDay() !== 0) {
            startDate.setDate(startDate.getDate() - 1);
        }

        for (let week = 0; week < 12; week++) {
            const weekData: DayData[] = [];
            for (let day = 0; day < 7; day++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + (week * 7) + day);

                const dateStr = date.toISOString().split("T")[0];
                const amount = dailySpending[dateStr] || 0;

                // Calculate intensity (0-4)
                let intensity = 0;
                if (amount > 0) {
                    const ratio = amount / maxSpending;
                    if (ratio >= 0.75) intensity = 4;
                    else if (ratio >= 0.5) intensity = 3;
                    else if (ratio >= 0.25) intensity = 2;
                    else intensity = 1;
                }

                weekData.push({ date, amount, intensity });
            }
            weeks.push(weekData);
        }

        return weeks;
    }, [transactions]);

    // Calculate totals
    const { thisWeekTotal, lastWeekTotal } = useMemo(() => {
        const now = new Date();
        const startOfThisWeek = new Date(now);
        startOfThisWeek.setDate(now.getDate() - now.getDay());
        startOfThisWeek.setHours(0, 0, 0, 0);

        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

        let thisWeek = 0;
        let lastWeek = 0;

        transactions
            .filter((t) => t.type === "expense")
            .forEach((t) => {
                const date = new Date(t.date);
                if (date >= startOfThisWeek) {
                    thisWeek += Math.abs(t.amount);
                } else if (date >= startOfLastWeek && date < startOfThisWeek) {
                    lastWeek += Math.abs(t.amount);
                }
            });

        return { thisWeekTotal: thisWeek, lastWeekTotal: lastWeek };
    }, [transactions]);

    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Get intensity color
    const getIntensityColor = (intensity: number, date: Date) => {
        const now = new Date();
        if (date > now) return "bg-transparent";

        switch (intensity) {
            case 0: return "bg-muted/30 dark:bg-muted/20";
            case 1: return "bg-rose-200 dark:bg-rose-900/50";
            case 2: return "bg-rose-400 dark:bg-rose-700";
            case 3: return "bg-rose-500 dark:bg-rose-600";
            case 4: return "bg-rose-600 dark:bg-rose-500";
            default: return "bg-muted/30";
        }
    };

    // Get month labels
    const monthLabels = useMemo(() => {
        const labels: { month: string; weekIndex: number }[] = [];
        let lastMonth = -1;

        heatmapData.forEach((week, weekIndex) => {
            const firstDay = week[0];
            const month = firstDay.date.getMonth();
            if (month !== lastMonth) {
                labels.push({ month: months[month], weekIndex });
                lastMonth = month;
            }
        });

        return labels;
    }, [heatmapData]);

    return (
        <TiltCard className="rounded-3xl" tiltAmount={5} scale={1.01}>
            <div className="rounded-3xl glass-card overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-red-600 text-white ios-shadow">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight">
                                    Spending Activity
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Last 12 weeks
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        {hasData && (
                            <div className="text-right">
                                <p className="text-lg font-bold tabular-nums">
                                    {formatCurrency(thisWeekTotal, preferredCurrency)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    This week
                                    {lastWeekTotal > 0 && (
                                        <span className={cn(
                                            "ml-1",
                                            thisWeekTotal > lastWeekTotal ? "text-rose-500" : "text-emerald-500"
                                        )}>
                                            ({thisWeekTotal > lastWeekTotal ? "+" : ""}
                                            {(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100).toFixed(0)}%)
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Heatmap Grid */}
                <div className="px-6 pb-6">
                    {!hasData ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3 animate-float">
                                <Calendar className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No spending data
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Add transactions to see activity
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Month labels */}
                            <div className="flex ml-6 text-[10px] text-muted-foreground">
                                {monthLabels.map((label, i) => (
                                    <div
                                        key={i}
                                        className="absolute"
                                        style={{ left: `${(label.weekIndex / 12) * 100}%` }}
                                    >
                                        {label.month}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-1.5">
                                {/* Day labels */}
                                <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground pr-1">
                                    {weekDays.map((day, i) => (
                                        <div key={i} className="h-3 flex items-center justify-end w-4">
                                            {i % 2 === 1 && day}
                                        </div>
                                    ))}
                                </div>

                                {/* Grid */}
                                <div className="flex gap-0.5 flex-1">
                                    {heatmapData.map((week, weekIndex) => (
                                        <div key={weekIndex} className="flex flex-col gap-0.5 flex-1">
                                            {week.map((day, dayIndex) => {
                                                const isToday = day.date.toDateString() === new Date().toDateString();
                                                const isFuture = day.date > new Date();

                                                return (
                                                    <div
                                                        key={dayIndex}
                                                        className={cn(
                                                            "aspect-square rounded-sm ios-transition",
                                                            "hover:scale-150 hover:z-10 cursor-pointer",
                                                            "relative group",
                                                            getIntensityColor(day.intensity, day.date),
                                                            isToday && "ring-1 ring-primary ring-offset-1 ring-offset-background"
                                                        )}
                                                        title={`${day.date.toLocaleDateString()}: ${formatCurrency(day.amount, preferredCurrency)}`}
                                                    >
                                                        {/* Tooltip */}
                                                        {!isFuture && (
                                                            <div className={cn(
                                                                "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
                                                                "glass rounded-lg px-2 py-1 text-xs whitespace-nowrap",
                                                                "opacity-0 group-hover:opacity-100 pointer-events-none",
                                                                "ios-transition z-20",
                                                                "border border-border/50 ios-shadow"
                                                            )}>
                                                                <p className="font-medium">
                                                                    {day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                                                                </p>
                                                                <p className="text-muted-foreground">
                                                                    {day.amount > 0
                                                                        ? formatCurrency(day.amount, preferredCurrency)
                                                                        : "No spending"
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex items-center justify-end gap-1 mt-3">
                                <span className="text-[10px] text-muted-foreground mr-1">Less</span>
                                {[0, 1, 2, 3, 4].map((intensity) => (
                                    <div
                                        key={intensity}
                                        className={cn(
                                            "h-3 w-3 rounded-sm",
                                            getIntensityColor(intensity, new Date(Date.now() - 1000))
                                        )}
                                    />
                                ))}
                                <span className="text-[10px] text-muted-foreground ml-1">More</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TiltCard>
    );
}
