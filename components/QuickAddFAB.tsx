"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
    Plus,
    X,
    Loader2,
    Wallet,
    Tag,
    Receipt,
    TrendingUp,
    TrendingDown,
    Sparkles,
} from "lucide-react";
import { useAccounts, useCategories, useTransactions } from "@/lib/supabase";
import { format } from "date-fns";
import toast from "react-hot-toast";

export function QuickAddFAB() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Supabase hooks
    const { accounts } = useAccounts();
    const { categories } = useCategories();
    const { createTransaction } = useTransactions();

    // Form state
    const [formData, setFormData] = useState({
        amount: "",
        type: "expense" as "income" | "expense",
        category_id: "",
        account_id: "",
        description: "",
        currency: "USD",
    });

    // Filter categories by type
    const filteredCategories = categories.filter(
        (c: any) => c.type === formData.type
    );

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                amount: "",
                type: "expense",
                category_id: "",
                account_id: "",
                description: "",
                currency: "USD",
            });
        }
    }, [isOpen]);

    // Don't show on certain pages
    if (pathname === "/settings" || pathname === "/profile") {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || !formData.category_id || !formData.account_id) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await createTransaction({
                type: formData.type,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                category_id: formData.category_id,
                account_id: formData.account_id,
                description: formData.description || `Quick ${formData.type}`,
                date: format(new Date(), "yyyy-MM-dd"),
            });

            // Show success with confetti effect
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);

            toast.success(
                `${formData.type === "income" ? "Income" : "Expense"} added successfully!`
            );
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create transaction:", error);
            toast.error("Failed to add transaction");
        } finally {
            setIsSubmitting(false);
        }
    };

    const currencySymbol = getCurrencySymbol(formData.currency);

    return (
        <>
            {/* Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-[100]">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: "-10px",
                                animationDelay: `${Math.random() * 0.5}s`,
                                backgroundColor: [
                                    "#10b981",
                                    "#3b82f6",
                                    "#8b5cf6",
                                    "#f59e0b",
                                    "#ef4444",
                                    "#ec4899",
                                ][Math.floor(Math.random() * 6)],
                            }}
                        />
                    ))}
                </div>
            )}

            {/* FAB Button */}
            <div
                className={cn(
                    "fixed bottom-6 right-6 z-50",
                    "transition-all duration-300 ease-out"
                )}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <Button
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "h-14 rounded-full shadow-2xl",
                        "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600",
                        "hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700",
                        "text-white font-medium",
                        "transition-all duration-300 ease-out",
                        "hover:scale-110 hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]",
                        "active:scale-95",
                        isExpanded ? "w-40 gap-2" : "w-14"
                    )}
                >
                    <Plus
                        className={cn(
                            "h-6 w-6 transition-transform duration-300",
                            isOpen && "rotate-45"
                        )}
                    />
                    <span
                        className={cn(
                            "overflow-hidden transition-all duration-300 whitespace-nowrap",
                            isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
                        )}
                    >
                        Quick Add
                    </span>
                </Button>

                {/* Glow effect */}
                <div
                    className={cn(
                        "absolute inset-0 -z-10 rounded-full",
                        "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600",
                        "blur-xl opacity-50",
                        "animate-pulse"
                    )}
                />
            </div>

            {/* Quick Add Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent
                    className={cn(
                        "sm:max-w-[420px] rounded-3xl p-0 gap-0",
                        "glass border-border/50 overflow-hidden"
                    )}
                >
                    {/* Animated Header Gradient */}
                    <div
                        className={cn(
                            "absolute top-0 left-0 right-0 h-32 -z-10",
                            "bg-gradient-to-br opacity-20",
                            formData.type === "expense"
                                ? "from-rose-500 to-rose-600"
                                : "from-emerald-500 to-emerald-600"
                        )}
                    />

                    <DialogHeader className="p-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                                    "bg-gradient-to-br text-white ios-shadow",
                                    formData.type === "expense"
                                        ? "from-rose-500 to-rose-600"
                                        : "from-emerald-500 to-emerald-600"
                                )}
                            >
                                <Sparkles className="h-6 w-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                    Quick Add
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Add a transaction in seconds
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
                        {/* Type Toggle */}
                        <div className="flex gap-2 p-1 rounded-xl glass-subtle">
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        type: "expense",
                                        category_id: "",
                                    })
                                }
                                className={cn(
                                    "flex-1 h-11 rounded-lg text-sm font-medium ios-transition flex items-center justify-center gap-2",
                                    formData.type === "expense"
                                        ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white ios-shadow"
                                        : "text-muted-foreground hover:text-foreground hover-glass-light"
                                )}
                            >
                                <TrendingDown className="h-4 w-4" />
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        ...formData,
                                        type: "income",
                                        category_id: "",
                                    })
                                }
                                className={cn(
                                    "flex-1 h-11 rounded-lg text-sm font-medium ios-transition flex items-center justify-center gap-2",
                                    formData.type === "income"
                                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ios-shadow"
                                        : "text-muted-foreground hover:text-foreground hover-glass-light"
                                )}
                            >
                                <TrendingUp className="h-4 w-4" />
                                Income
                            </button>
                        </div>

                        {/* Amount with Currency */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Amount
                            </Label>
                            <div className="flex gap-2">
                                <CurrencySelector
                                    value={formData.currency}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, currency: value })
                                    }
                                    className="w-[100px]"
                                    showName={false}
                                />
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                        {currencySymbol}
                                    </span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) =>
                                            setFormData({ ...formData, amount: e.target.value })
                                        }
                                        className={cn(
                                            "pl-8 h-12 rounded-xl text-xl font-bold",
                                            "border-border/50 bg-background/50",
                                            "focus:bg-background focus:border-primary/50"
                                        )}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category & Account */}
                        <div className="grid gap-3 grid-cols-2">
                            {/* Category */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    Category
                                </Label>
                                {filteredCategories.length === 0 ? (
                                    <div className="h-11 rounded-xl border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                                        No categories
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.category_id}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, category_id: value })
                                        }
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-border/50">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {filteredCategories.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Account */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <Wallet className="h-3 w-3" />
                                    Account
                                </Label>
                                {accounts.length === 0 ? (
                                    <div className="h-11 rounded-xl border border-dashed border-border/50 flex items-center justify-center text-xs text-muted-foreground">
                                        No accounts
                                    </div>
                                ) : (
                                    <Select
                                        value={formData.account_id}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, account_id: value })
                                        }
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-border/50">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {accounts.map((acc: any) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                Description (optional)
                            </Label>
                            <Input
                                placeholder="What's this for?"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                className="h-11 rounded-xl border-border/50 bg-background/50"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "w-full h-12 rounded-xl font-medium text-base",
                                formData.type === "expense"
                                    ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
                                "text-white ios-shadow",
                                "ios-transition active:scale-95"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add {formData.type === "expense" ? "Expense" : "Income"}
                                </>
                            )}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
