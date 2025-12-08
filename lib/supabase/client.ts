import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Browser-side Supabase client (for use in React components)
// Using 'any' for database type to avoid strict type checking issues
// In production, generate proper types with: supabase gen types typescript

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
    if (supabaseClient) return supabaseClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // Return a mock client for development when env vars are missing
        console.warn('Supabase environment variables missing. Using mock mode.');
        return null as unknown as SupabaseClient;
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: false,
        },
    });

    return supabaseClient;
}

// Hook-friendly function to get supabase client
export function useSupabase(): SupabaseClient | null {
    try {
        return getSupabaseBrowserClient();
    } catch {
        return null;
    }
}
