"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { format, isBefore, isAfter } from "date-fns";
import { PageHeader } from "@/components/PageHeader";
import {
    BudgetModal,
    NewBudgetButton,
    Budget,
    BudgetFormData,
    BudgetProgressBar,
} from "@/components/budgets/BudgetModal";
import {
    Category,
    getIconComponent,
} from "@/components/categories/CategoryModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Filter,
    Target,
    TrendingUp,
    TrendingDown,
    Calendar,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Clock,
} from "lucide-react";
// Supabase hooks - uncomment when USE_SUPABASE is true
import { useBudgets, useCategories } from "@/lib/supabase";

// Feature flag - set to true when Supabase database is ready
const USE_SUPABASE = true;

// Mock categories (in a real app, would be fetched from Supabase)
const mockCategories: Category[] = [
    { id: "1", name: "Groceries", icon: "shopping-cart", color: "from-orange-400 to-orange-600", type: "expense" },
    { id: "2", name: "Food & Drink", icon: "coffee", color: "from-amber-400 to-amber-600", type: "expense" },
    { id: "3", name: "Housing", icon: "home", color: "from-blue-400 to-blue-600", type: "expense" },
    { id: "4", name: "Transportation", icon: "car", color: "from-slate-400 to-slate-600", type: "expense" },
    { id: "5", name: "Entertainment", icon: "gamepad", color: "from-purple-400 to-purple-600", type: "expense" },
    { id: "6", name: "Health", icon: "heart", color: "from-pink-400 to-pink-600", type: "expense" },
    { id: "7", name: "Shopping", icon: "shirt", color: "from-indigo-400 to-indigo-600", type: "expense" },
    { id: "8", name: "Utilities", icon: "zap", color: "from-yellow-400 to-yellow-600", type: "expense" },
    { id: "9", name: "Travel", icon: "plane", color: "from-sky-400 to-sky-600", type: "expense" },
    { id: "10", name: "Education", icon: "graduation", color: "from-teal-400 to-teal-600", type: "expense" },
];

// Mock budgets data
const mockBudgets: Budget[] = [
    {
        id: "1",
        category_id: "1",
        category: mockCategories[0],
        amount: 500,
        currency: "USD",
        start_date: new Date(2025, 11, 1), // Dec 1, 2025
        end_date: new Date(2025, 11, 31), // Dec 31, 2025
        spent: 342.50,
    },
    {
        id: "2",
        category_id: "2",
        category: mockCategories[1],
        amount: 300,
        currency: "USD",
        start_date: new Date(2025, 11, 1),
        end_date: new Date(2025, 11, 31),
        spent: 287.00,
    },
    {
        id: "3",
        category_id: "5",
        category: mockCategories[4],
        amount: 150,
        currency: "USD",
        start_date: new Date(2025, 11, 1),
        end_date: new Date(2025, 11, 31),
        spent: 75.00,
    },
    {
        id: "4",
        category_id: "4",
        category: mockCategories[3],
        amount: 200,
        currency: "USD",
        start_date: new Date(2025, 11, 1),
        end_date: new Date(2025, 11, 31),
        spent: 215.00, // Over budget
    },
    {
        id: "5",
        category_id: "7",
        category: mockCategories[6],
        amount: 400,
        currency: "USD",
        start_date: new Date(2025, 11, 1),
        end_date: new Date(2025, 11, 31),
        spent: 125.00,
    },
    {
        id: "6",
        category_id: "8",
        category: mockCategories[7],
        amount: 200,
        currency: "USD",
        start_date: new Date(2025, 11, 1),
        end_date: new Date(2025, 11, 31),
        spent: 178.50,
    },
    // Upcoming budget
    {
        id: "7",
        category_id: "9",
        category: mockCategories[8],
        amount: 1000,
        currency: "USD",
        start_date: new Date(2026, 0, 1), // Jan 1, 2026
        end_date: new Date(2026, 0, 31),
        spent: 0,
    },
    // Expired budget
    {
        id: "8",
        category_id: "3",
        category: mockCategories[2],
        amount: 1500,
        currency: "USD",
        start_date: new Date(2025, 10, 1), // Nov 2025
        end_date: new Date(2025, 10, 30),
        spent: 1420.00,
    },
];

type BudgetStatus = "active" | "upcoming" | "expired";

export default function BudgetsPage() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { preferredCurrency } = useUserSettings();

    // Supabase hooks for CRUD operations
    const {
        budgets: supabaseBudgets,
        isLoading: budgetsLoading,
        error: budgetsError,
        refresh: refreshBudgets,
        createBudget,
        updateBudget,
        deleteBudget,
    } = useBudgets();

    const {
        categories: supabaseCategories,
        isLoading: categoriesLoading,
    } = useCategories();

    // Map Supabase data to local types (no mock data fallback)
    const budgets: Budget[] = useMemo(() => {
        if (!USE_SUPABASE) return [];
        return supabaseBudgets.map((b: any) => ({
            id: b.id,
            category_id: b.category_id,
            category: b.category ? {
                id: b.category.id,
                name: b.category.name,
                icon: b.category.icon,
                color: b.category.color,
                type: b.category.type,
            } : undefined,
            amount: b.amount,
            currency: b.currency,
            start_date: new Date(b.start_date),
            end_date: new Date(b.end_date),
            spent: b.spent || 0,
        }));
    }, [supabaseBudgets]);

    const categories: Category[] = useMemo(() => {
        if (!USE_SUPABASE) return [];
        return supabaseCategories.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon,
            color: c.color,
            type: c.type,
            transaction_count: c.transaction_count || 0,
        }));
    }, [supabaseCategories]);

    // Loading and refreshing state
    const isLoading = USE_SUPABASE ? budgetsLoading || categoriesLoading : false;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filter state
    const [statusFilter, setStatusFilter] = useState<BudgetStatus | "all">("all");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingBudget, setEditingBudget] = useState<Budget | undefined>();

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

    // Get budget status
    const getBudgetStatus = (budget: Budget): BudgetStatus => {
        const now = new Date();
        const start = new Date(budget.start_date);
        const end = new Date(budget.end_date);

        if (isBefore(now, start)) return "upcoming";
        if (isAfter(now, end)) return "expired";
        return "active";
    };

    // Refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshBudgets();
        setIsRefreshing(false);
    };

    // Filter budgets
    const filteredBudgets = useMemo(() => {
        if (statusFilter === "all") return budgets;
        return budgets.filter((b) => getBudgetStatus(b) === statusFilter);
    }, [budgets, statusFilter]);

    // Summary stats
    const stats = useMemo(() => {
        const active = budgets.filter((b) => getBudgetStatus(b) === "active");
        const totalBudget = active.reduce((acc, b) => acc + b.amount, 0);
        const totalSpent = active.reduce((acc, b) => acc + b.spent, 0);
        const overBudget = active.filter((b) => b.spent > b.amount).length;

        return {
            total: budgets.length,
            active: active.length,
            totalBudget,
            totalSpent,
            overBudget,
            percentUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        };
    }, [budgets]);

    // Handlers
    const handleCreateBudget = () => {
        setModalMode("create");
        setEditingBudget(undefined);
        setIsModalOpen(true);
    };

    const handleEditBudget = (budget: Budget) => {
        setModalMode("edit");
        setEditingBudget(budget);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (budget: Budget) => {
        setBudgetToDelete(budget);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!budgetToDelete) return;

        setIsDeleting(true);
        try {
            if (USE_SUPABASE) {
                await deleteBudget(budgetToDelete.id);
            }
            toast.success('Budget deleted successfully');
        } catch (error) {
            console.error("Failed to delete budget:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete budget");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setBudgetToDelete(null);
        }
    };

    const handleSubmitBudget = async (data: BudgetFormData) => {
        const category = categories.find((c) => c.id === data.category_id);

        setIsSaving(true);
        try {
            if (modalMode === "create") {
                if (USE_SUPABASE) {
                    await createBudget({
                        category_id: data.category_id,
                        amount: data.amount,
                        currency: data.currency,
                        start_date: format(data.start_date, 'yyyy-MM-dd'),
                        end_date: format(data.end_date, 'yyyy-MM-dd'),
                    });
                }
            } else if (editingBudget) {
                if (USE_SUPABASE) {
                    await updateBudget(editingBudget.id, {
                        category_id: data.category_id,
                        amount: data.amount,
                        currency: data.currency,
                        start_date: format(data.start_date, 'yyyy-MM-dd'),
                        end_date: format(data.end_date, 'yyyy-MM-dd'),
                    });
                }
            }
            setIsModalOpen(false);
            toast.success(modalMode === 'create' ? 'Budget created successfully' : 'Budget updated successfully');
        } catch (error) {
            console.error("Failed to save budget:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save budget");
        } finally {
            setIsSaving(false);
        }
    };

    // Get status badge
    const getStatusBadge = (status: BudgetStatus) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] rounded-md">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </Badge>
                );
            case "upcoming":
                return (
                    <Badge className="bg-blue-500/10 text-blue-600 border-0 text-[10px] rounded-md">
                        <Clock className="h-3 w-3 mr-1" />
                        Upcoming
                    </Badge>
                );
            case "expired":
                return (
                    <Badge className="bg-slate-500/10 text-slate-600 border-0 text-[10px] rounded-md">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expired
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Budgets"
                subtitle="Set spending limits and track your budget goals."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshBudgets}
                        disabled={isRefreshing}
                        className={cn(
                            "h-10 w-10 rounded-xl",
                            "border border-transparent",
                            "hover-glass-light",
                            isRefreshing && "animate-spin"
                        )}
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <NewBudgetButton onClick={handleCreateBudget} />
                </div>
            </PageHeader>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Budget */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 ios-shadow">
                            <Target className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Total Budgeted
                            </p>
                            <p className="text-xl font-bold">
                                {formatCurrency(stats.totalBudget, preferredCurrency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 ios-shadow">
                            <TrendingDown className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Total Spent
                            </p>
                            <p className="text-xl font-bold">
                                {formatCurrency(stats.totalSpent, preferredCurrency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Active Budgets */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 ios-shadow">
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Active Budgets
                            </p>
                            <p className="text-xl font-bold">{stats.active}</p>
                        </div>
                    </div>
                </div>

                {/* Over Budget */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-xl ios-shadow",
                            stats.overBudget > 0
                                ? "bg-gradient-to-br from-rose-400 to-rose-600"
                                : "bg-gradient-to-br from-emerald-400 to-teal-600"
                        )}>
                            {stats.overBudget > 0 ? (
                                <AlertTriangle className="h-6 w-6 text-white" />
                            ) : (
                                <TrendingUp className="h-6 w-6 text-white" />
                            )}
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                {stats.overBudget > 0 ? "Over Budget" : "On Track"}
                            </p>
                            <p className={cn(
                                "text-xl font-bold",
                                stats.overBudget > 0 ? "text-rose-500" : "text-emerald-500"
                            )}>
                                {stats.overBudget > 0 ? stats.overBudget : "All good!"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overall Progress */}
            <div className="rounded-2xl glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-semibold">Overall Budget Progress</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Active budgets for current period
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">
                            {formatCurrency(stats.totalSpent, preferredCurrency)}
                            <span className="text-muted-foreground font-normal text-sm">
                                {" "}/ {formatCurrency(stats.totalBudget, preferredCurrency)}
                            </span>
                        </p>
                    </div>
                </div>
                <BudgetProgressBar
                    spent={stats.totalSpent}
                    budget={stats.totalBudget}
                    showLabels={true}
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter:</span>
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BudgetStatus | "all")}>
                    <SelectTrigger className="w-[140px] h-9 rounded-xl text-sm border-border/50">
                        <SelectValue placeholder="All Budgets" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Budgets</SelectItem>
                        <SelectItem value="active">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Active</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="upcoming">
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                                <span>Upcoming</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="expired">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                <span>Expired</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                    {filteredBudgets.length} budget{filteredBudgets.length !== 1 && "s"}
                </span>
            </div>

            {/* Budgets Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-2xl glass-card p-5">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <Skeleton className="h-3 w-full mb-2" />
                                <Skeleton className="h-2 w-full" />
                            </div>
                        </div>
                    ))
                ) : filteredBudgets.length === 0 ? (
                    // Empty state
                    <div className="col-span-full rounded-2xl glass-card p-12 text-center">
                        <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No budgets found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {statusFilter !== "all"
                                ? "No budgets match the current filter."
                                : "Create your first budget to start tracking spending."}
                        </p>
                        {statusFilter !== "all" ? (
                            <Button
                                variant="ghost"
                                onClick={() => setStatusFilter("all")}
                                className="rounded-xl"
                            >
                                Clear filter
                            </Button>
                        ) : (
                            <Button onClick={handleCreateBudget} className="rounded-xl">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Budget
                            </Button>
                        )}
                    </div>
                ) : (
                    // Budget cards
                    filteredBudgets.map((budget) => {
                        const status = getBudgetStatus(budget);
                        const category = budget.category;
                        const IconComponent = category ? getIconComponent(category.icon) : Target;
                        const isOverBudget = budget.spent > budget.amount;
                        const percentage = (budget.spent / budget.amount) * 100;

                        return (
                            <div
                                key={budget.id}
                                className={cn(
                                    "group rounded-2xl glass-card p-5",
                                    "hover-glass-strong ios-transition",
                                    "cursor-pointer"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                                                "bg-gradient-to-br text-white ios-shadow",
                                                category?.color || "from-slate-400 to-slate-600",
                                                "ios-transition group-hover:scale-105",
                                                status === "expired" && "opacity-60"
                                            )}
                                        >
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{category?.name || "Unknown"}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {format(new Date(budget.start_date), "MMM d")} - {format(new Date(budget.end_date), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ios-transition">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditBudget(budget);
                                            }}
                                            className="h-8 w-8 rounded-lg hover-glass-light"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(budget);
                                            }}
                                            className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className="mt-3">
                                    {getStatusBadge(status)}
                                </div>

                                {/* Amount and Progress */}
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={cn(
                                            "text-lg font-bold",
                                            isOverBudget && "text-rose-500"
                                        )}>
                                            {formatCurrency(budget.spent, budget.currency)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            / {formatCurrency(budget.amount, budget.currency)}
                                        </span>
                                    </div>
                                    <BudgetProgressBar
                                        spent={budget.spent}
                                        budget={budget.amount}
                                        showLabels={false}
                                    />

                                    {/* Warning for near/over budget */}
                                    {isOverBudget && (
                                        <p className="mt-2 text-xs text-rose-500 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Over budget by {formatCurrency(budget.spent - budget.amount, budget.currency)}
                                        </p>
                                    )}
                                    {!isOverBudget && percentage >= 90 && status === "active" && (
                                        <p className="mt-2 text-xs text-amber-500 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" />
                                            Approaching budget limit
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Budget Modal */}
            <BudgetModal
                mode={modalMode}
                budget={editingBudget}
                categories={categories}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleSubmitBudget}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-rose-500" />
                            Delete Budget
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the budget for <strong>{budgetToDelete?.category?.name}</strong>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="rounded-xl bg-rose-500 hover:bg-rose-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}