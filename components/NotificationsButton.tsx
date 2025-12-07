"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
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

// Mock notifications data
const initialNotifications: Notification[] = [
    {
        id: "1",
        title: "New Transaction Added",
        description: "You added a new expense of $85.32 at Whole Foods.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        isRead: false,
        type: "transaction",
    },
    {
        id: "2",
        title: "Budget Alert",
        description: "You've used 80% of your Food & Dining budget this month.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        isRead: false,
        type: "alert",
    },
    {
        id: "3",
        title: "Savings Goal Reached!",
        description: "Congratulations! You've reached your monthly savings goal.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: false,
        type: "success",
    },
    {
        id: "4",
        title: "Account Connected",
        description: "Your Chase Checking account has been successfully linked.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
        type: "info",
    },
];

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
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, isRead: true }))
        );
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) =>
            prev.filter((notification) => notification.id !== id)
        );
    };

    const clearAll = () => {
        setNotifications([]);
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
