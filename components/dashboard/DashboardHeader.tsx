"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";
import { NotificationsButton } from "@/components/NotificationsButton";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                "pb-2"
            )}
        >
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {title}
                </h1>
                {subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Action buttons with glass effect */}
            <div
                className={cn(
                    "flex items-center gap-1 p-1.5 rounded-2xl",
                    "glass-subtle"
                )}
            >
                {/* Search Button with glass hover */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-xl",
                        "border border-transparent",
                        "hover-glass-light",
                        "active:scale-95"
                    )}
                >
                    <Search className="h-[18px] w-[18px]" />
                    <span className="sr-only">Search</span>
                </Button>

                {/* Notifications Button */}
                <NotificationsButton />

                {/* Divider */}
                <div className="h-6 w-px bg-border/50 mx-1" />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Profile Button with Clerk Integration */}
                <ProfileButton />
            </div>
        </div>
    );
}
