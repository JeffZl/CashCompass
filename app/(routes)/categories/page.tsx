"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/PageHeader";
import {
    CategoryModal,
    NewCategoryButton,
    Category,
    CategoryFormData,
    categoryColors,
    getIconComponent,
} from "@/components/categories/CategoryModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Search,
    TrendingUp,
    TrendingDown,
    Tag,
    AlertCircle,
    Hash,
} from "lucide-react";
// Supabase hooks - uncomment when USE_SUPABASE is true
import { useCategories } from "@/lib/supabase";

// Feature flag - set to true when Supabase database is ready
const USE_SUPABASE = true;

// Mock data - will be replaced with Supabase data
const mockCategories: Category[] = [
    // Expense categories
    {
        id: "1",
        name: "Groceries",
        icon: "shopping-cart",
        color: "from-orange-400 to-orange-600",
        type: "expense",
        transaction_count: 24,
    },
    {
        id: "2",
        name: "Food & Drink",
        icon: "coffee",
        color: "from-amber-400 to-amber-600",
        type: "expense",
        transaction_count: 42,
    },
    {
        id: "3",
        name: "Housing",
        icon: "home",
        color: "from-blue-400 to-blue-600",
        type: "expense",
        transaction_count: 12,
    },
    {
        id: "4",
        name: "Transportation",
        icon: "car",
        color: "from-slate-400 to-slate-600",
        type: "expense",
        transaction_count: 18,
    },
    {
        id: "5",
        name: "Entertainment",
        icon: "gamepad",
        color: "from-purple-400 to-purple-600",
        type: "expense",
        transaction_count: 8,
    },
    {
        id: "6",
        name: "Health",
        icon: "heart",
        color: "from-pink-400 to-pink-600",
        type: "expense",
        transaction_count: 5,
    },
    {
        id: "7",
        name: "Shopping",
        icon: "shirt",
        color: "from-indigo-400 to-indigo-600",
        type: "expense",
        transaction_count: 15,
    },
    {
        id: "8",
        name: "Utilities",
        icon: "zap",
        color: "from-yellow-400 to-yellow-600",
        type: "expense",
        transaction_count: 6,
    },
    {
        id: "9",
        name: "Travel",
        icon: "plane",
        color: "from-sky-400 to-sky-600",
        type: "expense",
        transaction_count: 3,
    },
    {
        id: "10",
        name: "Education",
        icon: "graduation",
        color: "from-teal-400 to-teal-600",
        type: "expense",
        transaction_count: 2,
    },
    // Income categories
    {
        id: "11",
        name: "Salary",
        icon: "briefcase",
        color: "from-emerald-400 to-emerald-600",
        type: "income",
        transaction_count: 12,
    },
    {
        id: "12",
        name: "Freelance",
        icon: "wallet",
        color: "from-teal-400 to-teal-600",
        type: "income",
        transaction_count: 8,
    },
    {
        id: "13",
        name: "Investment",
        icon: "trending-up",
        color: "from-blue-400 to-blue-600",
        type: "income",
        transaction_count: 5,
    },
    {
        id: "14",
        name: "Gift",
        icon: "gift",
        color: "from-pink-400 to-pink-600",
        type: "income",
        transaction_count: 2,
    },
    {
        id: "15",
        name: "Bonus",
        icon: "award",
        color: "from-amber-400 to-amber-600",
        type: "income",
        transaction_count: 3,
    },
];

export default function CategoriesPage() {
    const { user, isLoaded: isUserLoaded } = useUser();

    // Supabase hooks for CRUD operations
    const {
        categories: supabaseCategories,
        isLoading: supabaseLoading,
        error: supabaseError,
        refresh: refreshCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    } = useCategories();

    // Map Supabase categories to local Category type (no mock data fallback)
    const categories: Category[] = useMemo(() => {
        if (!USE_SUPABASE) return [];
        return supabaseCategories.map((cat: { id: string; name: string; icon: string; color: string; type: 'income' | 'expense'; transaction_count?: number }) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: cat.type,
            transaction_count: cat.transaction_count || 0,
        }));
    }, [supabaseCategories]);

    // Loading and refreshing state
    const isLoading = USE_SUPABASE ? supabaseLoading : false;
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshCategories();
        setIsRefreshing(false);
    };

    // Filter categories
    const filteredCategories = useMemo(() => {
        return categories
            .filter((cat) => cat.type === activeTab)
            .filter((cat) =>
                searchQuery
                    ? cat.name.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
            );
    }, [categories, activeTab, searchQuery]);

    // Summary stats
    const stats = useMemo(() => {
        const expense = categories.filter((c) => c.type === "expense");
        const income = categories.filter((c) => c.type === "income");
        return {
            total: categories.length,
            expense: expense.length,
            income: income.length,
            totalTransactions: categories.reduce((acc, c) => acc + (c.transaction_count || 0), 0),
        };
    }, [categories]);

    // Handlers
    const handleCreateCategory = () => {
        setModalMode("create");
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setModalMode("edit");
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (category: Category) => {
        setCategoryToDelete(category);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        try {
            if (USE_SUPABASE) {
                // Use Supabase hook to delete
                await deleteCategory(categoryToDelete.id, true); // force delete
            }
            toast.success('Category deleted successfully');
        } catch (error) {
            console.error("Failed to delete category:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete category");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setCategoryToDelete(null);
        }
    };

    const handleSubmitCategory = async (data: CategoryFormData) => {
        setIsSaving(true);
        try {
            if (modalMode === "create") {
                if (USE_SUPABASE) {
                    await createCategory({
                        name: data.name,
                        icon: data.icon,
                        color: data.color,
                        type: data.type,
                    });
                }
            } else if (editingCategory) {
                if (USE_SUPABASE) {
                    await updateCategory(editingCategory.id, {
                        name: data.name,
                        icon: data.icon,
                        color: data.color,
                        type: data.type,
                    });
                }
            }
            setIsModalOpen(false);
            toast.success(modalMode === 'create' ? 'Category created successfully' : 'Category updated successfully');
        } catch (error) {
            console.error("Failed to save category:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save category");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Categories"
                subtitle="Organize your transactions with custom categories."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRefresh}
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
                    <NewCategoryButton onClick={handleCreateCategory} />
                </div>
            </PageHeader>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                {/* Total Categories */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 ios-shadow">
                            <Tag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Total Categories
                            </p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 ios-shadow">
                            <TrendingDown className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Expense Categories
                            </p>
                            <p className="text-2xl font-bold">{stats.expense}</p>
                        </div>
                    </div>
                </div>

                {/* Income Categories */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 ios-shadow">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Income Categories
                            </p>
                            <p className="text-2xl font-bold">{stats.income}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="rounded-3xl glass-card p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "expense" | "income")}>
                        <TabsList className="grid w-full max-w-[300px] grid-cols-2 rounded-xl h-11">
                            <TabsTrigger
                                value="expense"
                                className={cn(
                                    "rounded-lg data-[state=active]:bg-rose-500 data-[state=active]:text-white",
                                    "ios-transition"
                                )}
                            >
                                <TrendingDown className="h-4 w-4 mr-2" />
                                Expenses ({stats.expense})
                            </TabsTrigger>
                            <TabsTrigger
                                value="income"
                                className={cn(
                                    "rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white",
                                    "ios-transition"
                                )}
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Income ({stats.income})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Search */}
                    <div className="relative max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "pl-10 h-10 rounded-xl",
                                "border-border/50 bg-background/50",
                                "focus:bg-background focus:border-primary/50",
                                "ios-transition"
                            )}
                        />
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-3 text-xs text-muted-foreground">
                    {filteredCategories.length} categor{filteredCategories.length !== 1 ? "ies" : "y"}
                    {searchQuery && ` matching "${searchQuery}"`}
                </div>
            </div>

            {/* Categories Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-2xl glass-card p-5">
                            <div className="flex items-start gap-3">
                                <Skeleton className="h-14 w-14 rounded-xl" />
                                <div className="flex-1">
                                    <Skeleton className="h-5 w-24 mb-2" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : filteredCategories.length === 0 ? (
                    // Empty state
                    <div className="col-span-full rounded-2xl glass-card p-12 text-center">
                        <Tag className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchQuery
                                ? "No categories match your search."
                                : `Create your first ${activeTab} category to get started.`}
                        </p>
                        {searchQuery ? (
                            <Button
                                variant="ghost"
                                onClick={() => setSearchQuery("")}
                                className="rounded-xl"
                            >
                                Clear search
                            </Button>
                        ) : (
                            <Button onClick={handleCreateCategory} className="rounded-xl">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        )}
                    </div>
                ) : (
                    // Category cards
                    filteredCategories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        const hasTransactions = (category.transaction_count || 0) > 0;

                        return (
                            <div
                                key={category.id}
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
                                                "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
                                                "bg-gradient-to-br text-white ios-shadow",
                                                category.color,
                                                "ios-transition group-hover:scale-105"
                                            )}
                                        >
                                            <IconComponent className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{category.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                                <Hash className="h-3 w-3" />
                                                <span>
                                                    {category.transaction_count || 0} transaction
                                                    {(category.transaction_count || 0) !== 1 && "s"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ios-transition">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditCategory(category);
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
                                                handleDeleteClick(category);
                                            }}
                                            className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Type badge */}
                                <div className="mt-3 pt-3 border-t border-border/50">
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "text-[10px] rounded-md",
                                            category.type === "expense"
                                                ? "bg-rose-500/10 text-rose-600"
                                                : "bg-emerald-500/10 text-emerald-600"
                                        )}
                                    >
                                        {category.type === "expense" ? "Expense" : "Income"}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Category Modal */}
            <CategoryModal
                mode={modalMode}
                category={editingCategory}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleSubmitCategory}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-rose-500" />
                            Delete Category
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
                            {(categoryToDelete?.transaction_count || 0) > 0 && (
                                <span className="block mt-2 text-amber-600">
                                    ⚠️ This category has {categoryToDelete?.transaction_count} linked transaction
                                    {(categoryToDelete?.transaction_count || 0) !== 1 && "s"}.
                                </span>
                            )}
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