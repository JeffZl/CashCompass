"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { getCurrencySymbol } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
    Plus,
    CalendarIcon,
    Loader2,
    FileText,
    Tag,
    CreditCard,
    AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

// Category type for props
export interface CategoryOption {
    id: string;
    name: string;
    type: "income" | "expense";
}

// Account type for props
export interface AccountOption {
    id: string;
    name: string;
}

interface NewTransactionModalProps {
    onTransactionCreated?: (transaction: TransactionFormData) => void;
    categories?: CategoryOption[];
    accounts?: AccountOption[];
}

export interface TransactionFormData {
    amount: number;
    type: "income" | "expense";
    category: string;
    category_id?: string;
    description: string;
    date: Date;
    account: string;
    account_id?: string;
    currency: string;
}

export function NewTransactionModal({ onTransactionCreated, categories = [], accounts = [] }: NewTransactionModalProps) {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<TransactionFormData>({
        amount: 0,
        type: "expense",
        category: "",
        description: "",
        date: new Date(),
        account: "",
        currency: "USD",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});

    const resetForm = () => {
        setFormData({
            amount: 0,
            type: "expense",
            category: "",
            description: "",
            date: new Date(),
            account: "",
            currency: "USD",
        });
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = "Amount must be greater than 0";
        }
        if (!formData.category) {
            newErrors.category = "Please select a category";
        }
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }
        if (!formData.account) {
            newErrors.account = "Please select an account";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !user) return;

        setIsLoading(true);

        try {
            // TODO: Replace with actual Supabase insert
            // const { data, error } = await supabase
            //     .from('transactions')
            //     .insert({
            //         user_id: user.id,
            //         amount: formData.type === 'expense' ? -formData.amount : formData.amount,
            //         category: formData.category,
            //         description: formData.description,
            //         date: formData.date.toISOString(),
            //         account: formData.account,
            //         currency: formData.currency,
            //         type: formData.type,
            //     })
            //     .select()
            //     .single();

            // if (error) throw error;

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Call callback with form data
            onTransactionCreated?.({
                ...formData,
                amount: formData.type === "expense" ? -formData.amount : formData.amount,
            });

            resetForm();
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to create transaction:", error);
            setErrors({ description: "Failed to create transaction. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const currencySymbol = getCurrencySymbol(formData.currency);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    className={cn(
                        "gap-2 rounded-xl h-10",
                        "bg-gradient-to-r from-blue-500 to-indigo-600",
                        "hover:from-blue-600 hover:to-indigo-700",
                        "text-white font-medium ios-shadow",
                        "ios-transition active:scale-95"
                    )}
                >
                    <Plus className="h-4 w-4" />
                    New Transaction
                </Button>
            </DialogTrigger>

            <DialogContent
                className={cn(
                    "sm:max-w-[480px] rounded-3xl p-0 gap-0",
                    "glass border-border/50"
                )}
            >
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        New Transaction
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Add a new income or expense transaction.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Transaction Type Toggle */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Transaction Type
                        </Label>
                        <div className="flex gap-2 p-1 rounded-xl glass-subtle">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                                className={cn(
                                    "flex-1 h-10 rounded-lg text-sm font-medium ios-transition",
                                    formData.type === "expense"
                                        ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white ios-shadow"
                                        : "text-muted-foreground hover:text-foreground hover-glass-light"
                                )}
                            >
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: "income", category: "" })}
                                className={cn(
                                    "flex-1 h-10 rounded-lg text-sm font-medium ios-transition",
                                    formData.type === "income"
                                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ios-shadow"
                                        : "text-muted-foreground hover:text-foreground hover-glass-light"
                                )}
                            >
                                Income
                            </button>
                        </div>
                    </div>

                    {/* Amount with Currency */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Amount
                        </Label>
                        <div className="flex gap-2">
                            {/* Currency Selector */}
                            <CurrencySelector
                                value={formData.currency}
                                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                                className="w-[130px]"
                                showName={false}
                            />

                            {/* Amount Input */}
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                    {currencySymbol}
                                </span>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={formData.amount || ""}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                    className={cn(
                                        "pl-8 h-12 rounded-xl text-lg font-semibold",
                                        "border-border/50 bg-background/50",
                                        "focus:bg-background focus:border-primary/50",
                                        errors.amount && "border-rose-500"
                                    )}
                                />
                            </div>
                        </div>
                        {errors.amount && <p className="text-xs text-rose-500">{errors.amount}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Description
                        </Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="description"
                                placeholder="e.g., Grocery shopping at Whole Foods"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className={cn(
                                    "pl-10 h-12 rounded-xl",
                                    "border-border/50 bg-background/50",
                                    "focus:bg-background focus:border-primary/50",
                                    errors.description && "border-rose-500"
                                )}
                            />
                        </div>
                        {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                    </div>

                    {/* Category & Account Row */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Category */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Category
                            </Label>
                            {categories.filter(c => c.type === formData.type).length === 0 ? (
                                <div className="h-12 rounded-xl border border-dashed border-border/50 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    No {formData.type} categories yet
                                </div>
                            ) : (
                                <Select
                                    value={formData.category_id || ""}
                                    onValueChange={(value) => {
                                        const cat = categories.find(c => c.id === value);
                                        setFormData({ ...formData, category: cat?.name || '', category_id: value });
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "h-12 rounded-xl border-border/50",
                                            errors.category && "border-rose-500"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select category" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {categories.filter(c => c.type === formData.type).map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.category && <p className="text-xs text-rose-500">{errors.category}</p>}
                        </div>

                        {/* Account */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Account
                            </Label>
                            {accounts.length === 0 ? (
                                <div className="h-12 rounded-xl border border-dashed border-border/50 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                    <AlertCircle className="h-4 w-4" />
                                    No accounts yet
                                </div>
                            ) : (
                                <Select
                                    value={formData.account_id || ""}
                                    onValueChange={(value) => {
                                        const acc = accounts.find(a => a.id === value);
                                        setFormData({ ...formData, account: acc?.name || '', account_id: value });
                                    }}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "h-12 rounded-xl border-border/50",
                                            errors.account && "border-rose-500"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder="Select account" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {accounts.map((acc) => (
                                            <SelectItem key={acc.id} value={acc.id}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.account && <p className="text-xs text-rose-500">{errors.account}</p>}
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full h-12 justify-start text-left font-normal rounded-xl",
                                        "border-border/50",
                                        !formData.date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.date}
                                    onSelect={(date) => date && setFormData({ ...formData, date })}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
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
                                formData.type === "expense"
                                    ? "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700"
                                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
                                "text-white ios-shadow",
                                "ios-transition active:scale-95"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add {formData.type === "expense" ? "Expense" : "Income"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
