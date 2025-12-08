"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { useBudgets, useTransactions } from "@/lib/supabase";
import {
    Bell,
    X,
    Check,
    CheckCheck,
    CreditCard,
    TrendingUp,
    AlertTriangle,
    Wallet,
    BellOff,
    Sparkles,
    Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
    id: string;
    title: string;
    description: string;
    timestamp: Date;
    isRead: boolean;
    type: "transaction" | "alert" | "success" | "info";
}

function getNotificationIcon(type: Notification["type"]) {
    switch (type) {
        case "transaction":
            return CreditCard;
        case "alert":
            return AlertTriangle;
        case "success":
            return TrendingUp;
        case "info":
        default:
            return Wallet;
    }
}

function getNotificationColor(type: Notification["type"]) {
    switch (type) {
        case "transaction":
            return "from-blue-400 to-blue-600";
        case "alert":
            return "from-amber-400 to-amber-600";
        case "success":
            return "from-emerald-400 to-emerald-600";
        case "info":
        default:
            return "from-violet-400 to-violet-600";
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export function NotificationsButton() {
    const { preferredCurrency } = useUserSettings();
    const { budgets } = useBudgets();
    const { transactions } = useTransactions();

    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Generate dynamic notifications based on real data
    const notifications = useMemo<Notification[]>(() => {
        const notifs: Notification[] = [];
        const now = new Date();

        // Budget alerts - budgets over 70% used
        budgets.forEach((budget: any) => {
            if (!budget.category) return;

            const percentUsed = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
            const notifId = `budget-alert-${budget.id}`;

            if (dismissedIds.has(notifId)) return;

            if (percentUsed >= 100) {
                notifs.push({
                    id: notifId,
                    title: "Budget Exceeded!",
                    description: `You've exceeded your ${budget.category.name} budget by ${formatCurrency(budget.spent - budget.amount, preferredCurrency)}`,
                    timestamp: now,
                    isRead: readIds.has(notifId),
                    type: "alert",
                });
            } else if (percentUsed >= 80) {
                notifs.push({
                    id: notifId,
                    title: "Budget Warning",
                    description: `You've used ${percentUsed.toFixed(0)}% of your ${budget.category.name} budget`,
                    timestamp: now,
                    isRead: readIds.has(notifId),
                    type: "alert",
                });
            }
        });

        // Recent transaction notifications (last 24 hours)
        const recentTransactions = transactions
            .filter((t: any) => {
                const txDate = new Date(t.date);
                const hoursDiff = (now.getTime() - txDate.getTime()) / (1000 * 60 * 60);
                return hoursDiff <= 24;
            })
            .slice(0, 3); // Max 3 recent transaction notifications

        recentTransactions.forEach((tx: any) => {
            const notifId = `tx-${tx.id}`;
            if (dismissedIds.has(notifId)) return;

            notifs.push({
                id: notifId,
                title: tx.type === "income" ? "Income Received" : "Expense Added",
                description: `${tx.description || tx.category?.name || 'Transaction'}: ${formatCurrency(Math.abs(tx.amount), tx.currency || preferredCurrency)}`,
                timestamp: new Date(tx.date),
                isRead: readIds.has(notifId),
                type: "transaction",
            });
        });

        // Savings milestone check
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const thisMonthTx = transactions.filter((t: any) => {
            const d = new Date(t.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });

        const income = thisMonthTx
            .filter((t: any) => t.type === "income")
            .reduce((sum, t: any) => sum + Math.abs(t.amount), 0);
        const expenses = thisMonthTx
            .filter((t: any) => t.type === "expense")
            .reduce((sum, t: any) => sum + Math.abs(t.amount), 0);
        const savings = income - expenses;
        const savingsRate = income > 0 ? (savings / income) * 100 : 0;

        const savingsNotifId = `savings-${thisMonth}-${thisYear}`;
        if (savingsRate >= 20 && !dismissedIds.has(savingsNotifId)) {
            notifs.push({
                id: savingsNotifId,
                title: "Great Savings Rate!",
                description: `You're saving ${savingsRate.toFixed(0)}% of your income this month. Keep it up!`,
                timestamp: now,
                isRead: readIds.has(savingsNotifId),
                type: "success",
            });
        }

        // Sort by timestamp (newest first)
        return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [budgets, transactions, preferredCurrency, dismissedIds, readIds]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

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

    const markAsRead = (id: string) => {
        setReadIds(prev => new Set([...prev, id]));
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadIds(prev => new Set([...prev, ...allIds]));
    };

    const deleteNotification = (id: string) => {
        setDismissedIds(prev => new Set([...prev, id]));
    };

    const clearAll = () => {
        const allIds = notifications.map(n => n.id);
        setDismissedIds(prev => new Set([...prev, ...allIds]));
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative h-10 w-10 rounded-xl",
                    "border border-transparent",
                    "hover-glass-light",
                    "active:scale-95",
                    isOpen && "glass"
                )}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Bell className={cn("h-[18px] w-[18px]", unreadCount > 0 && "animate-pulse")} />

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span
                        className={cn(
                            "absolute -right-0.5 -top-0.5",
                            "flex h-5 w-5 items-center justify-center",
                            "rounded-full bg-rose-500 text-[10px] font-semibold text-white",
                            "ring-2 ring-background",
                            "animate-in zoom-in-50 duration-200"
                        )}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
                <span className="sr-only">
                    {unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
                </span>
            </Button>

            {/* Dropdown */}
            <div
                className={cn(
                    "absolute right-0 mt-2 w-80 sm:w-96 z-50",
                    "rounded-2xl",
                    "glass ios-shadow",
                    "border border-border/50",
                    // Animation
                    "ios-transition origin-top-right",
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 pb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className={cn(
                                        "h-7 px-2 text-xs rounded-lg",
                                        "text-muted-foreground hover:text-foreground",
                                        "hover-glass-light"
                                    )}
                                >
                                    <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="h-px bg-border/50 mx-3" />

                {/* Notifications List */}
                {notifications.length > 0 ? (
                    <ScrollArea className="h-[320px]">
                        <div className="p-2 space-y-1">
                            {notifications.map((notification) => {
                                const Icon = getNotificationIcon(notification.type);
                                const colorClass = getNotificationColor(notification.type);

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => markAsRead(notification.id)}
                                        className={cn(
                                            "group relative flex items-start gap-3 p-3 rounded-xl",
                                            "border border-transparent",
                                            "hover-glass",
                                            "active:scale-[0.98]",
                                            "cursor-pointer",
                                            !notification.isRead && "bg-primary/[0.03]"
                                        )}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={cn(
                                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                                                "bg-gradient-to-br text-white",
                                                colorClass,
                                                "ios-transition group-hover:scale-105"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className={cn(
                                                        "text-sm leading-tight",
                                                        notification.isRead
                                                            ? "font-medium text-foreground/80"
                                                            : "font-semibold text-foreground"
                                                    )}
                                                >
                                                    {notification.title}
                                                </p>

                                                {/* Unread indicator */}
                                                {!notification.isRead && (
                                                    <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.description}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/70">
                                                {formatTimeAgo(notification.timestamp)}
                                            </p>
                                        </div>

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className={cn(
                                                "absolute right-2 top-2",
                                                "flex h-6 w-6 items-center justify-center rounded-lg",
                                                "text-muted-foreground/50 hover:text-rose-500",
                                                "hover:bg-rose-500/10",
                                                "opacity-0 group-hover:opacity-100",
                                                "ios-transition"
                                            )}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                            <BellOff className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                            No notifications
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            You&apos;re all caught up!
                        </p>
                    </div>
                )}

                {/* Footer */}
                {notifications.length > 0 && (
                    <>
                        <div className="h-px bg-border/50 mx-3" />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className={cn(
                                    "w-full h-9 text-xs rounded-xl",
                                    "text-muted-foreground hover:text-foreground",
                                    "hover-glass-light"
                                )}
                            >
                                Clear all notifications
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
