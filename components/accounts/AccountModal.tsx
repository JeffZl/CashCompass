"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
    Loader2,
    Building2,
    Wallet,
    CreditCard,
    Banknote,
    PiggyBank,
    MoreHorizontal,
    FileText,
} from "lucide-react";

// Account types with icons and colors
export const accountTypes = [
    { value: "bank", label: "Bank Account", icon: Building2, color: "from-blue-400 to-blue-600" },
    { value: "cash", label: "Cash", icon: Banknote, color: "from-emerald-400 to-emerald-600" },
    { value: "card", label: "Credit Card", icon: CreditCard, color: "from-purple-400 to-purple-600" },
    { value: "wallet", label: "Digital Wallet", icon: Wallet, color: "from-orange-400 to-orange-600" },
    { value: "savings", label: "Savings", icon: PiggyBank, color: "from-pink-400 to-pink-600" },
    { value: "other", label: "Other", icon: MoreHorizontal, color: "from-slate-400 to-slate-600" },
];

export function getAccountType(value: string) {
    return accountTypes.find((t) => t.value === value) || accountTypes[5]; // Default to "Other"
}

export interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
    user_id?: string;
    created_at?: string;
}

export interface AccountFormData {
    name: string;
    type: string;
    balance: number;
    currency: string;
}

interface AccountModalProps {
    mode: "create" | "edit";
    account?: Account;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: AccountFormData) => Promise<void>;
}

export function AccountModal({ mode, account, isOpen, onOpenChange, onSubmit }: AccountModalProps) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<AccountFormData>({
        name: "",
        type: "bank",
        balance: 0,
        currency: "USD",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});

    // Populate form when editing
    useEffect(() => {
        if (mode === "edit" && account) {
            setFormData({
                name: account.name,
                type: account.type,
                balance: account.balance,
                currency: account.currency,
            });
        } else if (mode === "create") {
            setFormData({
                name: "",
                type: "bank",
                balance: 0,
                currency: "USD",
            });
        }
    }, [mode, account, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof AccountFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Account name is required";
        }
        if (!formData.type) {
            newErrors.type = "Please select an account type";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !user) return;

        setIsLoading(true);

        try {
            await onSubmit(formData);
            onOpenChange(false);

            // Reset form on create
            if (mode === "create") {
                setFormData({
                    name: "",
                    type: "bank",
                    balance: 0,
                    currency: "USD",
                });
            }
        } catch (error) {
            console.error("Failed to save account:", error);
            setErrors({ name: "Failed to save account. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedType = getAccountType(formData.type);
    const TypeIcon = selectedType.icon;
    const currencySymbol = getCurrencySymbol(formData.currency);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "sm:max-w-[480px] rounded-3xl p-0 gap-0",
                    "glass border-border/50"
                )}
            >
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {mode === "create" ? "New Account" : "Edit Account"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {mode === "create"
                            ? "Add a new financial account to track."
                            : "Update your account details."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Account Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Account Name
                        </Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name"
                                placeholder="e.g., Chase Checking, Cash Wallet"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={cn(
                                    "pl-10 h-12 rounded-xl",
                                    "border-border/50 bg-background/50",
                                    "focus:bg-background focus:border-primary/50",
                                    errors.name && "border-rose-500"
                                )}
                            />
                        </div>
                        {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                    </div>

                    {/* Account Type */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Account Type
                        </Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger
                                className={cn(
                                    "h-12 rounded-xl border-border/50",
                                    errors.type && "border-rose-500"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-lg",
                                        "bg-gradient-to-br text-white",
                                        selectedType.color
                                    )}>
                                        <TypeIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <SelectValue placeholder="Select type" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {accountTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "flex h-6 w-6 items-center justify-center rounded-lg",
                                                    "bg-gradient-to-br text-white",
                                                    type.color
                                                )}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                </div>
                                                <span>{type.label}</span>
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-xs text-rose-500">{errors.type}</p>}
                    </div>

                    {/* Balance with Currency */}
                    <div className="space-y-2">
                        <Label htmlFor="balance" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Current Balance
                        </Label>
                        <div className="flex gap-2">
                            {/* Currency Selector */}
                            <CurrencySelector
                                value={formData.currency}
                                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                className="w-[130px]"
                                showName={false}
                            />

                            {/* Balance Input */}
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                    {currencySymbol}
                                </span>
                                <Input
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.balance || ""}
                                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                                    className={cn(
                                        "pl-8 h-12 rounded-xl text-lg font-semibold",
                                        "border-border/50 bg-background/50",
                                        "focus:bg-background focus:border-primary/50"
                                    )}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enter the current balance of this account
                        </p>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 rounded-xl border-border/50"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "flex-1 h-12 rounded-xl font-medium",
                                "bg-gradient-to-r from-blue-500 to-indigo-600",
                                "hover:from-blue-600 hover:to-indigo-700",
                                "text-white ios-shadow",
                                "ios-transition active:scale-95"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {mode === "create" ? "Creating..." : "Saving..."}
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {mode === "create" ? "Create Account" : "Save Changes"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Trigger button for creating new account
export function NewAccountButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "gap-2 rounded-xl h-10",
                "bg-gradient-to-r from-blue-500 to-indigo-600",
                "hover:from-blue-600 hover:to-indigo-700",
                "text-white font-medium ios-shadow",
                "ios-transition active:scale-95"
            )}
        >
            <Plus className="h-4 w-4" />
            New Account
        </Button>
    );
}
