"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { useTransactions } from "@/lib/supabase/hooks";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Trophy,
    Star,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Share,
    Download,
} from "lucide-react";
import confetti from "canvas-confetti";

interface YearStats {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    savingsRate: number;
    topCategories: { name: string; amount: number }[];
    monthlyAvgExpenses: number;
    monthlyAvgIncome: number;
    bestMonth: { month: string; savings: number };
    worstMonth: { month: string; savings: number };
    transactionCount: number;
    year: number;
}

const slides = [
    "intro",
    "overview",
    "income",
    "expenses",
    "savings",
    "categories",
    "highlights",
    "summary",
] as const;

type Slide = typeof slides[number];

export function YearInReview({ year = new Date().getFullYear() }: { year?: number }) {
    const { transactions } = useTransactions();
    const { preferredCurrency } = useUserSettings();
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [isOpen, setIsOpen] = useState(false);

    // Calculate year stats
    const stats = useMemo<YearStats>(() => {
        const yearTx = transactions.filter(t =>
            new Date(t.date).getFullYear() === year
        );

        const income = yearTx
            .filter(t => t.type === "income")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const expenses = yearTx
            .filter(t => t.type === "expense")
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const savings = income - expenses;
        const savingsRate = income > 0 ? (savings / income) * 100 : 0;

        // Category breakdown
        const categoryTotals: Record<string, number> = {};
        yearTx.filter(t => t.type === "expense").forEach(t => {
            const cat = t.category?.name || "Uncategorized";
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
        });
        const topCategories = Object.entries(categoryTotals)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        // Monthly stats
        const monthlyData: Record<string, { income: number; expenses: number }> = {};
        yearTx.forEach(t => {
            const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = { income: 0, expenses: 0 };
            }
            if (t.type === "income") {
                monthlyData[month].income += Math.abs(t.amount);
            } else {
                monthlyData[month].expenses += Math.abs(t.amount);
            }
        });

        const monthEntries = Object.entries(monthlyData);
        const monthlyAvgExpenses = monthEntries.length > 0
            ? monthEntries.reduce((sum, [, data]) => sum + data.expenses, 0) / monthEntries.length
            : 0;
        const monthlyAvgIncome = monthEntries.length > 0
            ? monthEntries.reduce((sum, [, data]) => sum + data.income, 0) / monthEntries.length
            : 0;

        // Best/worst months
        let bestMonth = { month: "N/A", savings: 0 };
        let worstMonth = { month: "N/A", savings: Infinity };

        monthEntries.forEach(([month, data]) => {
            const monthSavings = data.income - data.expenses;
            if (monthSavings > bestMonth.savings) {
                bestMonth = { month, savings: monthSavings };
            }
            if (monthSavings < worstMonth.savings) {
                worstMonth = { month, savings: monthSavings };
            }
        });

        if (worstMonth.savings === Infinity) worstMonth.savings = 0;

        return {
            totalIncome: income,
            totalExpenses: expenses,
            totalSavings: savings,
            savingsRate,
            topCategories,
            monthlyAvgExpenses,
            monthlyAvgIncome,
            bestMonth,
            worstMonth,
            transactionCount: yearTx.length,
            year,
        };
    }, [transactions, year]);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
            if (currentSlide === slides.length - 2) {
                // Trigger confetti on final slide
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                });
            }
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const renderSlide = () => {
        const slide = slides[currentSlide];

        switch (slide) {
            case "intro":
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-12"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-6"
                        >
                            <Calendar className="h-12 w-12 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold mb-2">Your {stats.year}</h2>
                        <h3 className="text-xl font-semibold text-muted-foreground mb-4">Year in Review</h3>
                        <p className="text-muted-foreground">
                            Let's look back at your financial journey
                        </p>
                    </motion.div>
                );

            case "overview":
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6 py-8"
                    >
                        <h2 className="text-2xl font-bold text-center">The Big Picture</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 border border-emerald-500/20">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Income</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(stats.totalIncome, preferredCurrency)}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 p-4 border border-rose-500/20">
                                <p className="text-xs text-rose-600 dark:text-rose-400">Total Expenses</p>
                                <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                    {formatCurrency(stats.totalExpenses, preferredCurrency)}
                                </p>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">You tracked</p>
                            <p className="text-4xl font-bold">{stats.transactionCount}</p>
                            <p className="text-sm text-muted-foreground">transactions this year</p>
                        </div>
                    </motion.div>
                );

            case "income":
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center py-8 space-y-6"
                    >
                        <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <TrendingUp className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Your Earnings</h2>
                        <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(stats.totalIncome, preferredCurrency)}
                        </p>
                        <p className="text-muted-foreground">
                            That's about {formatCurrency(stats.monthlyAvgIncome, preferredCurrency)} per month
                        </p>
                    </motion.div>
                );

            case "expenses":
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center py-8 space-y-6"
                    >
                        <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center">
                            <TrendingDown className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Your Spending</h2>
                        <p className="text-5xl font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(stats.totalExpenses, preferredCurrency)}
                        </p>
                        <p className="text-muted-foreground">
                            That's about {formatCurrency(stats.monthlyAvgExpenses, preferredCurrency)} per month
                        </p>
                    </motion.div>
                );

            case "savings":
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="text-center py-8 space-y-6"
                    >
                        <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                            <PiggyBank className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Your Savings</h2>
                        <p className={cn(
                            "text-5xl font-bold",
                            stats.totalSavings >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                            {formatCurrency(stats.totalSavings, preferredCurrency)}
                        </p>
                        <p className="text-muted-foreground">
                            Savings rate: <span className="font-semibold">{stats.savingsRate.toFixed(1)}%</span>
                        </p>
                        {stats.savingsRate >= 20 && (
                            <div className="flex items-center justify-center gap-2 text-amber-500">
                                <Trophy className="h-5 w-5" />
                                <span className="font-medium">Excellent saver!</span>
                            </div>
                        )}
                    </motion.div>
                );

            case "categories":
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="py-8 space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-center">Top Spending Categories</h2>
                        <div className="space-y-3">
                            {stats.topCategories.map((cat, i) => (
                                <motion.div
                                    key={cat.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                                >
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white font-bold text-sm">
                                        #{i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{cat.name}</p>
                                    </div>
                                    <p className="font-bold">{formatCurrency(cat.amount, preferredCurrency)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );

            case "highlights":
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="py-8 space-y-6"
                    >
                        <h2 className="text-2xl font-bold text-center">Highlights</h2>
                        <div className="space-y-4">
                            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 border border-emerald-500/20">
                                <div className="flex items-center gap-3">
                                    <Star className="h-6 w-6 text-emerald-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Best Month</p>
                                        <p className="font-bold">{stats.bestMonth.month}</p>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                            Saved {formatCurrency(stats.bestMonth.savings, preferredCurrency)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 border border-amber-500/20">
                                <div className="flex items-center gap-3">
                                    <TrendingDown className="h-6 w-6 text-amber-500" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Toughest Month</p>
                                        <p className="font-bold">{stats.worstMonth.month}</p>
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            {stats.worstMonth.savings >= 0 ? "Saved" : "Overspent"} {formatCurrency(Math.abs(stats.worstMonth.savings), preferredCurrency)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case "summary":
                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-8 space-y-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="h-24 w-24 mx-auto rounded-3xl bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center"
                        >
                            <Sparkles className="h-12 w-12 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold">That's a Wrap!</h2>
                        <p className="text-muted-foreground">
                            You've done amazing things with your finances in {stats.year}
                        </p>
                        <div className="pt-4">
                            <Button
                                variant="outline"
                                className="rounded-xl gap-2"
                                onClick={() => setIsOpen(false)}
                            >
                                Back to Dashboard
                            </Button>
                        </div>
                    </motion.div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2">
                    <Sparkles className="h-4 w-4" />
                    {year} Year in Review
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-md sm:max-w-lg">
                <div className="min-h-[400px] flex flex-col">
                    {/* Slide content */}
                    <div className="flex-1 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {renderSlide()}
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={prevSlide}
                            disabled={currentSlide === 0}
                            className="rounded-lg"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>

                        {/* Progress dots */}
                        <div className="flex gap-1.5">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={cn(
                                        "h-2 w-2 rounded-full ios-transition",
                                        i === currentSlide ? "bg-primary w-6" : "bg-muted hover:bg-muted-foreground/30"
                                    )}
                                />
                            ))}
                        </div>

                        {currentSlide < slides.length - 1 ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={nextSlide}
                                className="rounded-lg"
                            >
                                Next
                                <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg"
                            >
                                Done
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
