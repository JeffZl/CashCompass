"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
    fetchExchangeRates,
    loadRatesFromCache,
    isCacheFresh,
    ExchangeRateData,
    getCacheAge,
} from "@/lib/services/exchangeRates";
import { useUserSettings } from "@/lib/stores/userSettings";

// Fallback static rates (used when API fails and no cache exists)
const FALLBACK_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CNY: 7.24,
    IDR: 15850,
    AUD: 1.54,
    CAD: 1.36,
    CHF: 0.88,
    SGD: 1.34,
    HKD: 7.80,
    KRW: 1320,
    INR: 83.40,
    MYR: 4.47,
    THB: 35.20,
    PHP: 56.10,
    VND: 24350,
    MXN: 17.35,
    BRL: 4.97,
    NZD: 1.67,
    SEK: 10.85,
    NOK: 11.05,
    DKK: 6.92,
    AED: 3.67,
    SAR: 3.75,
    ZAR: 18.90,
    RUB: 92.50,
    TRY: 29.20,
    PLN: 4.05,
    CZK: 23.10,
};

interface ExchangeRateContextValue {
    // State
    rates: Record<string, number>;
    baseCurrency: string;
    lastUpdated: Date | null;
    source: string;
    isLoading: boolean;
    error: string | null;
    isFresh: boolean;
    cacheAge: string;

    // Actions
    refreshRates: () => Promise<void>;
    convertAmount: (amount: number, from: string, to: string) => number;
    convertToPreferred: (amount: number, from: string) => number;
    formatConverted: (amount: number, from: string) => string;
}

const ExchangeRateContext = createContext<ExchangeRateContextValue | null>(null);

interface ExchangeRateProviderProps {
    children: ReactNode;
}

export function ExchangeRateProvider({ children }: ExchangeRateProviderProps) {
    const { preferredCurrency } = useUserSettings();

    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [baseCurrency, setBaseCurrency] = useState("USD");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [source, setSource] = useState("Static rates (fallback)");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFresh, setIsFresh] = useState(false);
    const [cacheAge, setCacheAge] = useState("Never updated");

    // Load cached rates on mount
    useEffect(() => {
        const cached = loadRatesFromCache();
        if (cached) {
            setRates(cached.rates);
            setBaseCurrency(cached.base);
            setLastUpdated(cached.lastUpdated);
            setSource(cached.source);
            setIsFresh(isCacheFresh());
            setCacheAge(getCacheAge());
        }
    }, []);

    // Refresh rates from API
    const refreshRates = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchExchangeRates("USD");
            setRates(data.rates);
            setBaseCurrency(data.base);
            setLastUpdated(data.lastUpdated);
            setSource(data.source);
            setIsFresh(true);
            setCacheAge("Just now");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch exchange rates";
            setError(message);
            console.error("Exchange rate fetch error:", err);

            // Keep using current rates (either cached or fallback)
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Auto-refresh on mount if cache is stale
    useEffect(() => {
        if (!isCacheFresh()) {
            refreshRates();
        }
    }, [refreshRates]);

    // Update cache age periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setCacheAge(getCacheAge());
            setIsFresh(isCacheFresh());
        }, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    // Convert amount between currencies
    const convertAmount = useCallback((amount: number, from: string, to: string): number => {
        if (from === to) return amount;

        const fromRate = rates[from] || 1;
        const toRate = rates[to] || 1;

        // Convert: from -> USD (base) -> to
        const inBase = amount / fromRate;
        return inBase * toRate;
    }, [rates]);

    // Convert to user's preferred currency
    const convertToPreferred = useCallback((amount: number, from: string): number => {
        return convertAmount(amount, from, preferredCurrency);
    }, [convertAmount, preferredCurrency]);

    // Format converted amount
    const formatConverted = useCallback((amount: number, from: string): string => {
        const converted = convertToPreferred(amount, from);

        // Use Intl.NumberFormat for proper formatting
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: preferredCurrency,
                minimumFractionDigits: ["JPY", "KRW", "VND", "IDR"].includes(preferredCurrency) ? 0 : 2,
                maximumFractionDigits: ["JPY", "KRW", "VND", "IDR"].includes(preferredCurrency) ? 0 : 2,
            }).format(converted);
        } catch {
            return `${converted.toFixed(2)} ${preferredCurrency}`;
        }
    }, [convertToPreferred, preferredCurrency]);

    const value: ExchangeRateContextValue = {
        rates,
        baseCurrency,
        lastUpdated,
        source,
        isLoading,
        error,
        isFresh,
        cacheAge,
        refreshRates,
        convertAmount,
        convertToPreferred,
        formatConverted,
    };

    return (
        <ExchangeRateContext.Provider value={value}>
            {children}
        </ExchangeRateContext.Provider>
    );
}

// Custom hook to use exchange rates
export function useExchangeRates() {
    const context = useContext(ExchangeRateContext);
    if (!context) {
        throw new Error("useExchangeRates must be used within an ExchangeRateProvider");
    }
    return context;
}

// Standalone conversion function (for use outside React components)
export function convertCurrency(
    amount: number,
    from: string,
    to: string,
    rates: Record<string, number>
): number {
    if (from === to) return amount;

    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    return (amount / fromRate) * toRate;
}
