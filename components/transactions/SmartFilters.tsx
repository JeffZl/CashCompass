"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Filter,
    X,
    Calendar,
    DollarSign,
    Tag,
    ArrowUpDown,
    Save,
    Trash2,
    ChevronDown,
} from "lucide-react";

export interface TransactionFilters {
    search: string;
    type: "all" | "income" | "expense";
    categoryId: string | null;
    accountId: string | null;
    dateFrom: string;
    dateTo: string;
    amountMin: string;
    amountMax: string;
    sortBy: "date" | "amount" | "description";
    sortOrder: "asc" | "desc";
}

interface Category {
    id: string;
    name: string;
}

interface Account {
    id: string;
    name: string;
}

interface SmartFiltersProps {
    filters: TransactionFilters;
    onFiltersChange: (filters: TransactionFilters) => void;
    categories: Category[];
    accounts: Account[];
}

const defaultFilters: TransactionFilters = {
    search: "",
    type: "all",
    categoryId: null,
    accountId: null,
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
    sortBy: "date",
    sortOrder: "desc",
};

interface SavedFilter {
    id: string;
    name: string;
    filters: TransactionFilters;
}

export function SmartFilters({
    filters,
    onFiltersChange,
    categories,
    accounts,
}: SmartFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
    const [filterName, setFilterName] = useState("");

    const activeFilterCount = [
        filters.type !== "all",
        filters.categoryId,
        filters.accountId,
        filters.dateFrom || filters.dateTo,
        filters.amountMin || filters.amountMax,
    ].filter(Boolean).length;

    const resetFilters = () => {
        onFiltersChange(defaultFilters);
    };

    const saveCurrentFilter = () => {
        if (!filterName.trim()) return;
        const newFilter: SavedFilter = {
            id: crypto.randomUUID(),
            name: filterName,
            filters: { ...filters },
        };
        setSavedFilters([...savedFilters, newFilter]);
        setFilterName("");
    };

    const loadFilter = (saved: SavedFilter) => {
        onFiltersChange(saved.filters);
    };

    const deleteFilter = (id: string) => {
        setSavedFilters(savedFilters.filter(f => f.id !== id));
    };

    // Quick date presets
    const datePresets = [
        { label: "Today", from: new Date().toISOString().split("T")[0], to: new Date().toISOString().split("T")[0] },
        { label: "This Week", from: getStartOfWeek(), to: new Date().toISOString().split("T")[0] },
        { label: "This Month", from: getStartOfMonth(), to: new Date().toISOString().split("T")[0] },
        { label: "Last 30 Days", from: getLast30Days(), to: new Date().toISOString().split("T")[0] },
        { label: "This Year", from: getStartOfYear(), to: new Date().toISOString().split("T")[0] },
    ];

    return (
        <div className="space-y-4">
            {/* Main Filter Bar */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Input
                        placeholder="Search transactions..."
                        value={filters.search}
                        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                        className="rounded-xl pr-10"
                    />
                    {filters.search && (
                        <button
                            onClick={() => onFiltersChange({ ...filters, search: "" })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Type Filter */}
                <Select
                    value={filters.type}
                    onValueChange={(v) => onFiltersChange({ ...filters, type: v as TransactionFilters["type"] })}
                >
                    <SelectTrigger className="w-32 rounded-xl">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                </Select>

                {/* Advanced Filters Toggle */}
                <Button
                    variant="outline"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn(
                        "rounded-xl gap-2",
                        activeFilterCount > 0 && "border-primary text-primary"
                    )}
                >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                    <ChevronDown className={cn("h-4 w-4 ios-transition", isExpanded && "rotate-180")} />
                </Button>

                {/* Sort */}
                <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(v) => {
                        const [sortBy, sortOrder] = v.split("-") as [TransactionFilters["sortBy"], TransactionFilters["sortOrder"]];
                        onFiltersChange({ ...filters, sortBy, sortOrder });
                    }}
                >
                    <SelectTrigger className="w-40 rounded-xl">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date-desc">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="amount-desc">Highest Amount</SelectItem>
                        <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                        <SelectItem value="description-asc">A-Z</SelectItem>
                        <SelectItem value="description-desc">Z-A</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset */}
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="rounded-xl text-muted-foreground"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-2xl glass-card p-4 space-y-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Category */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <Tag className="h-3 w-3" />
                                        Category
                                    </Label>
                                    <Select
                                        value={filters.categoryId || "all"}
                                        onValueChange={(v) => onFiltersChange({ ...filters, categoryId: v === "all" ? null : v })}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Account */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Account
                                    </Label>
                                    <Select
                                        value={filters.accountId || "all"}
                                        onValueChange={(v) => onFiltersChange({ ...filters, accountId: v === "all" ? null : v })}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="All Accounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Accounts</SelectItem>
                                            {accounts.map(acc => (
                                                <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Date Range
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                                            className="rounded-xl text-xs"
                                            placeholder="From"
                                        />
                                        <Input
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                                            className="rounded-xl text-xs"
                                            placeholder="To"
                                        />
                                    </div>
                                </div>

                                {/* Amount Range */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        Amount Range
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.amountMin}
                                            onChange={(e) => onFiltersChange({ ...filters, amountMin: e.target.value })}
                                            className="rounded-xl"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.amountMax}
                                            onChange={(e) => onFiltersChange({ ...filters, amountMax: e.target.value })}
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Date Presets */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-muted-foreground py-1">Quick:</span>
                                {datePresets.map(preset => (
                                    <Button
                                        key={preset.label}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onFiltersChange({ ...filters, dateFrom: preset.from, dateTo: preset.to })}
                                        className={cn(
                                            "rounded-lg text-xs h-7",
                                            filters.dateFrom === preset.from && filters.dateTo === preset.to && "bg-primary/10 text-primary"
                                        )}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </div>

                            {/* Save Filter */}
                            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                <Input
                                    placeholder="Save current filter as..."
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                    className="rounded-xl flex-1 max-w-xs"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={saveCurrentFilter}
                                    disabled={!filterName.trim()}
                                    className="rounded-lg gap-1"
                                >
                                    <Save className="h-3 w-3" />
                                    Save
                                </Button>
                            </div>

                            {/* Saved Filters */}
                            {savedFilters.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-muted-foreground py-1">Saved:</span>
                                    {savedFilters.map(saved => (
                                        <div
                                            key={saved.id}
                                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 text-xs"
                                        >
                                            <button
                                                onClick={() => loadFilter(saved)}
                                                className="hover:text-primary ios-transition"
                                            >
                                                {saved.name}
                                            </button>
                                            <button
                                                onClick={() => deleteFilter(saved.id)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Helper functions
function getStartOfWeek(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
}

function getStartOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
}

function getLast30Days(): string {
    const now = new Date();
    now.setDate(now.getDate() - 30);
    return now.toISOString().split("T")[0];
}

function getStartOfYear(): string {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
}
