"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}

/**
 * PageHeader - A reusable component for page titles and subtitles.
 * Use this at the top of each page to display the page name and description.
 * Global actions (Profile, Notifications, Theme) are handled by the TopBar.
 */
export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
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

            {/* Optional actions specific to the page */}
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    );
}
