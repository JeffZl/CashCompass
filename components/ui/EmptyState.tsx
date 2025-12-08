"use client";

import { cn } from "@/lib/utils";
import {
    FileText,
    PiggyBank,
    Target,
    CreditCard,
    Tag,
    Calendar,
    TrendingUp,
    Sparkles,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    illustration?: "transactions" | "budgets" | "goals" | "accounts" | "categories" | "calendar" | "reports";
    className?: string;
}

// SVG Illustrations for each type
const illustrations = {
    transactions: (
        <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-400/20 to-indigo-600/20 flex items-center justify-center mb-4 animate-float">
                <FileText className="h-12 w-12 text-blue-500" />
            </div>
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center animate-bounce-in">
                <Plus className="h-4 w-4 text-white" />
            </div>
        </div>
    ),
    budgets: (
        <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-purple-400/20 to-violet-600/20 flex items-center justify-center mb-4 animate-float">
                <Target className="h-12 w-12 text-purple-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 animate-pulse" />
        </div>
    ),
    goals: (
        <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-600/20 flex items-center justify-center mb-4 animate-float">
                <PiggyBank className="h-12 w-12 text-emerald-500" />
            </div>
            <Sparkles className="absolute -top-1 -left-1 h-6 w-6 text-yellow-500 animate-pulse" />
        </div>
    ),
    accounts: (
        <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-slate-400/20 to-slate-600/20 flex items-center justify-center mb-4 animate-float">
                <CreditCard className="h-12 w-12 text-slate-500" />
            </div>
        </div>
    ),
    categories: (
        <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-orange-400/20 to-red-600/20 flex items-center justify-center mb-4 animate-float">
                <Tag className="h-12 w-12 text-orange-500" />
            </div>
        </div>
    ),
    calendar: (
        <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-pink-400/20 to-rose-600/20 flex items-center justify-center mb-4 animate-float">
                <Calendar className="h-12 w-12 text-pink-500" />
            </div>
        </div>
    ),
    reports: (
        <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 flex items-center justify-center mb-4 animate-float">
                <TrendingUp className="h-12 w-12 text-cyan-500" />
            </div>
        </div>
    ),
};

export function EmptyState({
    icon,
    title,
    description,
    action,
    illustration,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-12 px-4 text-center",
                className
            )}
        >
            {illustration ? (
                illustrations[illustration]
            ) : icon ? (
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 animate-float">
                    {icon}
                </div>
            ) : null}

            <h3 className="text-lg font-semibold mt-2">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {description}
            </p>

            {action && (
                <Button
                    onClick={action.onClick}
                    className="mt-6 rounded-xl gap-2"
                    size="lg"
                >
                    <Plus className="h-4 w-4" />
                    {action.label}
                </Button>
            )}
        </div>
    );
}

// Pre-built empty states
export function EmptyTransactions({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            illustration="transactions"
            title="No transactions yet"
            description="Start tracking your income and expenses by adding your first transaction"
            action={onAdd ? { label: "Add Transaction", onClick: onAdd } : undefined}
        />
    );
}

export function EmptyBudgets({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            illustration="budgets"
            title="No budgets set"
            description="Create budgets to track your spending limits and stay on top of your finances"
            action={onAdd ? { label: "Create Budget", onClick: onAdd } : undefined}
        />
    );
}

export function EmptyGoals({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            illustration="goals"
            title="No savings goals"
            description="Set a savings goal and watch your progress grow over time"
            action={onAdd ? { label: "Set a Goal", onClick: onAdd } : undefined}
        />
    );
}

export function EmptyAccounts({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            illustration="accounts"
            title="No accounts added"
            description="Add your bank accounts, credit cards, or wallets to track your balances"
            action={onAdd ? { label: "Add Account", onClick: onAdd } : undefined}
        />
    );
}

export function EmptyCategories({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            illustration="categories"
            title="No categories yet"
            description="Create categories to organize your transactions and get better insights"
            action={onAdd ? { label: "Add Category", onClick: onAdd } : undefined}
        />
    );
}
