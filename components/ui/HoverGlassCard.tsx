"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type GlassIntensity = "light" | "default" | "strong";

interface HoverGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Glass effect intensity on hover */
    intensity?: GlassIntensity;
    /** Whether to apply scale effect on hover */
    scale?: boolean;
    /** Whether to apply press (active) effect */
    pressable?: boolean;
    /** Card padding preset */
    padding?: "none" | "sm" | "md" | "lg";
    /** Border radius preset */
    rounded?: "lg" | "xl" | "2xl" | "3xl";
    /** Whether to show border */
    bordered?: boolean;
    /** As child element (for composition) */
    asChild?: boolean;
}

const intensityClasses: Record<GlassIntensity, string> = {
    light: "hover-glass-light",
    default: "hover-glass",
    strong: "hover-glass-strong",
};

const paddingClasses = {
    none: "",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
};

const roundedClasses = {
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
};

/**
 * HoverGlassCard - A reusable component that applies frosted glass effect on hover.
 *
 * @example
 * ```tsx
 * <HoverGlassCard intensity="strong" scale pressable>
 *   <p>Card content</p>
 * </HoverGlassCard>
 * ```
 */
export const HoverGlassCard = forwardRef<HTMLDivElement, HoverGlassCardProps>(
    (
        {
            className,
            intensity = "default",
            scale = false,
            pressable = false,
            padding = "md",
            rounded = "2xl",
            bordered = true,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    // Base styles
                    "relative overflow-hidden",
                    roundedClasses[rounded],
                    paddingClasses[padding],
                    // Border
                    bordered && "border border-transparent",
                    // Glass hover effect
                    intensityClasses[intensity],
                    // Optional scale on hover
                    scale && "hover:scale-[1.02] hover:-translate-y-0.5",
                    // Optional press effect
                    pressable && "active:scale-[0.98]",
                    // Cursor
                    (props.onClick || pressable) && "cursor-pointer",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

HoverGlassCard.displayName = "HoverGlassCard";

/**
 * HoverGlassItem - A lighter version for list items and smaller interactive elements.
 */
interface HoverGlassItemProps extends React.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
}

export const HoverGlassItem = forwardRef<HTMLDivElement, HoverGlassItemProps>(
    ({ className, active, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative rounded-xl p-3",
                    "border border-transparent",
                    "hover-glass",
                    "active:scale-[0.98]",
                    "cursor-pointer",
                    active && "glass-subtle",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

HoverGlassItem.displayName = "HoverGlassItem";

/**
 * HoverGlassButton - Glass hover effect for button-like elements.
 */
interface HoverGlassButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    size?: "sm" | "md" | "lg";
}

export const HoverGlassButton = forwardRef<
    HTMLButtonElement,
    HoverGlassButtonProps
>(({ className, size = "md", children, ...props }, ref) => {
    const sizeClasses = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
    };

    return (
        <button
            ref={ref}
            className={cn(
                "relative inline-flex items-center justify-center gap-2",
                "rounded-xl font-medium",
                sizeClasses[size],
                "border border-transparent",
                "hover-glass",
                "active:scale-95",
                "disabled:opacity-50 disabled:pointer-events-none",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});

HoverGlassButton.displayName = "HoverGlassButton";
