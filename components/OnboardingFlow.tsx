"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Wallet,
    Tag,
    CreditCard,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Check,
    PartyPopper,
} from "lucide-react";

interface OnboardingFlowProps {
    hasAccounts: boolean;
    hasCategories: boolean;
    hasTransactions: boolean;
    onCreateAccount: () => void;
    onCreateCategory: () => void;
    onCreateTransaction: () => void;
    onComplete: () => void;
}

interface Step {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    action: () => void;
    actionLabel: string;
    isComplete: boolean;
}

const ONBOARDING_KEY = "cashcompass-onboarding-complete";

// Confetti Component
function Confetti({ isActive }: { isActive: boolean }) {
    const [particles, setParticles] = useState<Array<{
        id: number;
        x: number;
        color: string;
        delay: number;
        size: number;
    }>>([]);

    useEffect(() => {
        if (isActive) {
            const colors = [
                "#f43f5e", "#8b5cf6", "#3b82f6", "#10b981",
                "#f59e0b", "#ec4899", "#06b6d4", "#a855f7",
            ];
            const newParticles = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
                delay: Math.random() * 2,
                size: Math.random() * 8 + 4,
            }));
            setParticles(newParticles);

            const timer = setTimeout(() => {
                setParticles([]);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [isActive]);

    if (!isActive || particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute animate-confetti-fall"
                    style={{
                        left: `${particle.x}%`,
                        top: "-20px",
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                        animationDelay: `${particle.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

export function OnboardingFlow({
    hasAccounts,
    hasCategories,
    hasTransactions,
    onCreateAccount,
    onCreateCategory,
    onCreateTransaction,
    onComplete,
}: OnboardingFlowProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [completedDuringSession, setCompletedDuringSession] = useState<Set<string>>(new Set());

    // Check if onboarding should be shown
    useEffect(() => {
        const isComplete = localStorage.getItem(ONBOARDING_KEY);
        if (!isComplete && !hasAccounts && !hasCategories && !hasTransactions) {
            // First time user with no data
            setIsOpen(true);
        }
    }, [hasAccounts, hasCategories, hasTransactions]);

    const steps: Step[] = [
        {
            id: "account",
            title: "Create Your First Account",
            description: "Add a bank account, credit card, or cash wallet to track your money.",
            icon: Wallet,
            color: "from-blue-400 to-indigo-600",
            action: onCreateAccount,
            actionLabel: "Add Account",
            isComplete: hasAccounts || completedDuringSession.has("account"),
        },
        {
            id: "category",
            title: "Set Up Categories",
            description: "Organize your spending with categories like Food, Transport, Entertainment.",
            icon: Tag,
            color: "from-violet-400 to-purple-600",
            action: onCreateCategory,
            actionLabel: "Add Category",
            isComplete: hasCategories || completedDuringSession.has("category"),
        },
        {
            id: "transaction",
            title: "Add Your First Transaction",
            description: "Record an expense or income to start tracking your finances.",
            icon: CreditCard,
            color: "from-emerald-400 to-green-600",
            action: onCreateTransaction,
            actionLabel: "Add Transaction",
            isComplete: hasTransactions || completedDuringSession.has("transaction"),
        },
    ];

    const currentStepData = steps[currentStep];
    const allComplete = steps.every((s) => s.isComplete);
    const completedCount = steps.filter((s) => s.isComplete).length;

    // Mark step as complete and trigger confetti
    const handleStepAction = () => {
        const stepId = currentStepData.id;

        // Execute the action
        currentStepData.action();

        // Mark as complete locally
        setCompletedDuringSession((prev) => new Set([...prev, stepId]));

        // Show confetti!
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        // Move to next incomplete step
        setTimeout(() => {
            const nextIncomplete = steps.findIndex((s, i) =>
                i > currentStep && !s.isComplete && !completedDuringSession.has(s.id)
            );
            if (nextIncomplete !== -1) {
                setCurrentStep(nextIncomplete);
            }
        }, 500);
    };

    const handleComplete = () => {
        localStorage.setItem(ONBOARDING_KEY, "true");
        setShowConfetti(true);
        setTimeout(() => {
            setShowConfetti(false);
            setIsOpen(false);
            onComplete();
        }, 2000);
    };

    const handleSkip = () => {
        localStorage.setItem(ONBOARDING_KEY, "true");
        setIsOpen(false);
    };

    return (
        <>
            <Confetti isActive={showConfetti} />

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className={cn(
                    "sm:max-w-[500px] rounded-3xl p-0 gap-0 overflow-hidden",
                    "glass border-border/50"
                )}>
                    {/* Header */}
                    <div className="p-6 pb-4 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center ios-shadow animate-float">
                                <Sparkles className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Welcome to CashCompass! 🎉
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            Let's get you set up in just 3 quick steps
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="px-6 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-medium">{completedCount}/3 completed</span>
                        </div>
                        <div className="flex gap-2">
                            {steps.map((step, i) => (
                                <div
                                    key={step.id}
                                    className={cn(
                                        "flex-1 h-2 rounded-full ios-transition",
                                        step.isComplete
                                            ? "bg-gradient-to-r from-violet-500 to-purple-600"
                                            : "bg-muted/50"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="px-6 pb-6">
                        <div className={cn(
                            "rounded-2xl p-6 text-center",
                            "bg-gradient-to-br",
                            currentStepData.color,
                            "text-white"
                        )}>
                            <div className="flex justify-center mb-4">
                                {currentStepData.isComplete ? (
                                    <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                        <Check className="h-8 w-8" />
                                    </div>
                                ) : (
                                    <currentStepData.icon className="h-14 w-14 opacity-90" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                {currentStepData.isComplete ? "Completed!" : currentStepData.title}
                            </h3>
                            <p className="text-sm text-white/80">
                                {currentStepData.isComplete
                                    ? "Great job! You're making progress."
                                    : currentStepData.description
                                }
                            </p>
                        </div>

                        {/* Step Indicators */}
                        <div className="flex justify-center gap-2 mt-4">
                            {steps.map((step, i) => (
                                <button
                                    key={step.id}
                                    onClick={() => setCurrentStep(i)}
                                    className={cn(
                                        "h-2 rounded-full ios-transition",
                                        i === currentStep ? "w-6 bg-primary" : "w-2 bg-muted",
                                        step.isComplete && "bg-emerald-500"
                                    )}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 pt-0 space-y-3">
                        {allComplete ? (
                            <Button
                                onClick={handleComplete}
                                className={cn(
                                    "w-full h-12 rounded-xl font-medium",
                                    "bg-gradient-to-r from-violet-500 to-purple-600",
                                    "hover:from-violet-600 hover:to-purple-700",
                                    "text-white ios-shadow",
                                    "ios-transition active:scale-95"
                                )}
                            >
                                <PartyPopper className="h-5 w-5 mr-2" />
                                Start Using CashCompass!
                            </Button>
                        ) : (
                            <>
                                {!currentStepData.isComplete && (
                                    <Button
                                        onClick={handleStepAction}
                                        className={cn(
                                            "w-full h-12 rounded-xl font-medium",
                                            "bg-gradient-to-r",
                                            currentStepData.color,
                                            "text-white ios-shadow",
                                            "ios-transition active:scale-95"
                                        )}
                                    >
                                        {currentStepData.actionLabel}
                                        <ChevronRight className="h-5 w-5 ml-2" />
                                    </Button>
                                )}

                                {/* Navigation */}
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                        disabled={currentStep === 0}
                                        className="flex-1 h-10 rounded-xl border-border/50"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Back
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                                        disabled={currentStep === steps.length - 1}
                                        className="flex-1 h-10 rounded-xl border-border/50"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Skip Link */}
                        <button
                            onClick={handleSkip}
                            className="w-full text-xs text-muted-foreground hover:text-foreground ios-transition"
                        >
                            Skip for now
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Hook to check if onboarding was completed
export function useOnboardingComplete() {
    const [isComplete, setIsComplete] = useState(true);

    useEffect(() => {
        setIsComplete(localStorage.getItem(ONBOARDING_KEY) === "true");
    }, []);

    const resetOnboarding = useCallback(() => {
        localStorage.removeItem(ONBOARDING_KEY);
        setIsComplete(false);
    }, []);

    return { isComplete, resetOnboarding };
}
