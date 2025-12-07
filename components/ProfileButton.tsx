"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    User,
    Settings,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileButton() {
    const { user, isSignedIn, isLoaded } = useUser();
    const { signOut } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close dropdown on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    // Don't render if not loaded or not signed in
    if (!isLoaded || !isSignedIn) {
        return null;
    }

    const userInitials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "U";
    const displayName = user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "User";

    return (
        <div ref={dropdownRef} className="relative">
            {/* Profile Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 p-1.5 pr-3 rounded-2xl",
                    "border border-transparent",
                    "hover-glass",
                    "active:scale-[0.98]",
                    "cursor-pointer",
                    isOpen && "glass"
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Avatar className="h-8 w-8 rounded-xl ring-2 ring-background">
                    <AvatarImage
                        src={user?.imageUrl}
                        alt={displayName}
                        className="rounded-xl"
                    />
                    <AvatarFallback
                        className={cn(
                            "rounded-xl text-xs font-semibold text-white",
                            "bg-gradient-to-br from-violet-500 to-purple-600"
                        )}
                    >
                        {userInitials}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                    {displayName}
                </span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-muted-foreground hidden sm:block",
                        "ios-transition",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={cn(
                    "absolute right-0 mt-2 w-56 z-50",
                    "rounded-2xl p-2",
                    "glass ios-shadow",
                    "border border-border/50",
                    // Animation
                    "ios-transition origin-top-right",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
            >
                {/* User Info Header */}
                <div className="px-3 py-2 mb-1">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-xl">
                            <AvatarImage
                                src={user?.imageUrl}
                                alt={displayName}
                                className="rounded-xl"
                            />
                            <AvatarFallback
                                className={cn(
                                    "rounded-xl text-sm font-semibold text-white",
                                    "bg-gradient-to-br from-violet-500 to-purple-600"
                                )}
                            >
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">
                                {user?.fullName ?? displayName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/50 mx-2 my-1" />

                {/* Menu Items */}
                <nav className="space-y-0.5">
                    <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                            "text-sm font-medium",
                            "border border-transparent",
                            "hover-glass",
                            "active:scale-[0.98]"
                        )}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                            <User className="h-4 w-4" />
                        </div>
                        <span>Profile</span>
                    </Link>

                    <Link
                        href="/settings"
                        onClick={() => setIsOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                            "text-sm font-medium",
                            "border border-transparent",
                            "hover-glass",
                            "active:scale-[0.98]"
                        )}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                            <Settings className="h-4 w-4" />
                        </div>
                        <span>Settings</span>
                    </Link>
                </nav>

                {/* Divider */}
                <div className="h-px bg-border/50 mx-2 my-1" />

                {/* Sign Out */}
                <button
                    onClick={() => {
                        setIsOpen(false);
                        signOut();
                    }}
                    className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl",
                        "text-sm font-medium text-rose-600 dark:text-rose-400",
                        "border border-transparent",
                        "hover-glass",
                        "active:scale-[0.98]"
                    )}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
}
