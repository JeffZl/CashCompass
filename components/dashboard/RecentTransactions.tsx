"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
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
    CreditCard,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { TiltCard } from "@/components/ui/TiltCard";

// Transaction type
interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    type: "income" | "expense";
    category: string;
    account: string;
}

interface RecentTransactionsProps {
    transactions?: Transaction[];
    hasData?: boolean;
}

// Category icon mapping
const categoryIcons: Record<string, React.ElementType> = {
    groceries: ShoppingCart,
    "food & drink": Coffee,
    housing: Home,
    transportation: Car,
    salary: Briefcase,
    freelance: CreditCard,
    dining: Utensils,
    entertainment: Zap,
    health: Heart,
    utilities: Zap,
    shopping: ShoppingCart,
};

// Category color mapping
const categoryColors: Record<string, string> = {
    groceries: "from-orange-400 to-orange-600",
    "food & drink": "from-amber-500 to-amber-700",
    housing: "from-blue-400 to-blue-600",
    transportation: "from-slate-500 to-slate-700",
    salary: "from-emerald-400 to-emerald-600",
    freelance: "from-teal-400 to-teal-600",
    dining: "from-red-400 to-red-600",
    entertainment: "from-purple-400 to-purple-600",
    health: "from-pink-400 to-pink-600",
    utilities: "from-yellow-400 to-yellow-600",
    shopping: "from-indigo-400 to-indigo-600",
};

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
}

export function RecentTransactions({ transactions = [], hasData = false }: RecentTransactionsProps) {
    const { preferredCurrency } = useUserSettings();

    return (
        <TiltCard className="rounded-3xl h-full" tiltAmount={5} scale={1.01}>
            <div className="rounded-3xl glass-card overflow-hidden h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                    <div>
                        <h3 className="text-lg font-semibold tracking-tight">
                            Recent Transactions
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {hasData ? "Your latest activity" : "No transactions yet"}
                        </p>
                    </div>
                    <Link href="/transactions">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-xs h-8 rounded-lg hover-glass-light"
                        >
                            View All
                            <ArrowRight className="h-3 w-3" />
                        </Button>
                    </Link>
                </div>

                {/* Transactions List */}
                <ScrollArea className="h-[320px]">
                    <div className="px-4 pb-4 space-y-1">
                        {!hasData || transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    No transactions yet
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Add your first transaction to see it here
                                </p>
                            </div>
                        ) : (
                            transactions.map((transaction) => {
                                const categoryKey = transaction.category.toLowerCase();
                                const Icon = categoryIcons[categoryKey] || FileText;
                                const iconColor = categoryColors[categoryKey] || "from-gray-400 to-gray-600";

                                return (
                                    <div
                                        key={transaction.id}
                                        className={cn(
                                            "group flex items-center gap-3 p-3 rounded-2xl",
                                            "hover-glass",
                                            "ios-transition cursor-pointer",
                                            "active:scale-[0.99]"
                                        )}
                                    >
                                        {/* Icon */}
                                        <div
                                            className={cn(
                                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                                                "bg-gradient-to-br text-white",
                                                iconColor,
                                                "ios-shadow ios-transition",
                                                "group-hover:scale-110 group-hover:rotate-6"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {transaction.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[11px] text-muted-foreground">
                                                    {transaction.account}
                                                </span>
                                                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                                                    {transaction.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amount & Date */}
                                        <div className="text-right shrink-0">
                                            <p
                                                className={cn(
                                                    "text-sm font-semibold tabular-nums",
                                                    transaction.type === "income"
                                                        ? "text-emerald-600 dark:text-emerald-400"
                                                        : "text-foreground"
                                                )}
                                            >
                                                {transaction.type === "income" ? "+" : "-"}
                                                {formatCurrency(Math.abs(transaction.amount), preferredCurrency)}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                                {formatDate(transaction.date)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </div>
        </TiltCard>
    );
}
