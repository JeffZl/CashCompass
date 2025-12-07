// Exchange Rate Service
// Fetches live exchange rates from a free API with caching

export interface ExchangeRateData {
    rates: Record<string, number>;
    base: string;
    lastUpdated: Date;
    source: string;
}

// Cache key for localStorage
const CACHE_KEY = "cashcompass_exchange_rates";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch exchange rates from the API
 * Uses exchangerate.host (free, no API key required)
 * Falls back to Open Exchange Rates if needed
 */
export async function fetchExchangeRates(base: string = "USD"): Promise<ExchangeRateData> {
    const endpoints = [
        // Primary: exchangerate.host (free, no key needed)
        `https://api.exchangerate.host/latest?base=${base}`,
        // Fallback: frankfurter.app (free, limited currencies)
        `https://api.frankfurter.app/latest?from=${base}`,
    ];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    "Accept": "application/json",
                },
                // Cache for 1 hour on the network level
                next: { revalidate: 3600 },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Handle different API response formats
            let rates: Record<string, number>;

            if (data.rates) {
                rates = data.rates;
            } else {
                throw new Error("Invalid response format");
            }

            // Ensure base currency is in rates
            rates[base] = 1;

            const rateData: ExchangeRateData = {
                rates,
                base,
                lastUpdated: new Date(),
                source: endpoint.includes("exchangerate.host")
                    ? "ExchangeRate.host"
                    : "Frankfurter.app",
            };

            // Cache the rates
            saveRatesToCache(rateData);

            return rateData;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error("Unknown error");
            console.warn(`Failed to fetch from ${endpoint}:`, error);
            continue;
        }
    }

    // If all endpoints fail, try to use cached rates
    const cached = loadRatesFromCache();
    if (cached) {
        console.warn("Using cached exchange rates due to API failure");
        return cached;
    }

    // If no cache, throw the last error
    throw lastError || new Error("Failed to fetch exchange rates");
}

/**
 * Save rates to localStorage cache
 */
function saveRatesToCache(data: ExchangeRateData): void {
    if (typeof window === "undefined") return;

    try {
        const cacheData = {
            ...data,
            lastUpdated: data.lastUpdated.toISOString(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.warn("Failed to cache exchange rates:", error);
    }
}

/**
 * Load rates from localStorage cache
 */
export function loadRatesFromCache(): ExchangeRateData | null {
    if (typeof window === "undefined") return null;

    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const data = JSON.parse(cached);
        return {
            ...data,
            lastUpdated: new Date(data.lastUpdated),
        };
    } catch (error) {
        console.warn("Failed to load cached exchange rates:", error);
        return null;
    }
}

/**
 * Check if cached rates are still fresh (within 24 hours)
 */
export function isCacheFresh(): boolean {
    const cached = loadRatesFromCache();
    if (!cached) return false;

    const age = Date.now() - cached.lastUpdated.getTime();
    return age < CACHE_DURATION_MS;
}

/**
 * Get the age of cached rates as a human-readable string
 */
export function getCacheAge(): string {
    const cached = loadRatesFromCache();
    if (!cached) return "Never updated";

    const age = Date.now() - cached.lastUpdated.getTime();
    const hours = Math.floor(age / (60 * 60 * 1000));
    const minutes = Math.floor((age % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
        return "Just now";
    }
}

/**
 * Clear the cache
 */
export function clearRatesCache(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CACHE_KEY);
}
