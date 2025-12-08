"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getCurrencySymbol, formatCurrency } from "@/lib/currency";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { useUserSettings } from "@/lib/stores/userSettings";
import {
    Category,
    getIconComponent,
} from "@/components/categories/CategoryModal";
import {
    Plus,
    Loader2,
    CalendarDays,
    Target,
    DollarSign,
} from "lucide-react";

export interface Budget {
    id: string;
    user_id?: string;
    category_id: string;
    category?: Category;
    amount: number;
    currency: string;
    start_date: Date;
    end_date: Date;
    spent: number;
    created_at?: string;
}

export interface BudgetFormData {
    category_id: string;
    amount: number;
    currency: string;
    start_date: Date;
    end_date: Date;
}

interface BudgetModalProps {
    mode: "create" | "edit";
    budget?: Budget;
    categories: Category[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: BudgetFormData) => Promise<void>;
}

export function BudgetModal({
    mode,
    budget,
    categories,
    isOpen,
    onOpenChange,
    onSubmit,
}: BudgetModalProps) {
    const { user } = useUser();
    const { preferredCurrency } = useUserSettings();
    const [isLoading, setIsLoading] = useState(false);

    // Date picker open states
    const [startOpen, setStartOpen] = useState(false);
    const [endOpen, setEndOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState<BudgetFormData>({
        category_id: "",
        amount: 0,
        currency: preferredCurrency,
        start_date: new Date(),
        end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // End of current month
    });

    const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormData, string>>>({});

    // Populate form when editing
    useEffect(() => {
        if (mode === "edit" && budget) {
            setFormData({
                category_id: budget.category_id,
                amount: budget.amount,
                currency: budget.currency,
                start_date: new Date(budget.start_date),
                end_date: new Date(budget.end_date),
            });
        } else if (mode === "create") {
            const now = new Date();
            setFormData({
                category_id: "",
                amount: 0,
                currency: preferredCurrency,
                start_date: new Date(now.getFullYear(), now.getMonth(), 1), // Start of month
                end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0), // End of month
            });
        }
    }, [mode, budget, isOpen, preferredCurrency]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof BudgetFormData, string>> = {};

        if (!formData.category_id) {
            newErrors.category_id = "Please select a category";
        }
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = "Please enter a valid budget amount";
        }
        if (formData.end_date <= formData.start_date) {
            newErrors.end_date = "End date must be after start date";
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
                const now = new Date();
                setFormData({
                    category_id: "",
                    amount: 0,
                    currency: preferredCurrency,
                    start_date: new Date(now.getFullYear(), now.getMonth(), 1),
                    end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0),
                });
            }
        } catch (error) {
            console.error("Failed to save budget:", error);
            setErrors({ category_id: "Failed to save budget. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const selectedCategory = categories.find((c) => c.id === formData.category_id);
    const currencySymbol = getCurrencySymbol(formData.currency);

    // Filter to only expense categories for budgets
    const expenseCategories = categories.filter((c) => c.type === "expense");

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
                        {mode === "create" ? "New Budget" : "Edit Budget"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {mode === "create"
                            ? "Set a spending limit for a category."
                            : "Update your budget details."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Category
                        </Label>
                        <Select
                            value={formData.category_id}
                            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                        >
                            <SelectTrigger
                                className={cn(
                                    "h-12 rounded-xl border-border/50",
                                    errors.category_id && "border-rose-500"
                                )}
                            >
                                <SelectValue placeholder="Select a category">
                                    {selectedCategory && (
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "flex h-6 w-6 items-center justify-center rounded-lg",
                                                    "bg-gradient-to-br text-white",
                                                    selectedCategory.color
                                                )}
                                            >
                                                {(() => {
                                                    const Icon = getIconComponent(selectedCategory.icon);
                                                    return <Icon className="h-3.5 w-3.5" />;
                                                })()}
                                            </div>
                                            <span>{selectedCategory.name}</span>
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl max-h-[300px]">
                                {expenseCategories.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No expense categories found.
                                        <br />Create one in Categories page.
                                    </div>
                                ) : (
                                    expenseCategories.map((category) => {
                                        const Icon = getIconComponent(category.icon);
                                        return (
                                            <SelectItem key={category.id} value={category.id}>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            "flex h-6 w-6 items-center justify-center rounded-lg",
                                                            "bg-gradient-to-br text-white",
                                                            category.color
                                                        )}
                                                    >
                                                        <Icon className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span>{category.name}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })
                                )}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-xs text-rose-500">{errors.category_id}</p>}
                    </div>

                    {/* Budget Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Budget Amount
                        </Label>
                        <div className="flex gap-2">
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
                            <CurrencySelector
                                value={formData.currency}
                                onValueChange={(currency) => setFormData({ ...formData, currency })}
                                className="w-28"
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-rose-500">{errors.amount}</p>}
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Start Date
                            </Label>
                            <Popover open={startOpen} onOpenChange={setStartOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-12 justify-start text-left font-normal rounded-xl",
                                            "border-border/50"
                                        )}
                                    >
                                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {format(formData.start_date, "MMM d, yyyy")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.start_date}
                                        onSelect={(date) => {
                                            if (date) {
                                                setFormData({ ...formData, start_date: date });
                                                setStartOpen(false);
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                End Date
                            </Label>
                            <Popover open={endOpen} onOpenChange={setEndOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-12 justify-start text-left font-normal rounded-xl",
                                            "border-border/50",
                                            errors.end_date && "border-rose-500"
                                        )}
                                    >
                                        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {format(formData.end_date, "MMM d, yyyy")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.end_date}
                                        onSelect={(date) => {
                                            if (date) {
                                                setFormData({ ...formData, end_date: date });
                                                setEndOpen(false);
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.end_date && <p className="text-xs text-rose-500">{errors.end_date}</p>}
                        </div>
                    </div>

                    {/* Quick Date Presets */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { label: "This Month", start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0) },
                            { label: "Next Month", start: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), end: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0) },
                            { label: "This Quarter", start: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3, 1), end: new Date(new Date().getFullYear(), Math.floor(new Date().getMonth() / 3) * 3 + 3, 0) },
                        ].map((preset) => (
                            <Button
                                key={preset.label}
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setFormData({ ...formData, start_date: preset.start, end_date: preset.end })}
                                className="text-xs rounded-lg h-7 px-2 hover-glass-light"
                            >
                                {preset.label}
                            </Button>
                        ))}
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
                                    <Target className="h-4 w-4 mr-2" />
                                    {mode === "create" ? "Create Budget" : "Save Changes"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Progress bar component
export function BudgetProgressBar({
    spent,
    budget,
    showLabels = true,
    className,
}: {
    spent: number;
    budget: number;
    showLabels?: boolean;
    className?: string;
}) {
    const percentage = Math.min((spent / budget) * 100, 100);
    const remaining = budget - spent;
    const isOverBudget = spent > budget;

    // Color gradient based on percentage
    const getProgressColor = () => {
        if (isOverBudget) return "bg-rose-500";
        if (percentage >= 90) return "bg-gradient-to-r from-amber-500 to-rose-500";
        if (percentage >= 75) return "bg-gradient-to-r from-yellow-500 to-amber-500";
        if (percentage >= 50) return "bg-gradient-to-r from-lime-500 to-yellow-500";
        return "bg-gradient-to-r from-emerald-500 to-lime-500";
    };

    return (
        <div className={cn("space-y-2", className)}>
            {showLabels && (
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                        {percentage.toFixed(0)}% used
                    </span>
                    <span className={cn(
                        "font-medium",
                        isOverBudget ? "text-rose-500" : "text-muted-foreground"
                    )}>
                        {isOverBudget ? "Over by " : ""}
                        {formatCurrency(Math.abs(remaining), "USD")} {isOverBudget ? "" : "left"}
                    </span>
                </div>
            )}
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full ios-transition",
                        getProgressColor()
                    )}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>
        </div>
    );
}

// Trigger button for creating new budget
export function NewBudgetButton({ onClick }: { onClick: () => void }) {
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
            New Budget
        </Button>
    );
}
