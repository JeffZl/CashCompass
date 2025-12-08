"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { TiltCard } from "@/components/ui/TiltCard";
import {
    CreditCard,
    Building2,
    Wallet,
    PiggyBank,
    Landmark,
    DollarSign,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Account {
    id: string;
    name: string;
    type: "checking" | "savings" | "credit" | "investment" | "cash";
    balance: number;
    currency: string;
    color?: string;
}

interface CreditCardDisplayProps {
    account: Account;
    onClick?: () => void;
}

// Card gradients for different account types
const cardGradients: Record<string, string> = {
    checking: "from-blue-600 via-blue-500 to-indigo-600",
    savings: "from-emerald-600 via-emerald-500 to-teal-600",
    credit: "from-slate-800 via-slate-700 to-zinc-800",
    investment: "from-violet-600 via-purple-500 to-fuchsia-600",
    cash: "from-amber-500 via-orange-500 to-red-500",
};

// Card patterns
const cardPatterns = {
    circles: (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 200">
            <circle cx="350" cy="100" r="150" fill="white" />
            <circle cx="320" cy="100" r="100" fill="white" />
        </svg>
    ),
    waves: (
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0,100 Q100,50 200,100 T400,100 L400,200 L0,200 Z" fill="white" />
            <path d="M0,150 Q100,100 200,150 T400,150 L400,200 L0,200 Z" fill="white" />
        </svg>
    ),
    grid: (
        <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 400 200">
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="1" height="20" fill="white" />
                <rect width="20" height="1" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
    ),
};

// Icons for account types
const accountIcons: Record<string, LucideIcon> = {
    checking: Building2,
    savings: PiggyBank,
    credit: CreditCard,
    investment: Landmark,
    cash: Wallet,
};

export function CreditCardDisplay({ account, onClick }: CreditCardDisplayProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const Icon = accountIcons[account.type] || CreditCard;
    const gradient = cardGradients[account.type] || cardGradients.checking;

    // Format last 4 digits (mock)
    const lastFour = account.id.slice(-4).padStart(4, "•");

    return (
        <TiltCard
            tiltAmount={15}
            glareEnabled={true}
            glareColor="rgba(255, 255, 255, 0.3)"
            scale={1.02}
            className="w-full"
        >
            <div
                className={cn(
                    "relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden cursor-pointer",
                    "bg-gradient-to-br text-white",
                    gradient,
                    "ios-shadow-lg",
                    "ios-transition active:scale-[0.98]"
                )}
                onClick={onClick}
            >
                {/* Background Pattern */}
                {cardPatterns.circles}

                {/* Chip */}
                <div className="absolute top-6 left-6">
                    <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 flex items-center justify-center">
                        <div className="w-7 h-5 rounded-sm bg-gradient-to-r from-amber-600/30 to-transparent" />
                    </div>
                </div>

                {/* Wireless Symbol */}
                <div className="absolute top-6 right-6">
                    <svg className="w-6 h-6 text-white/70 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12.5c1.5-2 4-3.5 7-3.5s5.5 1.5 7 3.5" />
                        <path d="M5 12.5c1-1.5 2.5-2.5 4-2.5s3 1 4 2.5" />
                        <circle cx="9" cy="12.5" r="1" fill="currentColor" />
                    </svg>
                </div>

                {/* Card Number Area */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-3 text-lg tracking-[0.2em] font-mono">
                        <span className="opacity-70">••••</span>
                        <span className="opacity-70">••••</span>
                        <span className="opacity-70">••••</span>
                        <span>{lastFour}</span>
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pt-0">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">
                                Account Name
                            </p>
                            <p className="font-semibold tracking-wide truncate max-w-[150px]">
                                {account.name}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-white/60 mb-1">
                                Balance
                            </p>
                            <p className="text-xl font-bold tabular-nums">
                                {formatCurrency(account.balance, account.currency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Card Type Icon */}
                <div className="absolute bottom-6 left-6 opacity-20">
                    <Icon className="h-16 w-16" />
                </div>

                {/* Card Brand Logo (mock) */}
                <div className="absolute bottom-6 right-6">
                    <div className="flex">
                        <div className="w-6 h-6 rounded-full bg-red-500/80" />
                        <div className="w-6 h-6 rounded-full bg-orange-400/80 -ml-2" />
                    </div>
                </div>

                {/* Shine Effect */}
                <div
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 ios-transition"
                    style={{ transform: "translateX(-100%)" }}
                />
            </div>
        </TiltCard>
    );
}

// Account Card Grid Component
interface AccountCardGridProps {
    accounts: Account[];
    onAccountClick?: (account: Account) => void;
}

export function AccountCardGrid({ accounts, onAccountClick }: AccountCardGridProps) {
    if (accounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 animate-float">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                    No accounts yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Add your first account to get started
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
                <CreditCardDisplay
                    key={account.id}
                    account={account}
                    onClick={() => onAccountClick?.(account)}
                />
            ))}
        </div>
    );
}
