"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface UserSettings {
    preferredCurrency: string;
    timezone: string;
    dateFormat: string;
    showConvertedAmounts: boolean;
}

interface UserSettingsState extends UserSettings {
    // State
    isLoading: boolean;
    isSaving: boolean;
    lastSaved: Date | null;
    _hasHydrated: boolean;
    _userId: string | null;

    // Actions
    setPreferredCurrency: (currency: string) => void;
    setTimezone: (timezone: string) => void;
    setDateFormat: (format: string) => void;
    setShowConvertedAmounts: (show: boolean) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    setHasHydrated: (state: boolean) => void;
    setUserId: (userId: string | null) => void;
    resetSettings: () => void;
}

const defaultSettings: UserSettings = {
    preferredCurrency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    dateFormat: "MMM d, yyyy",
    showConvertedAmounts: true,
};

// Base store without persistence for SSR safety
export const useUserSettingsStore = create<UserSettingsState>()(
    persist(
        (set) => ({
            // Default state
            ...defaultSettings,
            isLoading: false,
            isSaving: false,
            lastSaved: null,
            _hasHydrated: false,
            _userId: null,

            // Hydration setter
            setHasHydrated: (state) => {
                set({ _hasHydrated: state });
            },

            setUserId: (userId) => {
                set({ _userId: userId });
            },

            // Actions
            setPreferredCurrency: (currency) => {
                set({ preferredCurrency: currency });
            },

            setTimezone: (timezone) => {
                set({ timezone });
            },

            setDateFormat: (format) => {
                set({ dateFormat: format });
            },

            setShowConvertedAmounts: (show) => {
                set({ showConvertedAmounts: show });
            },

            updateSettings: (settings) => {
                set(settings);
            },

            resetSettings: () => {
                set(defaultSettings);
            },
        }),
        {
            name: "cashcompass-user-settings",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                preferredCurrency: state.preferredCurrency,
                timezone: state.timezone,
                dateFormat: state.dateFormat,
                showConvertedAmounts: state.showConvertedAmounts,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

/**
 * Hook that integrates user settings with Supabase
 * - Loads settings from Supabase on mount
 * - Saves settings to Supabase when they change
 * - Falls back to localStorage for offline support
 */
export function useUserSettings() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const store = useUserSettingsStore();
    const [mounted, setMounted] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Load settings from Supabase on mount
    const loadFromSupabase = useCallback(async () => {
        if (!user?.id) return;

        try {
            const supabase = getSupabaseBrowserClient();
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Failed to load settings from Supabase:', error);
                return;
            }

            if (data) {
                // Update store with Supabase data
                store.updateSettings({
                    preferredCurrency: data.preferred_currency || defaultSettings.preferredCurrency,
                    timezone: data.timezone || defaultSettings.timezone,
                    dateFormat: data.date_format || defaultSettings.dateFormat,
                    showConvertedAmounts: data.show_converted_amounts ?? defaultSettings.showConvertedAmounts,
                });
                console.log('Loaded settings from Supabase:', data);
            }
        } catch (err) {
            console.error('Error loading settings from Supabase:', err);
        } finally {
            setInitialLoadComplete(true);
        }
    }, [user?.id, store]);

    // Save settings to Supabase
    const saveToSupabase = useCallback(async (settings: UserSettings) => {
        if (!user?.id) return;

        try {
            const supabase = getSupabaseBrowserClient();
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    preferred_currency: settings.preferredCurrency,
                    timezone: settings.timezone,
                    date_format: settings.dateFormat,
                    show_converted_amounts: settings.showConvertedAmounts,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id',
                });

            if (error) {
                console.error('Failed to save settings to Supabase:', error);
                return false;
            }

            console.log('Saved settings to Supabase');
            return true;
        } catch (err) {
            console.error('Error saving settings to Supabase:', err);
            return false;
        }
    }, [user?.id]);

    // Set mounted state
    useEffect(() => {
        setMounted(true);
    }, []);

    // Load from Supabase when user is available
    useEffect(() => {
        if (isUserLoaded && user?.id && mounted && !initialLoadComplete) {
            loadFromSupabase();
        }
    }, [isUserLoaded, user?.id, mounted, initialLoadComplete, loadFromSupabase]);

    // Enhanced setters that also save to Supabase
    const setPreferredCurrency = useCallback((currency: string) => {
        store.setPreferredCurrency(currency);
        saveToSupabase({ ...store, preferredCurrency: currency });
    }, [store, saveToSupabase]);

    const setTimezone = useCallback((timezone: string) => {
        store.setTimezone(timezone);
        saveToSupabase({ ...store, timezone });
    }, [store, saveToSupabase]);

    const setDateFormat = useCallback((format: string) => {
        store.setDateFormat(format);
        saveToSupabase({ ...store, dateFormat: format });
    }, [store, saveToSupabase]);

    const setShowConvertedAmounts = useCallback((show: boolean) => {
        store.setShowConvertedAmounts(show);
        saveToSupabase({ ...store, showConvertedAmounts: show });
    }, [store, saveToSupabase]);

    const updateSettings = useCallback((settings: Partial<UserSettings>) => {
        store.updateSettings(settings);
        saveToSupabase({ ...store, ...settings });
    }, [store, saveToSupabase]);

    // Manual save function
    const saveSettings = useCallback(async () => {
        const currentSettings: UserSettings = {
            preferredCurrency: store.preferredCurrency,
            timezone: store.timezone,
            dateFormat: store.dateFormat,
            showConvertedAmounts: store.showConvertedAmounts,
        };
        return saveToSupabase(currentSettings);
    }, [store, saveToSupabase]);

    // Return store values only after mounted to avoid hydration mismatch
    return {
        // State
        preferredCurrency: mounted ? store.preferredCurrency : defaultSettings.preferredCurrency,
        timezone: mounted ? store.timezone : defaultSettings.timezone,
        dateFormat: mounted ? store.dateFormat : defaultSettings.dateFormat,
        showConvertedAmounts: mounted ? store.showConvertedAmounts : defaultSettings.showConvertedAmounts,
        isLoading: !initialLoadComplete && isUserLoaded && !!user?.id,
        isSaving: store.isSaving,
        lastSaved: store.lastSaved,
        isHydrated: mounted && store._hasHydrated,

        // Actions that save to Supabase
        setPreferredCurrency,
        setTimezone,
        setDateFormat,
        setShowConvertedAmounts,
        updateSettings,
        saveSettings,
        resetSettings: store.resetSettings,

        // Refresh from Supabase
        refresh: loadFromSupabase,
    };
}

// Timezone options
export const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)", offset: "UTC-5" },
    { value: "America/Chicago", label: "Central Time (CT)", offset: "UTC-6" },
    { value: "America/Denver", label: "Mountain Time (MT)", offset: "UTC-7" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "UTC-8" },
    { value: "Europe/London", label: "London (GMT)", offset: "UTC+0" },
    { value: "Europe/Paris", label: "Paris (CET)", offset: "UTC+1" },
    { value: "Europe/Berlin", label: "Berlin (CET)", offset: "UTC+1" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: "UTC+9" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: "UTC+8" },
    { value: "Asia/Singapore", label: "Singapore (SGT)", offset: "UTC+8" },
    { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)", offset: "UTC+8" },
    { value: "Asia/Jakarta", label: "Jakarta (WIB)", offset: "UTC+7" },
    { value: "Asia/Bangkok", label: "Bangkok (ICT)", offset: "UTC+7" },
    { value: "Australia/Sydney", label: "Sydney (AEDT)", offset: "UTC+11" },
    { value: "Pacific/Auckland", label: "Auckland (NZDT)", offset: "UTC+13" },
];

// Date format options
export const dateFormats = [
    { value: "MMM d, yyyy", label: "Dec 7, 2025" },
    { value: "d MMM yyyy", label: "7 Dec 2025" },
    { value: "MM/dd/yyyy", label: "12/07/2025" },
    { value: "dd/MM/yyyy", label: "07/12/2025" },
    { value: "yyyy-MM-dd", label: "2025-12-07" },
];
