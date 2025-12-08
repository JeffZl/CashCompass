"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { useTransactions, useAccounts, useCategories } from "@/lib/supabase";
import {
    Search,
    Command,
    LayoutDashboard,
    CreditCard,
    Wallet,
    PieChart,
    Tag,
    Settings,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    FileText,
    Plus,
    Calendar,
} from "lucide-react";

interface CommandItem {
    id: string;
    title: string;
    description?: string;
    icon: React.ElementType;
    iconColor?: string;
    action: () => void;
    category: "navigation" | "transaction" | "account" | "category" | "action";
}

export function CommandPalette() {
    const router = useRouter();
    const { preferredCurrency } = useUserSettings();
    const { transactions } = useTransactions();
    const { accounts } = useAccounts();
    const { categories } = useCategories();

    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Handle keyboard shortcut (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Reset search when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearch("");
        }
    }, [isOpen]);

    // Build command items
    const allItems = useMemo<CommandItem[]>(() => {
        const items: CommandItem[] = [];

        // Navigation items
        items.push(
            {
                id: "nav-dashboard",
                title: "Go to Dashboard",
                description: "View your financial overview",
                icon: LayoutDashboard,
                iconColor: "from-blue-400 to-blue-600",
                action: () => {
                    router.push("/dashboard");
                    setIsOpen(false);
                },
                category: "navigation",
            },
            {
                id: "nav-transactions",
                title: "Go to Transactions",
                description: "View all transactions",
                icon: CreditCard,
                iconColor: "from-emerald-400 to-emerald-600",
                action: () => {
                    router.push("/transactions");
                    setIsOpen(false);
                },
                category: "navigation",
            },
            {
                id: "nav-accounts",
                title: "Go to Accounts",
                description: "Manage your accounts",
                icon: Wallet,
                iconColor: "from-violet-400 to-violet-600",
                action: () => {
                    router.push("/accounts");
                    setIsOpen(false);
                },
                category: "navigation",
            },
            {
                id: "nav-budgets",
                title: "Go to Budgets",
                description: "View and manage budgets",
                icon: PieChart,
                iconColor: "from-amber-400 to-amber-600",
                action: () => {
                    router.push("/budgets");
                    setIsOpen(false);
                },
                category: "navigation",
            },
            {
                id: "nav-categories",
                title: "Go to Categories",
                description: "Manage categories",
                icon: Tag,
                iconColor: "from-pink-400 to-pink-600",
                action: () => {
                    router.push("/categories");
                    setIsOpen(false);
                },
                category: "navigation",
            },
            {
                id: "nav-settings",
                title: "Go to Settings",
                description: "App preferences",
                icon: Settings,
                iconColor: "from-slate-400 to-slate-600",
                action: () => {
                    router.push("/settings");
                    setIsOpen(false);
                },
                category: "navigation",
            }
        );

        // Recent transactions (searchable)
        transactions.slice(0, 10).forEach((tx: any) => {
            items.push({
                id: `tx-${tx.id}`,
                title: tx.description || tx.category?.name || "Transaction",
                description: `${formatCurrency(Math.abs(tx.amount), tx.currency || preferredCurrency)} • ${new Date(tx.date).toLocaleDateString()}`,
                icon: tx.type === "income" ? TrendingUp : TrendingDown,
                iconColor: tx.type === "income" ? "from-emerald-400 to-emerald-600" : "from-rose-400 to-rose-600",
                action: () => {
                    router.push("/transactions");
                    setIsOpen(false);
                },
                category: "transaction",
            });
        });

        // Accounts (searchable)
        accounts.forEach((acc: any) => {
            items.push({
                id: `acc-${acc.id}`,
                title: acc.name,
                description: `Balance: ${formatCurrency(acc.balance || 0, acc.currency || preferredCurrency)}`,
                icon: Wallet,
                iconColor: "from-indigo-400 to-indigo-600",
                action: () => {
                    router.push("/accounts");
                    setIsOpen(false);
                },
                category: "account",
            });
        });

        // Categories (searchable)
        categories.forEach((cat: any) => {
            items.push({
                id: `cat-${cat.id}`,
                title: cat.name,
                description: `${cat.type === "income" ? "Income" : "Expense"} category`,
                icon: Tag,
                iconColor: cat.type === "income" ? "from-emerald-400 to-emerald-600" : "from-rose-400 to-rose-600",
                action: () => {
                    router.push("/categories");
                    setIsOpen(false);
                },
                category: "category",
            });
        });

        return items;
    }, [router, transactions, accounts, categories, preferredCurrency]);

    // Filter items based on search
    const filteredItems = useMemo(() => {
        if (!search.trim()) {
            // Show only navigation when no search
            return allItems.filter((item) => item.category === "navigation");
        }

        const searchLower = search.toLowerCase();
        return allItems.filter(
            (item) =>
                item.title.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower)
        );
    }, [allItems, search]);

    // Group items by category
    const groupedItems = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};
        filteredItems.forEach((item) => {
            if (!groups[item.category]) {
                groups[item.category] = [];
            }
            groups[item.category].push(item);
        });
        return groups;
    }, [filteredItems]);

    const categoryLabels: Record<string, string> = {
        navigation: "Pages",
        transaction: "Recent Transactions",
        account: "Accounts",
        category: "Categories",
        action: "Actions",
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className={cn(
                    "sm:max-w-[550px] p-0 gap-0 rounded-2xl",
                    "glass border-border/50 overflow-hidden",
                    "top-[20%] translate-y-0"
                )}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                    <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                    <input
                        type="text"
                        placeholder="Search transactions, accounts, pages..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={cn(
                            "flex-1 bg-transparent text-sm outline-none",
                            "placeholder:text-muted-foreground/60"
                        )}
                        autoFocus
                    />
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/30 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto p-2">
                    {filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                No results found
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                Try a different search term
                            </p>
                        </div>
                    ) : (
                        Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category} className="mb-3 last:mb-0">
                                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {categoryLabels[category] || category}
                                </p>
                                <div className="space-y-0.5">
                                    {items.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={item.action}
                                                className={cn(
                                                    "flex items-center gap-3 w-full p-2 rounded-xl",
                                                    "text-left",
                                                    "hover-glass ios-transition",
                                                    "active:scale-[0.98]",
                                                    "group"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                                        "bg-gradient-to-br text-white",
                                                        item.iconColor || "from-gray-400 to-gray-600",
                                                        "ios-transition group-hover:scale-105"
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {item.title}
                                                    </p>
                                                    {item.description && (
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 ios-transition" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer with keyboard shortcuts */}
                <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-border/50 bg-muted/30 font-mono text-[8px]">
                                ↑
                            </kbd>
                            <kbd className="inline-flex h-4 w-4 items-center justify-center rounded border border-border/50 bg-muted/30 font-mono text-[8px]">
                                ↓
                            </kbd>
                            <span>Navigate</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="inline-flex h-4 items-center justify-center rounded border border-border/50 bg-muted/30 px-1 font-mono text-[8px]">
                                Enter
                            </kbd>
                            <span>Select</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Command className="h-3 w-3" />
                        <span>K to toggle</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
