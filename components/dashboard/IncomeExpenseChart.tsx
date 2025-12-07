"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

// Mock data - will be replaced with Supabase data later
const mockMonthlyData = [
    { month: "Jul", income: 4200, expenses: 3100 },
    { month: "Aug", income: 4500, expenses: 3400 },
    { month: "Sep", income: 4800, expenses: 2900 },
    { month: "Oct", income: 5200, expenses: 3600 },
    { month: "Nov", income: 5400, expenses: 3200 },
    { month: "Dec", income: 5800, expenses: 2847 },
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        color: string;
    }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div
                className={cn(
                    "rounded-2xl p-4 min-w-[140px]",
                    "glass ios-shadow",
                    "animate-in fade-in-0 zoom-in-95 duration-200"
                )}
            >
                <p className="text-sm font-semibold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between gap-4 text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="capitalize text-muted-foreground text-xs">
                                {entry.dataKey}
                            </span>
                        </div>
                        <span className="font-semibold tabular-nums">
                            ${entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

export function IncomeExpenseChart() {
    return (
        <div className="rounded-3xl glass-card overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 pb-2">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                        Income vs Expenses
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Monthly comparison for the last 6 months
                    </p>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                        <span className="text-xs text-muted-foreground font-medium">
                            Income
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-rose-400 to-rose-600" />
                        <span className="text-xs text-muted-foreground font-medium">
                            Expenses
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="px-4 pb-6">
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={mockMonthlyData}
                            margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient
                                    id="expenseGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="4 4"
                                stroke="currentColor"
                                className="text-border/30"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "currentColor",
                                    fontSize: 12,
                                    className: "text-muted-foreground",
                                }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "currentColor",
                                    fontSize: 12,
                                    className: "text-muted-foreground",
                                }}
                                tickFormatter={(value) => `$${value / 1000}k`}
                                dx={-5}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{
                                    stroke: "currentColor",
                                    strokeWidth: 1,
                                    strokeDasharray: "4 4",
                                    className: "text-border",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fill="url(#incomeGradient)"
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill: "#10b981",
                                    stroke: "white",
                                    strokeWidth: 2,
                                    className: "drop-shadow-lg",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                stroke="#f43f5e"
                                strokeWidth={2.5}
                                fill="url(#expenseGradient)"
                                dot={false}
                                activeDot={{
                                    r: 6,
                                    fill: "#f43f5e",
                                    stroke: "white",
                                    strokeWidth: 2,
                                    className: "drop-shadow-lg",
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
