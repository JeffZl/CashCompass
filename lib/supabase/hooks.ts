"use client";

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DbTransaction {
    id: string;
    user_id: string;
    account_id: string;
    category_id: string;
    amount: number;
    currency: string;
    type: 'income' | 'expense';
    description: string;
    date: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbAccount {
    id: string;
    user_id: string;
    name: string;
    type: 'bank' | 'cash' | 'card' | 'wallet' | 'savings' | 'other';
    balance: number;
    currency: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbCategory {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    created_at?: string;
    updated_at?: string;
}

export interface DbBudget {
    id: string;
    user_id: string;
    category_id: string;
    amount: number;
    currency: string;
    start_date: string;
    end_date: string;
    created_at?: string;
    updated_at?: string;
}

export interface DbUserSettings {
    id: string;
    user_id: string;
    preferred_currency: string;
    timezone: string;
    date_format: string;
    show_converted_amounts: boolean;
    created_at?: string;
    updated_at?: string;
}

// Extended types with relationships
export interface TransactionWithRelations extends DbTransaction {
    account?: DbAccount;
    category?: DbCategory;
}

export interface BudgetWithRelations extends DbBudget {
    category?: DbCategory;
    spent?: number;
}

export interface CategoryWithCount extends DbCategory {
    transaction_count?: number;
}

// ============================================
// HELPER FUNCTION
// ============================================

function getSupabase(): SupabaseClient | null {
    try {
        const client = getSupabaseBrowserClient();
        return client;
    } catch {
        return null;
    }
}

// ============================================
// TRANSACTIONS HOOK
// ============================================
export function useTransactions() {
    const { user } = useUser();
    const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = getSupabase();

    // Fetch transactions with relations
    const fetchTransactions = useCallback(async () => {
        if (!user?.id || !supabase) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('transactions')
                .select(`
                    *,
                    account:accounts(*),
                    category:categories(*)
                `)
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (fetchError) throw fetchError;
            setTransactions((data as TransactionWithRelations[]) || []);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, supabase]);

    // Create transaction
    const createTransaction = async (data: Omit<DbTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DbTransaction | null> => {
        if (!user?.id || !supabase) return null;

        try {
            const { data: newTransaction, error: insertError } = await supabase
                .from('transactions')
                .insert({ ...data, user_id: user.id })
                .select(`
                    *,
                    account:accounts(*),
                    category:categories(*)
                `)
                .single();

            if (insertError) throw insertError;

            setTransactions((prev) => [newTransaction as TransactionWithRelations, ...prev]);
            return newTransaction as DbTransaction;
        } catch (err) {
            console.error('Failed to create transaction:', err);
            throw err;
        }
    };

    // Update transaction
    const updateTransaction = async (id: string, data: Partial<DbTransaction>): Promise<DbTransaction | null> => {
        if (!supabase) return null;

        try {
            const { data: updated, error: updateError } = await supabase
                .from('transactions')
                .update(data)
                .eq('id', id)
                .select(`
                    *,
                    account:accounts(*),
                    category:categories(*)
                `)
                .single();

            if (updateError) throw updateError;

            setTransactions((prev) =>
                prev.map((t) => (t.id === id ? (updated as TransactionWithRelations) : t))
            );
            return updated as DbTransaction;
        } catch (err) {
            console.error('Failed to update transaction:', err);
            throw err;
        }
    };

    // Delete transaction
    const deleteTransaction = async (id: string): Promise<boolean> => {
        if (!supabase) return false;

        try {
            const { error: deleteError } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setTransactions((prev) => prev.filter((t) => t.id !== id));
            return true;
        } catch (err) {
            console.error('Failed to delete transaction:', err);
            throw err;
        }
    };

    // Real-time subscription
    useEffect(() => {
        if (!user?.id || !supabase) return;

        fetchTransactions();

        const channel: RealtimeChannel = supabase
            .channel('transactions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, supabase, fetchTransactions]);

    return {
        transactions,
        isLoading,
        error,
        refresh: fetchTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
    };
}

// ============================================
// ACCOUNTS HOOK
// ============================================
export function useAccounts() {
    const { user } = useUser();
    const [accounts, setAccounts] = useState<DbAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = getSupabase();

    // Fetch accounts
    const fetchAccounts = useCallback(async () => {
        if (!user?.id || !supabase) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            if (fetchError) throw fetchError;
            setAccounts((data as DbAccount[]) || []);
        } catch (err) {
            console.error('Failed to fetch accounts:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, supabase]);

    // Create account
    const createAccount = async (data: Omit<DbAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DbAccount | null> => {
        if (!user?.id) {
            console.error('createAccount: No user ID available');
            throw new Error('You must be logged in to create an account');
        }
        if (!supabase) {
            console.error('createAccount: Supabase client not initialized');
            throw new Error('Database connection not available');
        }

        console.log('Creating account with user_id:', user.id, 'data:', data);

        try {
            const { data: newAccount, error: insertError } = await supabase
                .from('accounts')
                .insert({ ...data, user_id: user.id })
                .select()
                .single();

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                throw new Error(insertError.message || 'Failed to create account in database');
            }

            console.log('Account created successfully:', newAccount);
            setAccounts((prev) => [newAccount as DbAccount, ...prev]);
            return newAccount as DbAccount;
        } catch (err) {
            console.error('Failed to create account:', err);
            throw err;
        }
    };

    // Update account
    const updateAccount = async (id: string, data: Partial<DbAccount>): Promise<DbAccount | null> => {
        if (!supabase) return null;

        try {
            const { data: updated, error: updateError } = await supabase
                .from('accounts')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            setAccounts((prev) =>
                prev.map((a) => (a.id === id ? (updated as DbAccount) : a))
            );
            return updated as DbAccount;
        } catch (err) {
            console.error('Failed to update account:', err);
            throw err;
        }
    };

    // Delete account
    const deleteAccount = async (id: string): Promise<boolean> => {
        if (!supabase) return false;

        try {
            const { error: deleteError } = await supabase
                .from('accounts')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setAccounts((prev) => prev.filter((a) => a.id !== id));
            return true;
        } catch (err) {
            console.error('Failed to delete account:', err);
            throw err;
        }
    };

    // Real-time subscription
    useEffect(() => {
        if (!user?.id || !supabase) return;

        fetchAccounts();

        const channel: RealtimeChannel = supabase
            .channel('accounts-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'accounts',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchAccounts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, supabase, fetchAccounts]);

    return {
        accounts,
        isLoading,
        error,
        refresh: fetchAccounts,
        createAccount,
        updateAccount,
        deleteAccount,
    };
}

// ============================================
// CATEGORIES HOOK
// ============================================
export function useCategories() {
    const { user } = useUser();
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = getSupabase();

    // Fetch categories with transaction counts
    const fetchCategories = useCallback(async () => {
        if (!user?.id || !supabase) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch categories
            const { data: categoriesData, error: fetchError } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
                .order('name');

            if (fetchError) throw fetchError;

            // Fetch transaction counts per category
            const { data: counts, error: countError } = await supabase
                .from('transactions')
                .select('category_id')
                .eq('user_id', user.id);

            if (countError) throw countError;

            // Calculate counts
            const countMap: Record<string, number> = {};
            (counts as { category_id: string }[] | null)?.forEach((t) => {
                countMap[t.category_id] = (countMap[t.category_id] || 0) + 1;
            });

            // Merge counts with categories
            const categoriesWithCounts = (categoriesData as DbCategory[] | null)?.map((cat) => ({
                ...cat,
                transaction_count: countMap[cat.id] || 0,
            })) || [];

            setCategories(categoriesWithCounts);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, supabase]);

    // Create category
    const createCategory = async (data: Omit<DbCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DbCategory | null> => {
        if (!user?.id || !supabase) return null;

        try {
            const { data: newCategory, error: insertError } = await supabase
                .from('categories')
                .insert({ ...data, user_id: user.id })
                .select()
                .single();

            if (insertError) throw insertError;

            setCategories((prev) => [...prev, { ...(newCategory as DbCategory), transaction_count: 0 }]);
            return newCategory as DbCategory;
        } catch (err) {
            console.error('Failed to create category:', err);
            throw err;
        }
    };

    // Update category
    const updateCategory = async (id: string, data: Partial<DbCategory>): Promise<DbCategory | null> => {
        if (!supabase) return null;

        try {
            const { data: updated, error: updateError } = await supabase
                .from('categories')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            setCategories((prev) =>
                prev.map((c) => (c.id === id ? { ...c, ...(updated as DbCategory) } : c))
            );
            return updated as DbCategory;
        } catch (err) {
            console.error('Failed to update category:', err);
            throw err;
        }
    };

    // Delete category (with transaction check)
    const deleteCategory = async (id: string, force = false): Promise<boolean> => {
        if (!supabase) return false;

        try {
            // Check for linked transactions
            const { count } = await supabase
                .from('transactions')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', id);

            if (count && count > 0 && !force) {
                throw new Error(`This category has ${count} linked transactions. Delete them first or use force delete.`);
            }

            const { error: deleteError } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setCategories((prev) => prev.filter((c) => c.id !== id));
            return true;
        } catch (err) {
            console.error('Failed to delete category:', err);
            throw err;
        }
    };

    // Real-time subscription
    useEffect(() => {
        if (!user?.id || !supabase) return;

        fetchCategories();

        const channel: RealtimeChannel = supabase
            .channel('categories-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'categories',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchCategories();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id, supabase, fetchCategories]);

    return {
        categories,
        isLoading,
        error,
        refresh: fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    };
}

// ============================================
// BUDGETS HOOK
// ============================================
export function useBudgets() {
    const { user } = useUser();
    const [budgets, setBudgets] = useState<BudgetWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = getSupabase();

    // Fetch budgets with spent calculations
    const fetchBudgets = useCallback(async () => {
        if (!user?.id || !supabase) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch budgets with categories
            const { data: budgetsData, error: fetchError } = await supabase
                .from('budgets')
                .select(`
                    *,
                    category:categories(*)
                `)
                .eq('user_id', user.id)
                .order('start_date', { ascending: false });

            if (fetchError) throw fetchError;

            // Calculate spent for each budget from transactions
            const budgetsWithSpent = await Promise.all(
                ((budgetsData as BudgetWithRelations[]) || []).map(async (budget) => {
                    const { data: transactionData } = await supabase
                        .from('transactions')
                        .select('amount')
                        .eq('user_id', user.id)
                        .eq('category_id', budget.category_id)
                        .eq('type', 'expense')
                        .gte('date', budget.start_date)
                        .lte('date', budget.end_date);

                    const spent = (transactionData as { amount: number }[] | null)?.reduce((acc, t) => acc + t.amount, 0) || 0;

                    return { ...budget, spent };
                })
            );

            setBudgets(budgetsWithSpent);
        } catch (err) {
            console.error('Failed to fetch budgets:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, supabase]);

    // Create budget
    const createBudget = async (data: Omit<DbBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DbBudget | null> => {
        if (!user?.id || !supabase) return null;

        try {
            const { data: newBudget, error: insertError } = await supabase
                .from('budgets')
                .insert({ ...data, user_id: user.id })
                .select(`
                    *,
                    category:categories(*)
                `)
                .single();

            if (insertError) throw insertError;

            setBudgets((prev) => [{ ...(newBudget as BudgetWithRelations), spent: 0 }, ...prev]);
            return newBudget as DbBudget;
        } catch (err) {
            console.error('Failed to create budget:', err);
            throw err;
        }
    };

    // Update budget
    const updateBudget = async (id: string, data: Partial<DbBudget>): Promise<DbBudget | null> => {
        if (!supabase) return null;

        try {
            const { data: updated, error: updateError } = await supabase
                .from('budgets')
                .update(data)
                .eq('id', id)
                .select(`
                    *,
                    category:categories(*)
                `)
                .single();

            if (updateError) throw updateError;

            // Keep existing spent value
            setBudgets((prev) =>
                prev.map((b) => (b.id === id ? { ...(updated as BudgetWithRelations), spent: b.spent } : b))
            );
            return updated as DbBudget;
        } catch (err) {
            console.error('Failed to update budget:', err);
            throw err;
        }
    };

    // Delete budget
    const deleteBudget = async (id: string): Promise<boolean> => {
        if (!supabase) return false;

        try {
            const { error: deleteError } = await supabase
                .from('budgets')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setBudgets((prev) => prev.filter((b) => b.id !== id));
            return true;
        } catch (err) {
            console.error('Failed to delete budget:', err);
            throw err;
        }
    };

    // Real-time subscription (also refresh on transaction changes for spent updates)
    useEffect(() => {
        if (!user?.id || !supabase) return;

        fetchBudgets();

        const budgetsChannel: RealtimeChannel = supabase
            .channel('budgets-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'budgets',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchBudgets();
                }
            )
            .subscribe();

        // Also listen to transactions for spent updates
        const transactionsChannel: RealtimeChannel = supabase
            .channel('budgets-transactions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchBudgets();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(budgetsChannel);
            supabase.removeChannel(transactionsChannel);
        };
    }, [user?.id, supabase, fetchBudgets]);

    return {
        budgets,
        isLoading,
        error,
        refresh: fetchBudgets,
        createBudget,
        updateBudget,
        deleteBudget,
    };
}

// ============================================
// USER SETTINGS HOOK
// ============================================
export function useSupabaseSettings() {
    const { user } = useUser();
    const [settings, setSettings] = useState<DbUserSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = getSupabase();

    // Fetch user settings
    const fetchSettings = useCallback(async () => {
        if (!user?.id || !supabase) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            setSettings(data as DbUserSettings | null);
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch settings');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, supabase]);

    // Create or update settings (upsert)
    const saveSettings = async (data: Partial<Omit<DbUserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<DbUserSettings | null> => {
        if (!user?.id || !supabase) return null;

        try {
            const { data: saved, error: upsertError } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    ...data,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id',
                })
                .select()
                .single();

            if (upsertError) throw upsertError;

            setSettings(saved as DbUserSettings);
            return saved as DbUserSettings;
        } catch (err) {
            console.error('Failed to save settings:', err);
            throw err;
        }
    };

    // Initial fetch
    useEffect(() => {
        if (user?.id) {
            fetchSettings();
        }
    }, [user?.id, fetchSettings]);

    return {
        settings,
        isLoading,
        error,
        refresh: fetchSettings,
        saveSettings,
    };
}
