"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    ShoppingCart,
    Coffee,
    Home,
    Car,
    Briefcase,
    Utensils,
    ArrowRight,
    Zap,
    Heart,
} from "lucide-react";
import Link from "next/link";

// Mock data - will be replaced with Supabase data later
const mockTransactions = [
    {
        id: "1",
        merchant: "Whole Foods Market",
        account: "Chase Checking",
        amount: -85.32,
        date: "Today, 2:30 PM",
        category: "Groceries",
        icon: ShoppingCart,
        iconColor: "from-orange-400 to-orange-600",
    },
    {
        id: "2",
        merchant: "Starbucks",
        account: "Apple Card",
        amount: -6.45,
        date: "Today, 9:15 AM",
        category: "Food & Drink",
        icon: Coffee,
        iconColor: "from-amber-500 to-amber-700",
    },
    {
        id: "3",
        merchant: "Acme Corp",
        account: "Chase Checking",
        amount: 3500.0,
        date: "Yesterday, 9:00 AM",
        category: "Salary",
        icon: Briefcase,
        iconColor: "from-emerald-400 to-emerald-600",
    },
    {
        id: "4",
        merchant: "Landlord - Rent",
        account: "Chase Checking",
        amount: -1200.0,
        date: "Dec 1, 2024",
        category: "Housing",
        icon: Home,
        iconColor: "from-blue-400 to-blue-600",
    },
    {
        id: "5",
        merchant: "Shell Gas Station",
        account: "Amex Gold",
        amount: -52.47,
        date: "Nov 30, 2024",
        category: "Transportation",
        icon: Car,
        iconColor: "from-slate-500 to-slate-700",
    },
    {
        id: "6",
        merchant: "Chipotle",
        account: "Apple Card",
        amount: -14.25,
        date: "Nov 29, 2024",
        category: "Dining",
        icon: Utensils,
        iconColor: "from-red-400 to-red-600",
    },
    {
        id: "7",
        merchant: "Netflix",
        account: "Chase Checking",
        amount: -15.99,
        date: "Nov 28, 2024",
        category: "Entertainment",
        icon: Zap,
        iconColor: "from-purple-400 to-purple-600",
    },
    {
        id: "8",
        merchant: "Gym Membership",
        account: "Chase Checking",
        amount: -49.99,
        date: "Nov 27, 2024",
        category: "Health",
        icon: Heart,
        iconColor: "from-pink-400 to-pink-600",
    },
];

function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(Math.abs(amount));
}

export function RecentTransactions() {
    return (
        <div className="rounded-3xl glass-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                        Recent Transactions
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Your latest financial activity
                    </p>
                </div>
                <Link href="/transactions">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "gap-1.5 text-xs rounded-xl",
                            "text-muted-foreground hover:text-foreground",
                            "border border-transparent",
                            "hover-glass-light"
                        )}
                    >
                        View All
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                </Link>
            </div>

            {/* Transaction List - Each item has glass hover */}
            <ScrollArea className="h-[420px]">
                <div className="px-4 pb-4 space-y-1">
                    {mockTransactions.map((transaction, index) => (
                        <div
                            key={transaction.id}
                            className={cn(
                                "group flex items-center gap-4 p-3 rounded-2xl",
                                "border border-transparent",
                                // Glass on hover
                                "hover-glass",
                                // Press effect
                                "active:scale-[0.98]",
                                "cursor-pointer"
                            )}
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            {/* Icon with gradient */}
                            <Avatar
                                className={cn(
                                    "h-12 w-12 rounded-2xl",
                                    "ios-transition group-hover:scale-105 group-hover:rotate-3",
                                    "bg-gradient-to-br",
                                    transaction.iconColor
                                )}
                            >
                                <AvatarFallback className="bg-transparent rounded-2xl">
                                    <transaction.icon className="h-5 w-5 text-white" />
                                </AvatarFallback>
                            </Avatar>

                            {/* Details */}
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium truncate">
                                        {transaction.merchant}
                                    </p>
                                    <p
                                        className={cn(
                                            "text-sm font-semibold tabular-nums shrink-0",
                                            transaction.amount > 0
                                                ? "text-emerald-500"
                                                : "text-foreground"
                                        )}
                                    >
                                        {transaction.amount > 0 ? "+" : "-"}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className="truncate">{transaction.account}</span>
                                        <span className="shrink-0 opacity-50">•</span>
                                        <span
                                            className={cn(
                                                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                                "glass-subtle",
                                                transaction.amount > 0 &&
                                                "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            )}
                                        >
                                            {transaction.category}
                                        </span>
                                    </div>
                                    <span className="shrink-0 text-[11px]">{transaction.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
