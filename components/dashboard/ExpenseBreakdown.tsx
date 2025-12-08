"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { PieChart as PieChartIcon } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";

interface Transaction {
    id: string;
    amount: number;
    category: string;
    type: "income" | "expense";
}

interface ExpenseBreakdownProps {
    transactions?: Transaction[];
    hasData?: boolean;
}

// Predefined colors for categories
const CHART_COLORS = [
    "#8b5cf6", // violet
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ec4899", // pink
    "#6366f1", // indigo
    "#14b8a6", // teal
    "#f97316", // orange
    "#84cc16", // lime
    "#ef4444", // red
    "#06b6d4", // cyan
    "#a855f7", // purple
];

interface CategoryData {
    name: string;
    value: number;
    percentage: number;
    color: string;
}

export function ExpenseBreakdown({ transactions = [], hasData = false }: ExpenseBreakdownProps) {
    const { preferredCurrency } = useUserSettings();

    // Calculate category breakdown
    const categoryData = useMemo<CategoryData[]>(() => {
        if (!hasData || transactions.length === 0) return [];

        // Get current month transactions only
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthExpenses = transactions.filter((t) => {
            if (t.type !== "expense") return false;
            // If date is available (not guaranteed in our interface)
            return true; // For now, include all expenses
        });

        // Group by category
        const categoryTotals: Record<string, number> = {};
        thisMonthExpenses.forEach((t) => {
            const category = t.category || "Other";
            categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
        });

        // Calculate total
        const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

        // Convert to array and sort by value
        const data = Object.entries(categoryTotals)
            .map(([name, value], index) => ({
                name,
                value,
                percentage: total > 0 ? (value / total) * 100 : 0,
                color: CHART_COLORS[index % CHART_COLORS.length],
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8); // Max 8 categories

        return data;
    }, [transactions, hasData]);

    const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.value, 0);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="glass rounded-xl p-3 border border-border/50 ios-shadow">
                    <p className="text-sm font-semibold">{data.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatCurrency(data.value, preferredCurrency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {data.percentage.toFixed(1)}% of total
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <TiltCard className="rounded-3xl h-full" tiltAmount={5} scale={1.01}>
            <div className="rounded-3xl glass-card overflow-hidden h-full">
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 text-white ios-shadow">
                            <PieChartIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">
                                Expense Breakdown
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {hasData ? "Where your money goes" : "No expenses yet"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="px-6 pb-6">
                    {!hasData || categoryData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3 animate-float">
                                <PieChartIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No expense data
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Add transactions to see breakdown
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            {/* Pie Chart */}
                            <div className="relative w-48 h-48 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            animationBegin={0}
                                            animationDuration={1000}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                    className="hover:opacity-80 ios-transition cursor-pointer"
                                                    stroke="none"
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-lg font-bold">
                                        {formatCurrency(totalExpenses, preferredCurrency)}
                                    </p>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex-1 space-y-2 w-full">
                                {categoryData.map((category) => (
                                    <div
                                        key={category.name}
                                        className="flex items-center gap-3 p-2 rounded-xl hover-glass ios-transition cursor-pointer group"
                                    >
                                        <div
                                            className="h-3 w-3 rounded-full ios-transition group-hover:scale-125"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {category.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold tabular-nums">
                                                {category.percentage.toFixed(0)}%
                                            </p>
                                            <p className="text-xs text-muted-foreground tabular-nums">
                                                {formatCurrency(category.value, preferredCurrency)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TiltCard>
    );
}
