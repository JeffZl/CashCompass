"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
    title: string;
    value: string;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: "default" | "gradient";
    gradientFrom?: string;
    gradientTo?: string;
}

export function SummaryCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    variant = "default",
    gradientFrom = "from-blue-500",
    gradientTo = "to-indigo-600",
}: SummaryCardProps) {
    const isGradient = variant === "gradient";

    return (
        <Card
            className={cn(
                "group relative overflow-hidden rounded-3xl border-0",
                "cursor-pointer",
                // Glass hover for non-gradient cards
                !isGradient && "hover-glass-strong",
                // Active press effect
                "active:scale-[0.98]",
                // Gradient cards have different hover
                isGradient
                    ? `bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white ios-shadow hover:shadow-2xl hover:-translate-y-1 ios-transition`
                    : "glass-card"
            )}
        >
            {/* Decorative glass orbs - iOS style */}
            <div
                className={cn(
                    "absolute -right-6 -top-6 h-24 w-24 rounded-full",
                    "ios-transition group-hover:scale-150",
                    isGradient ? "bg-white/20" : "bg-primary/5"
                )}
            />
            <div
                className={cn(
                    "absolute -right-2 -top-2 h-12 w-12 rounded-full",
                    "ios-transition group-hover:scale-150",
                    isGradient ? "bg-white/10" : "bg-primary/3"
                )}
            />

            <CardContent className="relative p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                        <p
                            className={cn(
                                "text-xs font-medium uppercase tracking-wider",
                                isGradient ? "text-white/80" : "text-muted-foreground"
                            )}
                        >
                            {title}
                        </p>
                        <p className="text-3xl font-bold tracking-tight">{value}</p>
                        {(description || trend) && (
                            <div className="mt-3 flex items-center gap-2">
                                {trend && (
                                    <span
                                        className={cn(
                                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                                            "backdrop-blur-sm",
                                            isGradient
                                                ? "bg-white/20 text-white"
                                                : trend.isPositive
                                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                        )}
                                    >
                                        <span className="text-[10px]">
                                            {trend.isPositive ? "▲" : "▼"}
                                        </span>
                                        {Math.abs(trend.value)}%
                                    </span>
                                )}
                                {description && (
                                    <span
                                        className={cn(
                                            "text-xs",
                                            isGradient ? "text-white/70" : "text-muted-foreground"
                                        )}
                                    >
                                        {description}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Icon with glass effect */}
                    <div
                        className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-2xl",
                            "ios-transition group-hover:scale-110 group-hover:rotate-6",
                            isGradient
                                ? "bg-white/20 backdrop-blur-sm"
                                : "glass-subtle"
                        )}
                    >
                        <Icon
                            className={cn(
                                "h-7 w-7",
                                isGradient ? "text-white" : "text-foreground"
                            )}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
