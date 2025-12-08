"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileButton } from "@/components/ProfileButton";
import { NotificationsButton } from "@/components/NotificationsButton";
import { Search, Menu, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
    onMobileMenuClick?: () => void;
}

export function TopBar({ onMobileMenuClick }: TopBarProps) {
    // Trigger command palette
    const handleSearchClick = () => {
        // Simulate Cmd+K keypress to open command palette
        const event = new KeyboardEvent("keydown", {
            key: "k",
            metaKey: true,
            ctrlKey: true,
            bubbles: true,
        });
        document.dispatchEvent(event);
    };

    return (
        <header
            className={cn(
                "sticky top-0 z-30",
                "w-full",
                "glass ios-shadow",
                "border-b border-border/50",
                "ios-transition"
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Left side - Mobile menu button (shows on mobile when no sidebar) */}
                    <div className="flex items-center gap-3 lg:hidden">
                        {onMobileMenuClick && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onMobileMenuClick}
                                className={cn(
                                    "h-10 w-10 rounded-xl",
                                    "border border-transparent",
                                    "hover-glass-light",
                                    "active:scale-95"
                                )}
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        )}
                    </div>

                    {/* Spacer for desktop - pushes actions to right */}
                    <div className="hidden lg:block flex-1" />

                    {/* Right side - Actions */}
                    <div
                        className={cn(
                            "flex items-center gap-1 p-1.5 rounded-2xl",
                            "glass-subtle"
                        )}
                    >
                        {/* Search Button - Opens Command Palette */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSearchClick}
                            className={cn(
                                "h-10 rounded-xl gap-2 px-3",
                                "border border-transparent",
                                "hover-glass-light",
                                "active:scale-95",
                                "hidden sm:flex"
                            )}
                        >
                            <Search className="h-[18px] w-[18px]" />
                            <span className="text-sm text-muted-foreground">Search...</span>
                            <kbd className="ml-2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/30 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                                <Command className="h-3 w-3" />K
                            </kbd>
                        </Button>

                        {/* Mobile Search Icon */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSearchClick}
                            className={cn(
                                "h-10 w-10 rounded-xl sm:hidden",
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

                        {/* Profile Button */}
                        <ProfileButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
