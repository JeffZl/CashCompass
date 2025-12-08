# Supabase Integration Guide

This guide explains how to integrate Supabase CRUD operations with the CashCompass finance app.

## Setup

### 1. Environment Variables

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'tag',
    color TEXT NOT NULL DEFAULT 'from-blue-400 to-blue-600',
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'card', 'wallet', 'savings', 'other')),
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    date_format TEXT NOT NULL DEFAULT 'MM/dd/yyyy',
    show_converted_amounts BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
```

### 3. Row Level Security (RLS)

Enable RLS for all tables:

```sql
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Accounts policies
CREATE POLICY "Users can view own accounts"
    ON accounts FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own accounts"
    ON accounts FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own accounts"
    ON accounts FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own accounts"
    ON accounts FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Categories policies
CREATE POLICY "Users can view own categories"
    ON categories FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own categories"
    ON categories FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own categories"
    ON categories FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own categories"
    ON categories FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Budgets policies
CREATE POLICY "Users can view own budgets"
    ON budgets FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own budgets"
    ON budgets FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own budgets"
    ON budgets FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete own budgets"
    ON budgets FOR DELETE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- User settings policies
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

### 4. Enable Realtime

Enable realtime for tables:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;
```

## Usage

### Import hooks in your pages:

```typescript
import { useTransactions, useAccounts, useCategories, useBudgets } from '@/lib/supabase';
```

### Transactions Page Example:

```typescript
export default function TransactionsPage() {
    const {
        transactions,
        isLoading,
        error,
        createTransaction,
        updateTransaction, 
        deleteTransaction,
        refresh,
    } = useTransactions();

    // Create
    const handleCreate = async (data) => {
        try {
            await createTransaction({
                account_id: data.accountId,
                category_id: data.categoryId,
                amount: data.amount,
                currency: data.currency,
                type: data.type,
                description: data.description,
                date: data.date,
            });
            toast.success('Transaction created!');
        } catch (err) {
            toast.error('Failed to create transaction');
        }
    };

    // Update
    const handleUpdate = async (id, data) => {
        try {
            await updateTransaction(id, data);
            toast.success('Transaction updated!');
        } catch (err) {
            toast.error('Failed to update transaction');
        }
    };

    // Delete
    const handleDelete = async (id) => {
        try {
            await deleteTransaction(id);
            toast.success('Transaction deleted!');
        } catch (err) {
            toast.error('Failed to delete transaction');
        }
    };

    // The hook automatically subscribes to realtime updates
    // UI will update when data changes

    return (
        <div>
            {isLoading && <Spinner />}
            {error && <ErrorAlert message={error} />}
            {transactions.map(t => (
                <TransactionRow 
                    key={t.id} 
                    transaction={t}
                    onEdit={(data) => handleUpdate(t.id, data)}
                    onDelete={() => handleDelete(t.id)}
                />
            ))}
        </div>
    );
}
```

### Accounts Page Example:

```typescript
const { accounts, createAccount, updateAccount, deleteAccount } = useAccounts();
```

### Categories Page Example:

```typescript
const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
// deleteCategory has a force option to delete even with linked transactions
await deleteCategory(id, true); // force delete
```

### Budgets Page Example:

```typescript
const { budgets, createBudget, updateBudget, deleteBudget } = useBudgets();
// budgets include calculated 'spent' from transactions
```

## Files Created

- `lib/supabase/types.ts` - TypeScript types for database tables
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/hooks.ts` - React hooks for CRUD operations with realtime
- `lib/supabase/index.ts` - Central exports

## Notes

1. All hooks automatically subscribe to realtime updates
2. Delete operations check for dependencies before deleting
3. Budgets calculate 'spent' from linked transactions automatically
4. Use `refresh()` to manually refetch data if needed
