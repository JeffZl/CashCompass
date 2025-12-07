"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

    // Actions
    setPreferredCurrency: (currency: string) => void;
    setTimezone: (timezone: string) => void;
    setDateFormat: (format: string) => void;
    setShowConvertedAmounts: (show: boolean) => void;
    updateSettings: (settings: Partial<UserSettings>) => void;
    saveSettings: () => Promise<void>;
    loadSettings: (userId: string) => Promise<void>;
    resetSettings: () => void;
}

const defaultSettings: UserSettings = {
    preferredCurrency: "USD",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    dateFormat: "MMM d, yyyy",
    showConvertedAmounts: true,
};

export const useUserSettings = create<UserSettingsState>()(
    persist(
        (set, get) => ({
            // Default state
            ...defaultSettings,
            isLoading: false,
            isSaving: false,
            lastSaved: null,

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

            saveSettings: async () => {
                set({ isSaving: true });

                try {
                    // TODO: Save to Supabase
                    // const { error } = await supabase
                    //     .from('user_settings')
                    //     .upsert({
                    //         user_id: userId,
                    //         preferred_currency: get().preferredCurrency,
                    //         timezone: get().timezone,
                    //         date_format: get().dateFormat,
                    //         show_converted_amounts: get().showConvertedAmounts,
                    //         updated_at: new Date().toISOString(),
                    //     });
                    // 
                    // if (error) throw error;

                    // Simulate API delay
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    set({ lastSaved: new Date() });
                } catch (error) {
                    console.error("Failed to save settings:", error);
                    throw error;
                } finally {
                    set({ isSaving: false });
                }
            },

            loadSettings: async (userId: string) => {
                set({ isLoading: true });

                try {
                    // TODO: Load from Supabase
                    // const { data, error } = await supabase
                    //     .from('user_settings')
                    //     .select('*')
                    //     .eq('user_id', userId)
                    //     .single();
                    // 
                    // if (error && error.code !== 'PGRST116') throw error;
                    // 
                    // if (data) {
                    //     set({
                    //         preferredCurrency: data.preferred_currency,
                    //         timezone: data.timezone,
                    //         dateFormat: data.date_format,
                    //         showConvertedAmounts: data.show_converted_amounts,
                    //     });
                    // }

                    // Simulate API delay
                    await new Promise((resolve) => setTimeout(resolve, 300));

                    console.log("Loaded settings for user:", userId);
                } catch (error) {
                    console.error("Failed to load settings:", error);
                } finally {
                    set({ isLoading: false });
                }
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
        }
    )
);

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
