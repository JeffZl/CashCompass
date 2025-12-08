"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CreditCard,
    ArrowLeftRight,
    Tag,
    Wallet,
    PiggyBank,
    Settings,
    ChevronLeft,
    Menu,
    X,
    BarChart3,
    Target,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Accounts",
        href: "/accounts",
        icon: CreditCard,
    },
    {
        title: "Transactions",
        href: "/transactions",
        icon: ArrowLeftRight,
    },
    {
        title: "Categories",
        href: "/categories",
        icon: Tag,
    },
    {
        title: "Budgets",
        href: "/budgets",
        icon: Wallet,
    },
    {
        title: "Goals",
        href: "/goals",
        icon: Target,
    },
    {
        title: "Reports",
        href: "/reports",
        icon: BarChart3,
    },
    {
        title: "Calendar",
        href: "/calendar",
        icon: Calendar,
    },
];

const bottomNavItems = [
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button - iOS Style with glass hover */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "fixed top-4 left-4 z-50 lg:hidden",
                    "h-10 w-10 rounded-2xl",
                    "glass ios-shadow",
                    "hover-glass-strong",
                    "active:scale-95"
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <Menu className="h-5 w-5" />
                )}
            </Button>

            {/* Mobile Overlay with blur */}
            <div
                className={cn(
                    "fixed inset-0 z-40 lg:hidden ios-transition",
                    mobileOpen
                        ? "bg-black/30 backdrop-blur-sm opacity-100"
                        : "opacity-0 pointer-events-none"
                )}
                onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar - iOS Glassmorphism */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen",
                    "glass ios-shadow",
                    "ios-spring",
                    collapsed ? "w-[80px]" : "w-72",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="flex h-full flex-col p-4">
                    {/* Logo / Brand */}
                    <div
                        className={cn(
                            "flex h-14 items-center gap-3 px-2 mb-2",
                            collapsed && "justify-center px-0"
                        )}
                    >
                        <div
                            className={cn(
                                "flex items-center justify-center rounded-2xl",
                                "bg-gradient-to-br from-blue-500 to-indigo-600",
                                "ios-shadow ios-transition",
                                collapsed ? "h-12 w-12" : "h-11 w-11"
                            )}
                        >
                            <PiggyBank className="h-6 w-6 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold tracking-tight">
                                    CashCompass
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    Finance Tracker
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Navigation - Glass hover on each item */}
                    <nav className="flex-1 space-y-1 py-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                                        "border border-transparent",
                                        // Glass hover effect
                                        !isActive && "hover-glass",
                                        // Active state uses permanent glass
                                        isActive
                                            ? "glass-card ios-shadow text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                        // Press effect
                                        "active:scale-[0.98]",
                                        collapsed && "justify-center px-0"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-xl ios-transition",
                                            isActive
                                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ios-shadow"
                                                : "bg-muted/50 group-hover:bg-muted"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    {!collapsed && <span>{item.title}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Navigation */}
                    <div className="mt-auto space-y-1 pt-4 border-t border-border/50">
                        {bottomNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium",
                                        "border border-transparent",
                                        !isActive && "hover-glass",
                                        isActive
                                            ? "glass-card ios-shadow text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                        "active:scale-[0.98]",
                                        collapsed && "justify-center px-0"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-xl ios-transition",
                                            isActive
                                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                                : "bg-muted/50 group-hover:bg-muted"
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    {!collapsed && <span>{item.title}</span>}
                                </Link>
                            );
                        })}

                        {/* Collapse Button with glass hover */}
                        <Button
                            variant="ghost"
                            className={cn(
                                "mt-3 hidden w-full lg:flex items-center gap-2 rounded-2xl py-3 h-auto",
                                "text-muted-foreground hover:text-foreground",
                                "border border-transparent",
                                "hover-glass",
                                "active:scale-[0.98]",
                                collapsed && "justify-center px-0"
                            )}
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50">
                                <ChevronLeft
                                    className={cn(
                                        "h-4 w-4 ios-transition",
                                        collapsed && "rotate-180"
                                    )}
                                />
                            </div>
                            {!collapsed && <span className="text-sm font-medium">Collapse</span>}
                        </Button>
                    </div>
                </div>
            </aside>
        </>
    );
}
