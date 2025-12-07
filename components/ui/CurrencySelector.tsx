"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { currencies, getCurrency, Currency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface CurrencySelectorProps {
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    showFlag?: boolean;
    showName?: boolean;
    showSymbol?: boolean;
    disabled?: boolean;
    compact?: boolean;
}

export function CurrencySelector({
    value,
    onValueChange,
    className,
    placeholder = "Select currency",
    showFlag = true,
    showName = true,
    showSymbol = true,
    disabled = false,
    compact = false,
}: CurrencySelectorProps) {
    const selectedCurrency = getCurrency(value);

    const formatCurrencyDisplay = (currency: Currency, isDropdown: boolean = false) => {
        const parts = [];

        if (showFlag) parts.push(currency.flag);

        if (compact && !isDropdown) {
            parts.push(currency.code);
        } else {
            parts.push(currency.code);
            if (showName && isDropdown) parts.push(`- ${currency.name}`);
            if (showSymbol) parts.push(`(${currency.symbol})`);
        }

        return parts.join(" ");
    };

    return (
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
            <SelectTrigger
                className={cn(
                    "rounded-xl border-border/50",
                    compact ? "w-[100px] h-9" : "h-12",
                    className
                )}
            >
                <SelectValue placeholder={placeholder}>
                    {value && (
                        <span className="flex items-center gap-1.5 text-sm">
                            {showFlag && <span>{selectedCurrency.flag}</span>}
                            <span className="font-medium">{selectedCurrency.code}</span>
                            {showSymbol && !compact && (
                                <span className="text-muted-foreground">({selectedCurrency.symbol})</span>
                            )}
                        </span>
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-[300px]">
                {currencies.map((currency) => (
                    <SelectItem
                        key={currency.code}
                        value={currency.code}
                        className="rounded-lg"
                    >
                        <span className="flex items-center gap-2">
                            {showFlag && <span>{currency.flag}</span>}
                            <span className="font-medium">{currency.code}</span>
                            {showName && (
                                <span className="text-muted-foreground">- {currency.name}</span>
                            )}
                            {showSymbol && (
                                <span className="text-muted-foreground ml-1">({currency.symbol})</span>
                            )}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// Compact version for inline use
export function CurrencySelectorCompact({
    value,
    onValueChange,
    className,
}: Pick<CurrencySelectorProps, "value" | "onValueChange" | "className">) {
    return (
        <CurrencySelector
            value={value}
            onValueChange={onValueChange}
            className={className}
            compact
            showName={false}
            showSymbol={false}
        />
    );
}
