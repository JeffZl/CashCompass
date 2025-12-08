// CSV Export Utilities for CashCompass

/**
 * Convert array of objects to CSV string
 */
export function objectsToCSV<T extends Record<string, unknown>>(
    data: T[],
    columns?: { key: keyof T; label: string }[]
): string {
    if (data.length === 0) return "";

    // Determine columns from first object if not provided
    const cols = columns || Object.keys(data[0]).map(key => ({ key: key as keyof T, label: key }));

    // Header row
    const header = cols.map(col => `"${String(col.label)}"`).join(",");

    // Data rows
    const rows = data.map(item => {
        return cols.map(col => {
            const value = item[col.key];
            if (value === null || value === undefined) return '""';
            if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
            if (value instanceof Date) return `"${value.toISOString()}"`;
            return `"${String(value)}"`;
        }).join(",");
    });

    return [header, ...rows].join("\n");
}

/**
 * Download CSV file
 */
export function downloadCSV(csvString: string, filename: string) {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Export transactions to CSV
 */
export function exportTransactions(
    transactions: Array<{
        id: string;
        description: string;
        amount: number;
        type: string;
        category: string;
        account: string;
        date: string;
        currency?: string;
    }>,
    filename: string = "transactions"
) {
    const columns = [
        { key: "date" as const, label: "Date" },
        { key: "description" as const, label: "Description" },
        { key: "amount" as const, label: "Amount" },
        { key: "type" as const, label: "Type" },
        { key: "category" as const, label: "Category" },
        { key: "account" as const, label: "Account" },
        { key: "currency" as const, label: "Currency" },
    ];

    const csv = objectsToCSV(transactions, columns);
    downloadCSV(csv, filename);
}

/**
 * Export budgets to CSV
 */
export function exportBudgets(
    budgets: Array<{
        category: string;
        amount: number;
        spent: number;
        currency?: string;
        startDate: string;
        endDate: string;
    }>,
    filename: string = "budgets"
) {
    const budgetsWithPercentage = budgets.map(b => ({
        ...b,
        remaining: b.amount - b.spent,
        percentUsed: ((b.spent / b.amount) * 100).toFixed(1) + "%",
    }));

    const columns = [
        { key: "category" as const, label: "Category" },
        { key: "amount" as const, label: "Budget Amount" },
        { key: "spent" as const, label: "Spent" },
        { key: "remaining" as const, label: "Remaining" },
        { key: "percentUsed" as const, label: "% Used" },
        { key: "currency" as const, label: "Currency" },
        { key: "startDate" as const, label: "Start Date" },
        { key: "endDate" as const, label: "End Date" },
    ];

    const csv = objectsToCSV(budgetsWithPercentage, columns);
    downloadCSV(csv, filename);
}

/**
 * Export accounts to CSV
 */
export function exportAccounts(
    accounts: Array<{
        name: string;
        type: string;
        balance: number;
        currency?: string;
    }>,
    filename: string = "accounts"
) {
    const columns = [
        { key: "name" as const, label: "Account Name" },
        { key: "type" as const, label: "Type" },
        { key: "balance" as const, label: "Balance" },
        { key: "currency" as const, label: "Currency" },
    ];

    const csv = objectsToCSV(accounts, columns);
    downloadCSV(csv, filename);
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV<T extends Record<string, string>>(csvString: string): T[] {
    const lines = csvString.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]);

    // Parse data rows
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || "";
        });
        return obj as T;
    });
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}
