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
import { BarChart3 } from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { TiltCard } from "@/components/ui/TiltCard";

interface ChartData {
    month: string;
    income: number;
    expenses: number;
}

interface IncomeExpenseChartProps {
    data?: ChartData[];
    hasData?: boolean;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        color: string;
    }>;
    label?: string;
    currencyCode: string;
}

function CustomTooltip({ active, payload, label, currencyCode }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl glass-card p-3 ios-shadow">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs capitalize">{entry.dataKey}:</span>
                        <span className="text-xs font-semibold">
                            {formatCurrency(entry.value, currencyCode)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
}

export function IncomeExpenseChart({ data = [], hasData = false }: IncomeExpenseChartProps) {
    const { preferredCurrency } = useUserSettings();
    const currencySymbol = getCurrencySymbol(preferredCurrency);

    // Check if we have any actual data in the chart
    const hasChartData = data.some(d => d.income > 0 || d.expenses > 0);

    // Format Y-axis values with the correct currency
    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${currencySymbol}${(value / 1000).toFixed(0)}k`;
        }
        return `${currencySymbol}${value}`;
    };

    return (
        <TiltCard className="rounded-3xl h-full" tiltAmount={5} scale={1.01}>
            <div className="rounded-3xl glass-card overflow-hidden h-full">
                {/* Header */}
                <div className="p-6 pb-2">
                    <h3 className="text-lg font-semibold tracking-tight">
                        Income vs Expenses
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {hasData && hasChartData ? "Last 6 months overview" : "No data to display yet"}
                    </p>
                </div>

                {/* Chart */}
                <div className="h-80 px-4 pb-6">
                    {!hasData || !hasChartData ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <BarChart3 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No chart data available
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Add transactions to see your income vs expenses chart
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data as any}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient
                                        id="colorIncome"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#10b981"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#10b981"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                    <linearGradient
                                        id="colorExpenses"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#f43f5e"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#f43f5e"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    className="stroke-border/30"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs fill-muted-foreground"
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs fill-muted-foreground"
                                    tickFormatter={formatYAxis}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip currencyCode={preferredCurrency} />} />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#f43f5e"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorExpenses)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Legend */}
                {hasData && hasChartData && (
                    <div className="flex items-center justify-center gap-6 pb-6 px-6">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-emerald-500" />
                            <span className="text-xs text-muted-foreground">Income</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-rose-500" />
                            <span className="text-xs text-muted-foreground">Expenses</span>
                        </div>
                    </div>
                )}
            </div>
        </TiltCard>
    );
}
