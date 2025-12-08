// Database types for Supabase tables

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
    created_at: string;
    updated_at: string;
}

export interface DbAccount {
    id: string;
    user_id: string;
    name: string;
    type: 'bank' | 'cash' | 'card' | 'wallet' | 'savings' | 'other';
    balance: number;
    currency: string;
    created_at: string;
    updated_at: string;
}

export interface DbCategory {
    id: string;
    user_id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    created_at: string;
    updated_at: string;
}

export interface DbBudget {
    id: string;
    user_id: string;
    category_id: string;
    amount: number;
    currency: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export interface DbUserSettings {
    id: string;
    user_id: string;
    preferred_currency: string;
    timezone: string;
    date_format: string;
    show_converted_amounts: boolean;
    created_at: string;
    updated_at: string;
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

// Insert/Update types (without id and timestamps)
export type TransactionInsert = Omit<DbTransaction, 'id' | 'created_at' | 'updated_at'>;
export type TransactionUpdate = Partial<Omit<DbTransaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type AccountInsert = Omit<DbAccount, 'id' | 'created_at' | 'updated_at'>;
export type AccountUpdate = Partial<Omit<DbAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type CategoryInsert = Omit<DbCategory, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<Omit<DbCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type BudgetInsert = Omit<DbBudget, 'id' | 'created_at' | 'updated_at'>;
export type BudgetUpdate = Partial<Omit<DbBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type UserSettingsInsert = Omit<DbUserSettings, 'id' | 'created_at' | 'updated_at'>;
export type UserSettingsUpdate = Partial<Omit<DbUserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// Database schema type for Supabase client
export interface Database {
    public: {
        Tables: {
            transactions: {
                Row: DbTransaction;
                Insert: TransactionInsert;
                Update: TransactionUpdate;
            };
            accounts: {
                Row: DbAccount;
                Insert: AccountInsert;
                Update: AccountUpdate;
            };
            categories: {
                Row: DbCategory;
                Insert: CategoryInsert;
                Update: CategoryUpdate;
            };
            budgets: {
                Row: DbBudget;
                Insert: BudgetInsert;
                Update: BudgetUpdate;
            };
            user_settings: {
                Row: DbUserSettings;
                Insert: UserSettingsInsert;
                Update: UserSettingsUpdate;
            };
        };
    };
}
