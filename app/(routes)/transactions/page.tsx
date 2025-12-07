"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/PageHeader";
import { NewTransactionModal, TransactionFormData } from "@/components/transactions/NewTransactionModal";
import { CurrencySelectorCompact } from "@/components/ui/CurrencySelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatCurrency, calculateCurrencyTotals, getUniqueCurrencies, getCurrency } from "@/lib/currency";
import { format } from "date-fns";
import {
    Search,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Coffee,
    Home,
    Car,
    Briefcase,
    Utensils,
    Zap,
    Heart,
    CreditCard,
    TrendingUp,
    TrendingDown,
    X,
    CalendarIcon,
    RefreshCw,
    Coins,
} from "lucide-react";

// Transaction type with currency
interface Transaction {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    account: string;
    type: "income" | "expense";
    currency: string;
    user_id?: string;
}

// Mock data with multiple currencies
const mockTransactions: Transaction[] = [
    {
        id: "1",
        amount: -85.32,
        category: "Groceries",
        description: "Whole Foods Market",
        date: "2025-12-07",
        account: "Chase Checking",
        type: "expense",
        currency: "USD",
    },
    {
        id: "2",
        amount: -6.45,
        category: "Food & Drink",
        description: "Starbucks Coffee",
        date: "2025-12-07",
        account: "Apple Card",
        type: "expense",
        currency: "USD",
    },
    {
        id: "3",
        amount: 3500.0,
        category: "Salary",
        description: "Monthly Salary - Acme Corp",
        date: "2025-12-06",
        account: "Chase Checking",
        type: "income",
        currency: "USD",
    },
    {
        id: "4",
        amount: -1200.0,
        category: "Housing",
        description: "Monthly Rent Payment",
        date: "2025-12-01",
        account: "Chase Checking",
        type: "expense",
        currency: "USD",
    },
    {
        id: "5",
        amount: -750000,
        category: "Transportation",
        description: "Grab Ride",
        date: "2025-11-30",
        account: "Cash",
        type: "expense",
        currency: "IDR",
    },
    {
        id: "6",
        amount: -45.50,
        category: "Dining",
        description: "Restaurant in London",
        date: "2025-11-29",
        account: "Apple Card",
        type: "expense",
        currency: "GBP",
    },
    {
        id: "7",
        amount: -15.99,
        category: "Entertainment",
        description: "Netflix Subscription",
        date: "2025-11-28",
        account: "Chase Checking",
        type: "expense",
        currency: "USD",
    },
    {
        id: "8",
        amount: -5980,
        category: "Health",
        description: "Gym Membership Tokyo",
        date: "2025-11-27",
        account: "PayPal",
        type: "expense",
        currency: "JPY",
    },
    {
        id: "9",
        amount: 500.0,
        category: "Freelance",
        description: "Website Design Project",
        date: "2025-11-25",
        account: "PayPal",
        type: "income",
        currency: "EUR",
    },
    {
        id: "10",
        amount: -120.0,
        category: "Shopping",
        description: "Amazon Purchase",
        date: "2025-11-24",
        account: "Apple Card",
        type: "expense",
        currency: "USD",
    },
    {
        id: "11",
        amount: 15000000,
        category: "Freelance",
        description: "App Development Project",
        date: "2025-11-23",
        account: "Bank BCA",
        type: "income",
        currency: "IDR",
    },
    {
        id: "12",
        amount: -89.99,
        category: "Shopping",
        description: "Target Home Goods",
        date: "2025-11-22",
        account: "Amex Gold",
        type: "expense",
        currency: "USD",
    },
];

// Categories with icons
const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
    Groceries: { icon: ShoppingCart, color: "from-orange-400 to-orange-600" },
    "Food & Drink": { icon: Coffee, color: "from-amber-500 to-amber-700" },
    Salary: { icon: Briefcase, color: "from-emerald-400 to-emerald-600" },
    Housing: { icon: Home, color: "from-blue-400 to-blue-600" },
    Transportation: { icon: Car, color: "from-slate-500 to-slate-700" },
    Dining: { icon: Utensils, color: "from-red-400 to-red-600" },
    Entertainment: { icon: Zap, color: "from-purple-400 to-purple-600" },
    Health: { icon: Heart, color: "from-pink-400 to-pink-600" },
    Freelance: { icon: CreditCard, color: "from-teal-400 to-teal-600" },
    Shopping: { icon: ShoppingCart, color: "from-indigo-400 to-indigo-600" },
    Utilities: { icon: Zap, color: "from-yellow-400 to-yellow-600" },
};

// Sorting types
type SortField = "date" | "amount";
type SortOrder = "asc" | "desc";

// Items per page
const ITEMS_PER_PAGE = 10;

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// Currency summary component
function CurrencySummary({
    totals,
    type
}: {
    totals: Record<string, number>;
    type: "income" | "expense" | "balance"
}) {
    const entries = Object.entries(totals).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

    if (entries.length === 0) {
        return <span className="text-muted-foreground">-</span>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {entries.map(([currency, amount]) => (
                <span
                    key={currency}
                    className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium",
                        type === "income" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        type === "expense" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                        type === "balance" && amount >= 0
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}
                >
                    <span>{getCurrency(currency).flag}</span>
                    <span>
                        {type === "income" && "+"}
                        {type === "expense" && "-"}
                        {type === "balance" && (amount >= 0 ? "+" : "")}
                        {formatCurrency(Math.abs(amount), currency)}
                    </span>
                </span>
            ))}
        </div>
    );
}

export default function TransactionsPage() {
    const { user, isLoaded: isUserLoaded } = useUser();

    // Data state
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [accountFilter, setAccountFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [currencyFilter, setCurrencyFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });

    // Sort state
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Unique values for filters (derived from transactions)
    const categories = useMemo(() => [...new Set(transactions.map((t) => t.category))], [transactions]);
    const accounts = useMemo(() => [...new Set(transactions.map((t) => t.account))], [transactions]);
    const usedCurrencies = useMemo(() => getUniqueCurrencies(transactions), [transactions]);

    // Fetch transactions from Supabase
    const fetchTransactions = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            setTransactions(mockTransactions);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Refresh transactions
    const refreshTransactions = async () => {
        setIsRefreshing(true);
        await fetchTransactions();
        setIsRefreshing(false);
    };

    // Initial fetch
    useEffect(() => {
        if (isUserLoaded && user) {
            fetchTransactions();
        }
    }, [isUserLoaded, user, fetchTransactions]);

    // Handle new transaction created
    const handleTransactionCreated = (formData: TransactionFormData) => {
        const newTransaction: Transaction = {
            id: `temp-${Date.now()}`,
            amount: formData.amount,
            category: formData.category,
            description: formData.description,
            date: format(formData.date, "yyyy-MM-dd"),
            account: formData.account,
            type: formData.type,
            currency: formData.currency,
        };
        setTransactions([newTransaction, ...transactions]);
    };

    // Filter and sort transactions
    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (t) =>
                    t.description.toLowerCase().includes(query) ||
                    t.category.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (categoryFilter !== "all") {
            result = result.filter((t) => t.category === categoryFilter);
        }

        // Account filter
        if (accountFilter !== "all") {
            result = result.filter((t) => t.account === accountFilter);
        }

        // Type filter
        if (typeFilter !== "all") {
            result = result.filter((t) => t.type === typeFilter);
        }

        // Currency filter
        if (currencyFilter !== "all") {
            result = result.filter((t) => t.currency === currencyFilter);
        }

        // Date range filter
        if (dateRange.from) {
            result = result.filter((t) => new Date(t.date) >= dateRange.from!);
        }
        if (dateRange.to) {
            result = result.filter((t) => new Date(t.date) <= dateRange.to!);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            if (sortField === "date") {
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sortField === "amount") {
                comparison = Math.abs(a.amount) - Math.abs(b.amount);
            }
            return sortOrder === "asc" ? comparison : -comparison;
        });

        return result;
    }, [transactions, searchQuery, categoryFilter, accountFilter, typeFilter, currencyFilter, dateRange, sortField, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Multi-currency totals
    const currencyTotals = useMemo(() =>
        calculateCurrencyTotals(filteredTransactions),
        [filteredTransactions]
    );

    // Handlers
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setCategoryFilter("all");
        setAccountFilter("all");
        setTypeFilter("all");
        setCurrencyFilter("all");
        setDateRange({ from: undefined, to: undefined });
        setCurrentPage(1);
    };

    const hasActiveFilters =
        searchQuery ||
        categoryFilter !== "all" ||
        accountFilter !== "all" ||
        typeFilter !== "all" ||
        currencyFilter !== "all" ||
        dateRange.from ||
        dateRange.to;

    const handleDelete = async (id: string) => {
        setTransactions(transactions.filter((t) => t.id !== id));
    };

    const handleEdit = (id: string) => {
        console.log("Edit transaction:", id);
    };

    return (
        <div className="space-y-6">
            {/* Page Header with New Transaction Modal */}
            <PageHeader
                title="Transactions"
                subtitle="View and manage all your transactions."
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshTransactions}
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
                    <NewTransactionModal onTransactionCreated={handleTransactionCreated} />
                </div>
            </PageHeader>

            {/* Multi-Currency Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                {/* Income Card */}
                <div className="rounded-2xl glass-card p-4 hover-glass-strong ios-transition cursor-pointer active:scale-[0.98]">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 ios-shadow">
                            <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Total Income
                            </p>
                            <CurrencySummary totals={currencyTotals.income} type="income" />
                        </div>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="rounded-2xl glass-card p-4 hover-glass-strong ios-transition cursor-pointer active:scale-[0.98]">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 ios-shadow">
                            <TrendingDown className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Total Expenses
                            </p>
                            <CurrencySummary totals={currencyTotals.expenses} type="expense" />
                        </div>
                    </div>
                </div>

                {/* Balance Card */}
                <div className="rounded-2xl glass-card p-4 hover-glass-strong ios-transition cursor-pointer active:scale-[0.98]">
                    <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 ios-shadow">
                            <Coins className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Net Balance
                            </p>
                            <CurrencySummary totals={currencyTotals.balance} type="balance" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="rounded-3xl glass-card p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={cn(
                                "pl-10 h-10 rounded-xl",
                                "border-border/50 bg-background/50",
                                "focus:bg-background focus:border-primary/50",
                                "ios-transition"
                            )}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Filter className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Filters:</span>
                        </div>

                        {/* Date Range */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-9 px-3 rounded-xl text-xs border-border/50",
                                        (dateRange.from || dateRange.to) && "bg-primary/5"
                                    )}
                                >
                                    <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                                    {dateRange.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "MMM d, yyyy")
                                        )
                                    ) : (
                                        "Date Range"
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: dateRange.from, to: dateRange.to }}
                                    onSelect={(range) => {
                                        setDateRange({ from: range?.from, to: range?.to });
                                        setCurrentPage(1);
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Currency Filter */}
                        <Select
                            value={currencyFilter}
                            onValueChange={(value) => {
                                setCurrencyFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[100px] h-9 rounded-xl text-xs border-border/50">
                                <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Currencies</SelectItem>
                                {usedCurrencies.map((code) => {
                                    const curr = getCurrency(code);
                                    return (
                                        <SelectItem key={code} value={code}>
                                            {curr.flag} {code}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        {/* Type Filter */}
                        <Select
                            value={typeFilter}
                            onValueChange={(value) => {
                                setTypeFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[100px] h-9 rounded-xl text-xs border-border/50">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Category Filter */}
                        <Select
                            value={categoryFilter}
                            onValueChange={(value) => {
                                setCategoryFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[120px] h-9 rounded-xl text-xs border-border/50">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Account Filter */}
                        <Select
                            value={accountFilter}
                            onValueChange={(value) => {
                                setAccountFilter(value);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[130px] h-9 rounded-xl text-xs border-border/50">
                                <SelectValue placeholder="Account" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Accounts</SelectItem>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc} value={acc}>
                                        {acc}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className={cn(
                                    "h-9 px-3 rounded-xl text-xs",
                                    "text-muted-foreground hover:text-foreground",
                                    "hover-glass-light"
                                )}
                            >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Results count */}
                <div className="mt-3 text-xs text-muted-foreground">
                    Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
                    {usedCurrencies.length > 1 && ` • ${usedCurrencies.length} currencies`}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-3xl glass-card overflow-hidden">
                <ScrollArea className="w-full">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="w-[120px]">
                                    <button
                                        onClick={() => handleSort("date")}
                                        className={cn(
                                            "flex items-center gap-1.5 text-xs font-medium",
                                            "ios-transition hover:text-foreground"
                                        )}
                                    >
                                        Date
                                        {sortField === "date" ? (
                                            sortOrder === "asc" ? (
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            ) : (
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                                        )}
                                    </button>
                                </TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="hidden sm:table-cell">Category</TableHead>
                                <TableHead className="hidden md:table-cell">Account</TableHead>
                                <TableHead className="text-right">
                                    <button
                                        onClick={() => handleSort("amount")}
                                        className={cn(
                                            "flex items-center gap-1.5 text-xs font-medium ml-auto",
                                            "ios-transition hover:text-foreground"
                                        )}
                                    >
                                        Amount
                                        {sortField === "amount" ? (
                                            sortOrder === "asc" ? (
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            ) : (
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            )
                                        ) : (
                                            <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                                        )}
                                    </button>
                                </TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/50">
                                        <TableCell>
                                            <Skeleton className="h-4 w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-9 w-9 rounded-xl" />
                                                <Skeleton className="h-4 w-40" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Skeleton className="h-6 w-20" />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Skeleton className="h-4 w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-16 ml-auto" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-8 w-16" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <CreditCard className="h-8 w-8 text-muted-foreground/50" />
                                            <p className="text-sm text-muted-foreground">
                                                No transactions found
                                            </p>
                                            {hasActiveFilters && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={clearFilters}
                                                    className="mt-2 rounded-xl"
                                                >
                                                    Clear filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedTransactions.map((transaction) => {
                                    const config = categoryConfig[transaction.category] || {
                                        icon: CreditCard,
                                        color: "from-gray-400 to-gray-600",
                                    };
                                    const Icon = config.icon;
                                    const currency = getCurrency(transaction.currency);

                                    return (
                                        <TableRow
                                            key={transaction.id}
                                            className={cn(
                                                "group border-border/50",
                                                "hover-glass",
                                                "ios-transition"
                                            )}
                                        >
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(transaction.date)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={cn(
                                                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                                                            "bg-gradient-to-br text-white",
                                                            config.color,
                                                            "ios-transition group-hover:scale-105"
                                                        )}
                                                    >
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {transaction.description}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground sm:hidden">
                                                            {transaction.category}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-lg text-[10px] font-medium glass-subtle"
                                                >
                                                    {transaction.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                                {transaction.account}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className="text-muted-foreground text-xs">
                                                        {currency.flag}
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            "text-sm font-semibold tabular-nums",
                                                            transaction.type === "income"
                                                                ? "text-emerald-500"
                                                                : "text-foreground"
                                                        )}
                                                    >
                                                        {transaction.type === "income" ? "+" : "-"}
                                                        {formatCurrency(transaction.amount, transaction.currency)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 ios-transition">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(transaction.id)}
                                                        className="h-8 w-8 rounded-lg hover-glass-light"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-8 w-8 rounded-lg hover-glass-light"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <Button
                                        key={pageNum}
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={cn(
                                            "h-8 w-8 rounded-lg text-xs",
                                            pageNum === currentPage
                                                ? "glass-subtle font-semibold"
                                                : "hover-glass-light"
                                        )}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-8 w-8 rounded-lg hover-glass-light"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}