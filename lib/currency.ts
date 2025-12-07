// Currency configuration and utilities for multi-currency support
// Uses ISO 4217 currency codes and Intl.NumberFormat for proper formatting

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    locale: string;
    flag: string;
}

// Major world currencies
export const currencies: Currency[] = [
    { code: "USD", name: "US Dollar", symbol: "$", locale: "en-US", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", symbol: "€", locale: "de-DE", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", symbol: "£", locale: "en-GB", flag: "🇬🇧" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", locale: "ja-JP", flag: "🇯🇵" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", locale: "zh-CN", flag: "🇨🇳" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", locale: "id-ID", flag: "🇮🇩" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU", flag: "🇦🇺" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", locale: "en-CA", flag: "🇨🇦" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", locale: "de-CH", flag: "🇨🇭" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$", locale: "en-SG", flag: "🇸🇬" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", locale: "zh-HK", flag: "🇭🇰" },
    { code: "KRW", name: "South Korean Won", symbol: "₩", locale: "ko-KR", flag: "🇰🇷" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", locale: "en-IN", flag: "🇮🇳" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", locale: "ms-MY", flag: "🇲🇾" },
    { code: "THB", name: "Thai Baht", symbol: "฿", locale: "th-TH", flag: "🇹🇭" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱", locale: "en-PH", flag: "🇵🇭" },
    { code: "VND", name: "Vietnamese Dong", symbol: "₫", locale: "vi-VN", flag: "🇻🇳" },
    { code: "MXN", name: "Mexican Peso", symbol: "MX$", locale: "es-MX", flag: "🇲🇽" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", locale: "pt-BR", flag: "🇧🇷" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", locale: "en-NZ", flag: "🇳🇿" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr", locale: "sv-SE", flag: "🇸🇪" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr", locale: "nb-NO", flag: "🇳🇴" },
    { code: "DKK", name: "Danish Krone", symbol: "kr", locale: "da-DK", flag: "🇩🇰" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ", locale: "ar-AE", flag: "🇦🇪" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼", locale: "ar-SA", flag: "🇸🇦" },
    { code: "ZAR", name: "South African Rand", symbol: "R", locale: "en-ZA", flag: "🇿🇦" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽", locale: "ru-RU", flag: "🇷🇺" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺", locale: "tr-TR", flag: "🇹🇷" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł", locale: "pl-PL", flag: "🇵🇱" },
    { code: "CZK", name: "Czech Koruna", symbol: "Kč", locale: "cs-CZ", flag: "🇨🇿" },
];

// Get currency by code
export function getCurrency(code: string): Currency {
    return currencies.find((c) => c.code === code) || currencies[0]; // Default to USD
}

// Default currency
export const defaultCurrency = currencies[0]; // USD

/**
 * Format a number as currency using Intl.NumberFormat
 * @param amount - The amount to format (always positive internally)
 * @param currencyCode - ISO 4217 currency code (e.g., "USD", "EUR")
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @param compact - Whether to use compact notation for large numbers (default: false)
 */
export function formatCurrency(
    amount: number,
    currencyCode: string = "USD",
    showSymbol: boolean = true,
    compact: boolean = false
): string {
    const currency = getCurrency(currencyCode);

    try {
        const formatter = new Intl.NumberFormat(currency.locale, {
            style: showSymbol ? "currency" : "decimal",
            currency: currency.code,
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: currencyCode === "JPY" || currencyCode === "KRW" || currencyCode === "VND" || currencyCode === "IDR" ? 0 : 2,
            maximumFractionDigits: currencyCode === "JPY" || currencyCode === "KRW" || currencyCode === "VND" || currencyCode === "IDR" ? 0 : 2,
            notation: compact ? "compact" : "standard",
        });

        return formatter.format(Math.abs(amount));
    } catch {
        // Fallback formatting
        const formatted = Math.abs(amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return showSymbol ? `${currency.symbol}${formatted}` : formatted;
    }
}

/**
 * Format amount with sign prefix (+/-)
 * @param amount - The amount (positive for income, negative for expense)
 * @param currencyCode - ISO 4217 currency code
 * @param forceSign - Whether to always show +/- sign
 */
export function formatCurrencyWithSign(
    amount: number,
    currencyCode: string = "USD",
    forceSign: boolean = true
): string {
    const formatted = formatCurrency(amount, currencyCode);
    const prefix = amount >= 0 ? (forceSign ? "+" : "") : "-";
    return amount < 0 ? `-${formatted}` : `${prefix}${formatted}`;
}

/**
 * Get currency symbol only
 */
export function getCurrencySymbol(currencyCode: string): string {
    return getCurrency(currencyCode).symbol;
}

/**
 * Group amounts by currency
 * @param items - Array of items with amount and currency
 * @returns Record of currency code to total amount
 */
export function groupByCurrency<T extends { amount: number; currency: string }>(
    items: T[]
): Record<string, number> {
    return items.reduce((acc, item) => {
        const currency = item.currency || "USD";
        acc[currency] = (acc[currency] || 0) + item.amount;
        return acc;
    }, {} as Record<string, number>);
}

/**
 * Calculate totals by currency for income and expenses
 */
export interface CurrencyTotals {
    income: Record<string, number>;
    expenses: Record<string, number>;
    balance: Record<string, number>;
}

export function calculateCurrencyTotals<T extends { amount: number; currency: string; type: "income" | "expense" }>(
    transactions: T[]
): CurrencyTotals {
    const totals: CurrencyTotals = {
        income: {},
        expenses: {},
        balance: {},
    };

    transactions.forEach((t) => {
        const currency = t.currency || "USD";
        const amount = Math.abs(t.amount);

        if (t.type === "income") {
            totals.income[currency] = (totals.income[currency] || 0) + amount;
            totals.balance[currency] = (totals.balance[currency] || 0) + amount;
        } else {
            totals.expenses[currency] = (totals.expenses[currency] || 0) + amount;
            totals.balance[currency] = (totals.balance[currency] || 0) - amount;
        }
    });

    return totals;
}

/**
 * Get all unique currencies from transactions
 */
export function getUniqueCurrencies<T extends { currency: string }>(items: T[]): string[] {
    return [...new Set(items.map((item) => item.currency || "USD"))];
}

// ============================================
// CURRENCY CONVERSION UTILITIES
// ============================================

/**
 * Exchange rates relative to USD (1 USD = X units of target currency)
 * Last updated: 2025-12-07
 * For production, replace with API call to exchangerate-api.com or similar
 */
export const exchangeRates: Record<string, number> = {
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

// Exchange rate metadata
export interface ExchangeRateInfo {
    lastUpdated: Date;
    source: string;
}

export const exchangeRateInfo: ExchangeRateInfo = {
    lastUpdated: new Date("2025-12-07T00:00:00Z"),
    source: "Static rates (demo)",
};

/**
 * Get exchange rate for a currency pair
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Exchange rate (1 unit of 'from' in 'to' currency)
 */
export function getExchangeRate(from: string, to: string): number {
    const fromRate = exchangeRates[from] || 1;
    const toRate = exchangeRates[to] || 1;

    // Convert: from -> USD -> to
    return toRate / fromRate;
}

/**
 * Convert an amount from one currency to another
 * @param amount - Amount to convert
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(amount: number, from: string, to: string): number {
    if (from === to) return amount;

    const rate = getExchangeRate(from, to);
    return amount * rate;
}

/**
 * Convert and format an amount
 * @param amount - Amount to convert
 * @param from - Source currency code
 * @param to - Target currency code (displays in this currency)
 * @returns Formatted string in target currency
 */
export function convertAndFormatCurrency(
    amount: number,
    from: string,
    to: string
): string {
    const converted = convertCurrency(amount, from, to);
    return formatCurrency(converted, to);
}

/**
 * Convert multiple currency totals to a single preferred currency
 * @param totals - Record of currency code to amount
 * @param preferredCurrency - Target currency to convert to
 * @returns Total amount in preferred currency
 */
export function convertTotalsToPreferred(
    totals: Record<string, number>,
    preferredCurrency: string
): number {
    return Object.entries(totals).reduce((acc, [currency, amount]) => {
        return acc + convertCurrency(amount, currency, preferredCurrency);
    }, 0);
}

/**
 * Calculate unified totals in a preferred currency
 */
export interface UnifiedTotals {
    income: number;
    expenses: number;
    balance: number;
    currency: string;
}

export function calculateUnifiedTotals<T extends { amount: number; currency: string; type: "income" | "expense" }>(
    transactions: T[],
    preferredCurrency: string
): UnifiedTotals {
    const totals: UnifiedTotals = {
        income: 0,
        expenses: 0,
        balance: 0,
        currency: preferredCurrency,
    };

    transactions.forEach((t) => {
        const convertedAmount = convertCurrency(Math.abs(t.amount), t.currency || "USD", preferredCurrency);

        if (t.type === "income") {
            totals.income += convertedAmount;
            totals.balance += convertedAmount;
        } else {
            totals.expenses += convertedAmount;
            totals.balance -= convertedAmount;
        }
    });

    return totals;
}

/**
 * Format rate info for display
 */
export function formatExchangeRateInfo(): string {
    const date = exchangeRateInfo.lastUpdated;
    return `${exchangeRateInfo.source} • Updated ${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })}`;
}
