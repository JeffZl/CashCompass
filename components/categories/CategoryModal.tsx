"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    Plus,
    Loader2,
    Check,
    ShoppingCart,
    Coffee,
    Home,
    Car,
    Briefcase,
    Utensils,
    Zap,
    Heart,
    CreditCard,
    Gamepad2,
    Plane,
    GraduationCap,
    Baby,
    Dumbbell,
    Shirt,
    Gift,
    Music2,
    Film,
    Smartphone,
    Wifi,
    Droplets,
    Flame,
    Bus,
    Fuel,
    PiggyBank,
    TrendingUp,
    Wallet,
    Building2,
    Banknote,
    Coins,
    Award,
    HandCoins,
    Receipt,
    Tag,
    type LucideIcon,
} from "lucide-react";

// Available icons for categories
export const categoryIcons: { name: string; icon: LucideIcon }[] = [
    // Expense icons
    { name: "shopping-cart", icon: ShoppingCart },
    { name: "coffee", icon: Coffee },
    { name: "home", icon: Home },
    { name: "car", icon: Car },
    { name: "utensils", icon: Utensils },
    { name: "zap", icon: Zap },
    { name: "heart", icon: Heart },
    { name: "credit-card", icon: CreditCard },
    { name: "gamepad", icon: Gamepad2 },
    { name: "plane", icon: Plane },
    { name: "graduation", icon: GraduationCap },
    { name: "baby", icon: Baby },
    { name: "dumbbell", icon: Dumbbell },
    { name: "shirt", icon: Shirt },
    { name: "gift", icon: Gift },
    { name: "music", icon: Music2 },
    { name: "film", icon: Film },
    { name: "smartphone", icon: Smartphone },
    { name: "wifi", icon: Wifi },
    { name: "droplets", icon: Droplets },
    { name: "flame", icon: Flame },
    { name: "bus", icon: Bus },
    { name: "fuel", icon: Fuel },
    { name: "receipt", icon: Receipt },
    { name: "tag", icon: Tag },
    // Income icons
    { name: "briefcase", icon: Briefcase },
    { name: "piggy-bank", icon: PiggyBank },
    { name: "trending-up", icon: TrendingUp },
    { name: "wallet", icon: Wallet },
    { name: "building", icon: Building2 },
    { name: "banknote", icon: Banknote },
    { name: "coins", icon: Coins },
    { name: "award", icon: Award },
    { name: "hand-coins", icon: HandCoins },
];

export function getIconComponent(iconName: string): LucideIcon {
    return categoryIcons.find((i) => i.name === iconName)?.icon || Tag;
}

// Predefined color palette
export const categoryColors = [
    { name: "Red", value: "from-red-400 to-red-600", hex: "#ef4444" },
    { name: "Orange", value: "from-orange-400 to-orange-600", hex: "#f97316" },
    { name: "Amber", value: "from-amber-400 to-amber-600", hex: "#f59e0b" },
    { name: "Yellow", value: "from-yellow-400 to-yellow-600", hex: "#eab308" },
    { name: "Lime", value: "from-lime-400 to-lime-600", hex: "#84cc16" },
    { name: "Green", value: "from-green-400 to-green-600", hex: "#22c55e" },
    { name: "Emerald", value: "from-emerald-400 to-emerald-600", hex: "#10b981" },
    { name: "Teal", value: "from-teal-400 to-teal-600", hex: "#14b8a6" },
    { name: "Cyan", value: "from-cyan-400 to-cyan-600", hex: "#06b6d4" },
    { name: "Sky", value: "from-sky-400 to-sky-600", hex: "#0ea5e9" },
    { name: "Blue", value: "from-blue-400 to-blue-600", hex: "#3b82f6" },
    { name: "Indigo", value: "from-indigo-400 to-indigo-600", hex: "#6366f1" },
    { name: "Violet", value: "from-violet-400 to-violet-600", hex: "#8b5cf6" },
    { name: "Purple", value: "from-purple-400 to-purple-600", hex: "#a855f7" },
    { name: "Fuchsia", value: "from-fuchsia-400 to-fuchsia-600", hex: "#d946ef" },
    { name: "Pink", value: "from-pink-400 to-pink-600", hex: "#ec4899" },
    { name: "Rose", value: "from-rose-400 to-rose-600", hex: "#f43f5e" },
    { name: "Slate", value: "from-slate-400 to-slate-600", hex: "#64748b" },
];

export function getColorClass(colorValue: string): string {
    return categoryColors.find((c) => c.value === colorValue)?.value || categoryColors[0].value;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: "income" | "expense";
    user_id?: string;
    transaction_count?: number;
}

export interface CategoryFormData {
    name: string;
    icon: string;
    color: string;
    type: "income" | "expense";
}

interface CategoryModalProps {
    mode: "create" | "edit";
    category?: Category;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CategoryFormData) => Promise<void>;
}

export function CategoryModal({ mode, category, isOpen, onOpenChange, onSubmit }: CategoryModalProps) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        icon: "tag",
        color: categoryColors[0].value,
        type: "expense",
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});

    // Populate form when editing
    useEffect(() => {
        if (mode === "edit" && category) {
            setFormData({
                name: category.name,
                icon: category.icon,
                color: category.color,
                type: category.type,
            });
        } else if (mode === "create") {
            setFormData({
                name: "",
                icon: "tag",
                color: categoryColors[0].value,
                type: "expense",
            });
        }
    }, [mode, category, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Category name is required";
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
                    icon: "tag",
                    color: categoryColors[0].value,
                    type: "expense",
                });
            }
        } catch (error) {
            console.error("Failed to save category:", error);
            setErrors({ name: "Failed to save category. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const IconComponent = getIconComponent(formData.icon);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "sm:max-w-[500px] rounded-3xl p-0 gap-0",
                    "glass border-border/50"
                )}
            >
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {mode === "create" ? "New Category" : "Edit Category"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {mode === "create"
                            ? "Create a new category to organize your transactions."
                            : "Update your category details."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
                    {/* Preview */}
                    <div className="flex items-center justify-center py-4">
                        <div
                            className={cn(
                                "flex h-20 w-20 items-center justify-center rounded-2xl",
                                "bg-gradient-to-br text-white ios-shadow",
                                formData.color
                            )}
                        >
                            <IconComponent className="h-10 w-10" />
                        </div>
                    </div>

                    {/* Category Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Category Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g., Groceries, Salary"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={cn(
                                "h-12 rounded-xl",
                                "border-border/50 bg-background/50",
                                "focus:bg-background focus:border-primary/50",
                                errors.name && "border-rose-500"
                            )}
                        />
                        {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                    </div>

                    {/* Type Toggle */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Category Type
                        </Label>
                        <div className="flex gap-2 relative z-50">
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("Expense clicked");
                                    setFormData((prev) => ({ ...prev, type: "expense" }));
                                }}
                                className={cn(
                                    "flex-1 h-12 rounded-xl font-medium transition-all duration-200",
                                    "flex items-center justify-center gap-2",
                                    "border cursor-pointer select-none",
                                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    formData.type === "expense"
                                        ? "bg-rose-500 text-white hover:bg-rose-600 border-rose-500 focus:ring-rose-500"
                                        : "bg-background border-border/50 hover:bg-rose-500/10 focus:ring-rose-500/50"
                                )}
                            >
                                <TrendingUp className="h-4 w-4 rotate-180" />
                                Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    console.log("Income clicked");
                                    setFormData((prev) => ({ ...prev, type: "income" }));
                                }}
                                className={cn(
                                    "flex-1 h-12 rounded-xl font-medium transition-all duration-200",
                                    "flex items-center justify-center gap-2",
                                    "border cursor-pointer select-none",
                                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    formData.type === "income"
                                        ? "bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 focus:ring-emerald-500"
                                        : "bg-background border-border/50 hover:bg-emerald-500/10 focus:ring-emerald-500/50"
                                )}
                            >
                                <TrendingUp className="h-4 w-4" />
                                Income
                            </button>
                        </div>
                    </div>

                    {/* Icon Picker */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Icon
                        </Label>
                        <ScrollArea className="h-32 rounded-xl border border-border/50 p-2">
                            <div className="grid grid-cols-8 gap-1.5">
                                {categoryIcons.map((item) => {
                                    const Icon = item.icon;
                                    const isSelected = formData.icon === item.name;
                                    return (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: item.name })}
                                            className={cn(
                                                "flex h-9 w-9 items-center justify-center rounded-lg",
                                                "ios-transition",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Color
                        </Label>
                        <div className="grid grid-cols-9 gap-2 p-3 rounded-xl border border-border/50">
                            {categoryColors.map((color) => {
                                const isSelected = formData.color === color.value;
                                return (
                                    <button
                                        key={color.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: color.value })}
                                        className={cn(
                                            "h-8 w-8 rounded-full ios-transition",
                                            "ring-2 ring-offset-2 ring-offset-background",
                                            isSelected ? "ring-primary" : "ring-transparent hover:ring-muted-foreground/30"
                                        )}
                                        style={{ background: `linear-gradient(135deg, ${color.hex}80, ${color.hex})` }}
                                        title={color.name}
                                    >
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-white mx-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
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
                                    {mode === "create" ? "Create Category" : "Save Changes"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Trigger button for creating new category
export function NewCategoryButton({ onClick }: { onClick: () => void }) {
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
            New Category
        </Button>
    );
}
