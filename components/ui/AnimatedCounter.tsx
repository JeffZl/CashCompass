"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    formatValue?: (value: number) => string;
}

/**
 * AnimatedCounter - A component that animates numbers counting up/down
 * Uses easeOutExpo for a satisfying animation curve
 */
export function AnimatedCounter({
    value,
    duration = 1000,
    decimals = 0,
    prefix = "",
    suffix = "",
    className,
    formatValue,
}: AnimatedCounterProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const previousValue = useRef(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const startValue = previousValue.current;
        const endValue = value;
        const startTime = performance.now();

        // Easing function: easeOutExpo
        const easeOutExpo = (t: number): number => {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        };

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);

            const currentValue = startValue + (endValue - startValue) * easedProgress;
            setDisplayValue(currentValue);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                previousValue.current = endValue;
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [value, duration]);

    const formattedValue = formatValue
        ? formatValue(displayValue)
        : displayValue.toFixed(decimals);

    return (
        <span className={cn("tabular-nums", className)}>
            {prefix}
            {formattedValue}
            {suffix}
        </span>
    );
}

interface AnimatedCurrencyProps {
    value: number;
    currency?: string;
    duration?: number;
    className?: string;
    showSign?: boolean;
}

/**
 * AnimatedCurrency - Animated number with currency formatting
 */
export function AnimatedCurrency({
    value,
    currency = "USD",
    duration = 1000,
    className,
    showSign = false,
}: AnimatedCurrencyProps) {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const formatValue = (v: number) => {
        const formatted = formatter.format(Math.abs(v));
        if (showSign && v > 0) return `+${formatted}`;
        if (showSign && v < 0) return `-${formatted}`;
        return formatted;
    };

    return (
        <AnimatedCounter
            value={value}
            duration={duration}
            formatValue={formatValue}
            className={className}
        />
    );
}

interface AnimatedPercentageProps {
    value: number;
    duration?: number;
    decimals?: number;
    className?: string;
    showSign?: boolean;
}

/**
 * AnimatedPercentage - Animated percentage display
 */
export function AnimatedPercentage({
    value,
    duration = 1000,
    decimals = 1,
    className,
    showSign = false,
}: AnimatedPercentageProps) {
    const formatValue = (v: number) => {
        const sign = showSign && v > 0 ? "+" : "";
        return `${sign}${v.toFixed(decimals)}%`;
    };

    return (
        <AnimatedCounter
            value={value}
            duration={duration}
            formatValue={formatValue}
            className={className}
        />
    );
}
