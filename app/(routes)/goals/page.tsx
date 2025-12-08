"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useUserSettings } from "@/lib/stores/userSettings";
import { TiltCard } from "@/components/ui/TiltCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EmptyGoals } from "@/components/ui/EmptyState";
import {
    Target,
    Plus,
    Sparkles,
    PiggyBank,
    Home,
    Car,
    Plane,
    GraduationCap,
    Heart,
    Gift,
    Wallet,
    TrendingUp,
    Calendar,
    Trash2,
    Edit,
    CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";

// Goal icons mapping
const goalIcons: Record<string, React.ElementType> = {
    savings: PiggyBank,
    house: Home,
    car: Car,
    travel: Plane,
    education: GraduationCap,
    health: Heart,
    gift: Gift,
    investment: TrendingUp,
    emergency: Wallet,
    other: Target,
};

const goalColors: Record<string, string> = {
    savings: "from-emerald-400 to-emerald-600",
    house: "from-blue-400 to-blue-600",
    car: "from-slate-400 to-slate-600",
    travel: "from-cyan-400 to-cyan-600",
    education: "from-purple-400 to-purple-600",
    health: "from-pink-400 to-pink-600",
    gift: "from-amber-400 to-amber-600",
    investment: "from-indigo-400 to-indigo-600",
    emergency: "from-orange-400 to-orange-600",
    other: "from-gray-400 to-gray-600",
};

interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    category: string;
    deadline?: string;
    createdAt: string;
}

export default function GoalsPage() {
    const { user } = useUser();
    const { preferredCurrency } = useUserSettings();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        targetAmount: "",
        currentAmount: "",
        category: "savings",
        deadline: "",
    });

    const resetForm = () => {
        setFormData({
            name: "",
            targetAmount: "",
            currentAmount: "",
            category: "savings",
            deadline: "",
        });
    };

    const handleAddGoal = () => {
        if (!formData.name || !formData.targetAmount) return;

        const newGoal: Goal = {
            id: crypto.randomUUID(),
            name: formData.name,
            targetAmount: parseFloat(formData.targetAmount),
            currentAmount: parseFloat(formData.currentAmount) || 0,
            category: formData.category,
            deadline: formData.deadline || undefined,
            createdAt: new Date().toISOString(),
        };

        setGoals([...goals, newGoal]);
        resetForm();
        setIsAddingGoal(false);
    };

    const handleUpdateGoal = () => {
        if (!editingGoal || !formData.name || !formData.targetAmount) return;

        setGoals(goals.map(g =>
            g.id === editingGoal.id
                ? {
                    ...g,
                    name: formData.name,
                    targetAmount: parseFloat(formData.targetAmount),
                    currentAmount: parseFloat(formData.currentAmount) || 0,
                    category: formData.category,
                    deadline: formData.deadline || undefined,
                }
                : g
        ));

        resetForm();
        setEditingGoal(null);
    };

    const handleDeleteGoal = (id: string) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const handleAddMoney = (goalId: string, amount: number) => {
        setGoals(goals.map(g => {
            if (g.id === goalId) {
                const newAmount = Math.min(g.currentAmount + amount, g.targetAmount);

                // Celebrate if goal is reached!
                if (newAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
                    });
                }

                return { ...g, currentAmount: newAmount };
            }
            return g;
        }));
    };

    const startEditGoal = (goal: Goal) => {
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount.toString(),
            currentAmount: goal.currentAmount.toString(),
            category: goal.category,
            deadline: goal.deadline || "",
        });
        setEditingGoal(goal);
    };

    // Stats
    const stats = useMemo(() => {
        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
        const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

        return { totalGoals, completedGoals, totalTarget, totalSaved, overallProgress };
    }, [goals]);

    const GoalForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Goal Name</Label>
                <Input
                    placeholder="e.g., Emergency Fund"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Target Amount</Label>
                    <Input
                        type="number"
                        placeholder="10000"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                        className="rounded-xl"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Current Amount</Label>
                    <Input
                        type="number"
                        placeholder="0"
                        value={formData.currentAmount}
                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                        className="rounded-xl"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(goalIcons).map((cat) => (
                                <SelectItem key={cat} value={cat} className="capitalize">
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Target Date (Optional)</Label>
                    <Input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="rounded-xl"
                    />
                </div>
            </div>

            <Button onClick={onSubmit} className="w-full rounded-xl mt-4">
                {submitLabel}
            </Button>
        </div>
    );

    return (
        <div className="space-y-6">
            <PageHeader
                title="Financial Goals"
                subtitle="Set savings goals and track your progress"
            />

            {/* Stats Overview */}
            {goals.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                        <div className="rounded-3xl glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                    <Target className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Goals</p>
                                    <p className="text-lg font-bold">{stats.totalGoals}</p>
                                </div>
                            </div>
                        </div>
                    </TiltCard>

                    <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                        <div className="rounded-3xl glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Completed</p>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {stats.completedGoals}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TiltCard>

                    <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                        <div className="rounded-3xl glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                    <PiggyBank className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Saved</p>
                                    <p className="text-lg font-bold">
                                        {formatCurrency(stats.totalSaved, preferredCurrency)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TiltCard>

                    <TiltCard className="rounded-3xl" tiltAmount={8} scale={1.02}>
                        <div className="rounded-3xl glass-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Overall Progress</p>
                                    <p className="text-lg font-bold">{stats.overallProgress.toFixed(0)}%</p>
                                </div>
                            </div>
                        </div>
                    </TiltCard>
                </div>
            )}

            {/* Add Goal Button */}
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
                <DialogTrigger asChild>
                    <Button className="rounded-xl gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Goal
                    </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Create New Goal
                        </DialogTitle>
                    </DialogHeader>
                    <GoalForm onSubmit={handleAddGoal} submitLabel="Create Goal" />
                </DialogContent>
            </Dialog>

            {/* Edit Goal Dialog */}
            <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
                <DialogContent className="rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Edit Goal
                        </DialogTitle>
                    </DialogHeader>
                    <GoalForm onSubmit={handleUpdateGoal} submitLabel="Save Changes" />
                </DialogContent>
            </Dialog>

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <div className="rounded-3xl glass-card">
                    <EmptyGoals onAdd={() => setIsAddingGoal(true)} />
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                        {goals.map((goal) => {
                            const Icon = goalIcons[goal.category] || Target;
                            const color = goalColors[goal.category] || goalColors.other;
                            const progress = (goal.currentAmount / goal.targetAmount) * 100;
                            const isCompleted = progress >= 100;

                            return (
                                <motion.div
                                    key={goal.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <TiltCard className="rounded-3xl h-full" tiltAmount={8} scale={1.02}>
                                        <div className={cn(
                                            "rounded-3xl glass-card p-5 h-full relative overflow-hidden",
                                            isCompleted && "ring-2 ring-emerald-500/50"
                                        )}>
                                            {isCompleted && (
                                                <div className="absolute top-3 right-3">
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500 animate-bounce-in" />
                                                </div>
                                            )}

                                            {/* Header */}
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className={cn(
                                                    "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white ios-shadow",
                                                    color
                                                )}>
                                                    <Icon className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{goal.name}</h3>
                                                    <p className="text-xs text-muted-foreground capitalize">{goal.category}</p>
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div className="mb-4">
                                                <div className="flex items-end justify-between mb-2">
                                                    <p className="text-2xl font-bold">
                                                        {formatCurrency(goal.currentAmount, preferredCurrency)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        / {formatCurrency(goal.targetAmount, preferredCurrency)}
                                                    </p>
                                                </div>
                                                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={cn("h-full rounded-full bg-gradient-to-r", color)}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min(progress, 100)}%` }}
                                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {progress.toFixed(0)}% complete
                                                </p>
                                            </div>

                                            {/* Deadline */}
                                            {goal.deadline && (
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>Target: {new Date(goal.deadline).toLocaleDateString()}</span>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 rounded-lg text-xs"
                                                    onClick={() => handleAddMoney(goal.id, 100)}
                                                    disabled={isCompleted}
                                                >
                                                    +{formatCurrency(100, preferredCurrency)}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-lg"
                                                    onClick={() => startEditGoal(goal)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="rounded-lg text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </TiltCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
