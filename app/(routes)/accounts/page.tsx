"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/PageHeader";
import {
    AccountModal,
    NewAccountButton,
    Account,
    AccountFormData,
    accountTypes,
    getAccountType
} from "@/components/accounts/AccountModal";
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
import {
    formatCurrency,
    getCurrency,
} from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { useExchangeRates } from "@/lib/contexts/ExchangeRateContext";
import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Filter,
    Wallet,
    TrendingUp,
    Building2,
    Banknote,
    CreditCard,
    PiggyBank,
    MoreHorizontal,
    AlertCircle,
} from "lucide-react";
// Supabase hooks - uncomment when USE_SUPABASE is true
import { useAccounts } from "@/lib/supabase";

// Feature flag - set to true when Supabase database is ready
const USE_SUPABASE = true;

// Mock data - will be replaced with Supabase data
const mockAccounts: Account[] = [
    {
        id: "1",
        name: "Chase Checking",
        type: "bank",
        balance: 4532.50,
        currency: "USD",
    },
    {
        id: "2",
        name: "Chase Savings",
        type: "savings",
        balance: 15000.00,
        currency: "USD",
    },
    {
        id: "3",
        name: "Apple Card",
        type: "card",
        balance: -1247.89,
        currency: "USD",
    },
    {
        id: "4",
        name: "Cash Wallet",
        type: "cash",
        balance: 350.00,
        currency: "USD",
    },
    {
        id: "5",
        name: "PayPal",
        type: "wallet",
        balance: 892.45,
        currency: "USD",
    },
    {
        id: "6",
        name: "Bank Mandiri",
        type: "bank",
        balance: 25000000,
        currency: "IDR",
    },
    {
        id: "7",
        name: "GoPay",
        type: "wallet",
        balance: 1500000,
        currency: "IDR",
    },
    {
        id: "8",
        name: "Revolut EUR",
        type: "wallet",
        balance: 750.00,
        currency: "EUR",
    },
];

// Account type icons mapping
const typeIcons: Record<string, React.ElementType> = {
    bank: Building2,
    cash: Banknote,
    card: CreditCard,
    wallet: Wallet,
    savings: PiggyBank,
    other: MoreHorizontal,
};

export default function AccountsPage() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { preferredCurrency, showConvertedAmounts } = useUserSettings();
    const { convertAmount } = useExchangeRates();

    // Supabase hooks for CRUD operations
    const {
        accounts: supabaseAccounts,
        isLoading: supabaseLoading,
        error: supabaseError,
        refresh: refreshAccounts,
        createAccount,
        updateAccount,
        deleteAccount,
    } = useAccounts();

    // Map Supabase accounts to local Account type (no mock data fallback)
    const accounts: Account[] = useMemo(() => {
        if (!USE_SUPABASE) return [];
        return supabaseAccounts.map((acc: { id: string; name: string; type: 'bank' | 'cash' | 'card' | 'wallet' | 'savings' | 'other'; balance: number; currency: string }) => ({
            id: acc.id,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            currency: acc.currency,
        }));
    }, [supabaseAccounts]);

    // Loading and refreshing state
    const isLoading = USE_SUPABASE ? supabaseLoading : false;
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filter state
    const [typeFilter, setTypeFilter] = useState<string>("all");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [editingAccount, setEditingAccount] = useState<Account | undefined>();

    // Delete confirmation state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

    // Refresh handler
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshAccounts();
        setIsRefreshing(false);
    };

    // Filter accounts
    const filteredAccounts = useMemo(() => {
        if (typeFilter === "all") return accounts;
        return accounts.filter((acc) => acc.type === typeFilter);
    }, [accounts, typeFilter]);

    // Calculate totals
    const totals = useMemo(() => {
        // Group by currency
        const byCurrency: Record<string, number> = {};
        accounts.forEach((acc) => {
            const currency = acc.currency || "USD";
            byCurrency[currency] = (byCurrency[currency] || 0) + acc.balance;
        });

        // Calculate unified total in preferred currency using live rates
        let unifiedTotal = 0;
        if (showConvertedAmounts) {
            Object.entries(byCurrency).forEach(([currency, amount]) => {
                unifiedTotal += convertAmount(amount, currency, preferredCurrency);
            });
        }

        return { byCurrency, unifiedTotal };
    }, [accounts, preferredCurrency, showConvertedAmounts, convertAmount]);

    // Handlers
    const handleCreateAccount = () => {
        setModalMode("create");
        setEditingAccount(undefined);
        setIsModalOpen(true);
    };

    const handleEditAccount = (account: Account) => {
        setModalMode("edit");
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (account: Account) => {
        setAccountToDelete(account);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!accountToDelete) return;

        setIsDeleting(true);
        try {
            if (USE_SUPABASE) {
                await deleteAccount(accountToDelete.id);
            }
            // UI updates automatically via real-time subscription
            toast.success('Account deleted successfully');
        } catch (error) {
            console.error("Failed to delete account:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete account");
        } finally {
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setAccountToDelete(null);
        }
    };

    const handleSubmitAccount = async (data: AccountFormData) => {
        setIsSaving(true);
        try {
            if (modalMode === "create") {
                if (USE_SUPABASE) {
                    await createAccount({
                        name: data.name,
                        type: data.type as 'bank' | 'cash' | 'card' | 'wallet' | 'savings' | 'other',
                        balance: data.balance,
                        currency: data.currency,
                    });
                }
            } else if (editingAccount) {
                if (USE_SUPABASE) {
                    await updateAccount(editingAccount.id, {
                        name: data.name,
                        type: data.type as 'bank' | 'cash' | 'card' | 'wallet' | 'savings' | 'other',
                        balance: data.balance,
                        currency: data.currency,
                    });
                }
            }
            setIsModalOpen(false);
            toast.success(modalMode === 'create' ? 'Account created successfully' : 'Account updated successfully');
        } catch (error) {
            console.error("Failed to save account:", error);
            toast.error(error instanceof Error ? error.message : "Failed to save account");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Accounts"
                subtitle="Manage your financial accounts and track balances."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshAccounts}
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
                    <NewAccountButton onClick={handleCreateAccount} />
                </div>
            </PageHeader>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Balance Card */}
                <div className="rounded-2xl glass-card p-5 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 ios-shadow">
                            <Wallet className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Total Balance
                            </p>
                            {showConvertedAmounts ? (
                                <p className="text-2xl font-bold">
                                    {getCurrency(preferredCurrency).flag} {formatCurrency(totals.unifiedTotal, preferredCurrency)}
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {Object.entries(totals.byCurrency).map(([currency, amount]) => (
                                        <span
                                            key={currency}
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-sm font-semibold",
                                                amount >= 0
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                            )}
                                        >
                                            <span>{getCurrency(currency).flag}</span>
                                            <span>{formatCurrency(amount, currency)}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Accounts Count Card */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 ios-shadow">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Active Accounts
                            </p>
                            <p className="text-2xl font-bold">
                                {accounts.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Asset vs Liability */}
                <div className="rounded-2xl glass-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 ios-shadow">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                Account Types
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {[...new Set(accounts.map((a) => a.type))].slice(0, 3).map((type) => {
                                    const typeInfo = getAccountType(type);
                                    return (
                                        <Badge key={type} variant="secondary" className="text-[10px] rounded-md">
                                            {typeInfo.label}
                                        </Badge>
                                    );
                                })}
                                {[...new Set(accounts.map((a) => a.type))].length > 3 && (
                                    <Badge variant="secondary" className="text-[10px] rounded-md">
                                        +{[...new Set(accounts.map((a) => a.type))].length - 3}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filter:</span>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px] h-9 rounded-xl text-sm border-border/50">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Types</SelectItem>
                        {accountTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{type.label}</span>
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                    {filteredAccounts.length} account{filteredAccounts.length !== 1 && "s"}
                </span>
            </div>

            {/* Accounts Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-2xl glass-card p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-xl" />
                                    <div>
                                        <Skeleton className="h-4 w-32 mb-2" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                    ))
                ) : filteredAccounts.length === 0 ? (
                    // Empty state
                    <div className="col-span-full rounded-2xl glass-card p-12 text-center">
                        <Wallet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {typeFilter !== "all"
                                ? "No accounts match the current filter."
                                : "Create your first account to start tracking."}
                        </p>
                        {typeFilter !== "all" ? (
                            <Button
                                variant="ghost"
                                onClick={() => setTypeFilter("all")}
                                className="rounded-xl"
                            >
                                Clear filter
                            </Button>
                        ) : (
                            <Button
                                onClick={handleCreateAccount}
                                className="rounded-xl"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Account
                            </Button>
                        )}
                    </div>
                ) : (
                    // Account cards
                    filteredAccounts.map((account) => {
                        const typeInfo = getAccountType(account.type);
                        const TypeIcon = typeInfo.icon;
                        const currency = getCurrency(account.currency);
                        const isNegative = account.balance < 0;

                        return (
                            <div
                                key={account.id}
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
                                                typeInfo.color,
                                                "ios-transition group-hover:scale-105"
                                            )}
                                        >
                                            <TypeIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm">{account.name}</h3>
                                            <Badge variant="secondary" className="mt-1 text-[10px] rounded-md glass-subtle">
                                                {typeInfo.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 ios-transition">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditAccount(account);
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
                                                handleDeleteClick(account);
                                            }}
                                            className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Balance */}
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Balance</span>
                                        <span className="text-xs text-muted-foreground">{currency.flag} {currency.code}</span>
                                    </div>
                                    <p className={cn(
                                        "text-xl font-bold mt-1",
                                        isNegative ? "text-rose-500" : "text-foreground"
                                    )}>
                                        {isNegative && "-"}{formatCurrency(account.balance, account.currency)}
                                    </p>

                                    {/* Converted amount using live rates */}
                                    {showConvertedAmounts && account.currency !== preferredCurrency && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ≈ {getCurrency(preferredCurrency).flag} {formatCurrency(
                                                convertAmount(account.balance, account.currency, preferredCurrency),
                                                preferredCurrency
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Account Modal */}
            <AccountModal
                mode={modalMode}
                account={editingAccount}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleSubmitAccount}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-rose-500" />
                            Delete Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{accountToDelete?.name}</strong>?
                            This action cannot be undone and will remove all associated data.
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