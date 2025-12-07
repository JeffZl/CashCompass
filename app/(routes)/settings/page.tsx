"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/PageHeader";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
    useUserSettings,
    timezones,
    dateFormats
} from "@/lib/stores/userSettings";
import {
    getCurrency,
    formatCurrency,
    convertCurrency,
    formatExchangeRateInfo,
    exchangeRates,
} from "@/lib/currency";
import {
    Save,
    Loader2,
    CheckCircle,
    Globe,
    Clock,
    Calendar,
    Coins,
    ArrowRightLeft,
    RefreshCw,
    Info,
    Sparkles,
} from "lucide-react";

// Exchange rate display component
function ExchangeRateCard({ fromCode, toCode }: { fromCode: string; toCode: string }) {
    const from = getCurrency(fromCode);
    const to = getCurrency(toCode);
    const rate = exchangeRates[toCode] / exchangeRates[fromCode];

    return (
        <div className="flex items-center justify-between p-3 rounded-xl glass-subtle">
            <div className="flex items-center gap-2">
                <span className="text-lg">{from.flag}</span>
                <span className="text-sm font-medium">{from.code}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowRightLeft className="h-3 w-3" />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-lg">{to.flag}</span>
                <span className="text-sm font-medium">{to.code}</span>
            </div>
            <div className="text-sm font-semibold tabular-nums">
                {rate.toFixed(rate < 10 ? 4 : 2)}
            </div>
        </div>
    );
}

// Conversion preview component
function ConversionPreview({ preferredCurrency }: { preferredCurrency: string }) {
    const testAmounts = [
        { amount: 100, currency: "USD" },
        { amount: 100, currency: "EUR" },
        { amount: 10000, currency: "JPY" },
        { amount: 1500000, currency: "IDR" },
    ];

    return (
        <div className="space-y-2">
            {testAmounts.map(({ amount, currency }) => {
                if (currency === preferredCurrency) return null;
                const converted = convertCurrency(amount, currency, preferredCurrency);
                const fromCurr = getCurrency(currency);

                return (
                    <div key={currency} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {fromCurr.flag} {formatCurrency(amount, currency)}
                        </span>
                        <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                            {getCurrency(preferredCurrency).flag} {formatCurrency(converted, preferredCurrency)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function SettingsPage() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const {
        preferredCurrency,
        timezone,
        dateFormat,
        showConvertedAmounts,
        isSaving,
        lastSaved,
        setPreferredCurrency,
        setTimezone,
        setDateFormat,
        setShowConvertedAmounts,
        saveSettings,
        loadSettings,
    } = useUserSettings();

    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    const [hasChanges, setHasChanges] = useState(false);

    // Load settings on mount
    useEffect(() => {
        if (isUserLoaded && user) {
            loadSettings(user.id);
        }
    }, [isUserLoaded, user, loadSettings]);

    // Track changes
    useEffect(() => {
        setHasChanges(true);
    }, [preferredCurrency, timezone, dateFormat, showConvertedAmounts]);

    // Clear save status after 3 seconds
    useEffect(() => {
        if (saveStatus !== "idle") {
            const timer = setTimeout(() => setSaveStatus("idle"), 3000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    const handleSave = async () => {
        try {
            await saveSettings();
            setSaveStatus("success");
            setHasChanges(false);
        } catch {
            setSaveStatus("error");
        }
    };

    const preferredCurrencyData = getCurrency(preferredCurrency);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <PageHeader
                title="Settings"
                subtitle="Customize your app preferences and display options."
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Currency Settings Card */}
                    <div className="rounded-3xl glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600">
                                <Coins className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">Currency Settings</h2>
                                <p className="text-xs text-muted-foreground">
                                    Set your preferred currency for displaying converted amounts
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Preferred Currency */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Preferred Currency
                                </Label>
                                <CurrencySelector
                                    value={preferredCurrency}
                                    onValueChange={setPreferredCurrency}
                                    className="w-full max-w-xs"
                                />
                                <p className="text-xs text-muted-foreground">
                                    All amounts will be converted and displayed in {preferredCurrencyData.name} ({preferredCurrencyData.symbol})
                                </p>
                            </div>

                            {/* Show Converted Amounts Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-xl glass-subtle">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium">Show Converted Amounts</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Display unified totals in your preferred currency
                                    </p>
                                </div>
                                <Switch
                                    checked={showConvertedAmounts}
                                    onCheckedChange={setShowConvertedAmounts}
                                />
                            </div>

                            {/* Conversion Preview */}
                            {showConvertedAmounts && (
                                <div className="p-4 rounded-xl glass-subtle space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>Conversion Preview</span>
                                    </div>
                                    <ConversionPreview preferredCurrency={preferredCurrency} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Regional Settings Card */}
                    <div className="rounded-3xl glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600">
                                <Globe className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">Regional Settings</h2>
                                <p className="text-xs text-muted-foreground">
                                    Configure timezone and date format preferences
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Timezone */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    Timezone
                                </Label>
                                <Select value={timezone} onValueChange={setTimezone}>
                                    <SelectTrigger className="w-full max-w-md h-12 rounded-xl border-border/50">
                                        <SelectValue placeholder="Select timezone" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl max-h-[300px]">
                                        {timezones.map((tz) => (
                                            <SelectItem key={tz.value} value={tz.value}>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span>{tz.label}</span>
                                                    <span className="text-xs text-muted-foreground">{tz.offset}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Format */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Date Format
                                </Label>
                                <Select value={dateFormat} onValueChange={setDateFormat}>
                                    <SelectTrigger className="w-full max-w-md h-12 rounded-xl border-border/50">
                                        <SelectValue placeholder="Select date format" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {dateFormats.map((df) => (
                                            <SelectItem key={df.value} value={df.value}>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="font-mono text-sm">{df.value}</span>
                                                    <span className="text-muted-foreground">{df.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Save Button Section */}
                    <div className="flex items-center justify-between p-4 rounded-2xl glass-subtle">
                        <div>
                            {saveStatus === "success" && (
                                <div className="flex items-center gap-2 text-emerald-500 text-sm animate-in fade-in-0 slide-in-from-left-2">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Settings saved successfully!</span>
                                </div>
                            )}
                            {saveStatus === "error" && (
                                <div className="flex items-center gap-2 text-rose-500 text-sm animate-in fade-in-0 slide-in-from-left-2">
                                    <Info className="h-4 w-4" />
                                    <span>Failed to save settings. Please try again.</span>
                                </div>
                            )}
                            {saveStatus === "idle" && lastSaved && (
                                <p className="text-xs text-muted-foreground">
                                    Last saved: {lastSaved.toLocaleTimeString()}
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className={cn(
                                "h-11 px-6 rounded-xl font-medium",
                                "bg-gradient-to-r from-blue-500 to-indigo-600",
                                "hover:from-blue-600 hover:to-indigo-700",
                                "text-white ios-shadow",
                                "disabled:opacity-50 disabled:cursor-not-allowed",
                                "ios-transition active:scale-95"
                            )}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Sidebar - Exchange Rates */}
                <div className="space-y-6">
                    {/* Exchange Rates Card */}
                    <div className="rounded-3xl glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">Exchange Rates</h3>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg hover-glass-light"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <ExchangeRateCard fromCode="USD" toCode={preferredCurrency} />
                            {preferredCurrency !== "EUR" && (
                                <ExchangeRateCard fromCode="EUR" toCode={preferredCurrency} />
                            )}
                            {preferredCurrency !== "GBP" && (
                                <ExchangeRateCard fromCode="GBP" toCode={preferredCurrency} />
                            )}
                            {preferredCurrency !== "JPY" && (
                                <ExchangeRateCard fromCode="JPY" toCode={preferredCurrency} />
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-[10px] text-muted-foreground text-center">
                                {formatExchangeRateInfo()}
                            </p>
                        </div>
                    </div>

                    {/* Current Selection Summary */}
                    <div className="rounded-3xl glass-card p-6">
                        <h3 className="text-sm font-semibold mb-4">Your Preferences</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Currency</span>
                                <span className="text-sm font-medium flex items-center gap-1.5">
                                    <span>{preferredCurrencyData.flag}</span>
                                    <span>{preferredCurrency}</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Timezone</span>
                                <span className="text-sm font-medium">
                                    {timezones.find(tz => tz.value === timezone)?.label || timezone}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Date Format</span>
                                <span className="text-sm font-medium font-mono">
                                    {dateFormat}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Show Conversions</span>
                                <span className={cn(
                                    "text-xs font-medium px-2 py-0.5 rounded-md",
                                    showConvertedAmounts
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {showConvertedAmounts ? "Enabled" : "Disabled"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
