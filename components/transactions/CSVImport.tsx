"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { parseCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Upload,
    FileSpreadsheet,
    Check,
    X,
    AlertCircle,
    ChevronRight,
    Loader2,
} from "lucide-react";

interface ImportedRow {
    [key: string]: string;
}

interface ColumnMapping {
    date: string;
    description: string;
    amount: string;
    type?: string;
}

interface PreviewTransaction {
    date: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    _original: ImportedRow;
}

interface CSVImportProps {
    onImport: (transactions: PreviewTransaction[]) => Promise<void>;
}

export function CSVImport({ onImport }: CSVImportProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [rawData, setRawData] = useState<ImportedRow[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [mapping, setMapping] = useState<ColumnMapping>({
        date: "",
        description: "",
        amount: "",
        type: "",
    });
    const [error, setError] = useState<string | null>(null);

    const reset = () => {
        setStep("upload");
        setFile(null);
        setRawData([]);
        setColumns([]);
        setMapping({ date: "", description: "", amount: "", type: "" });
        setError(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!selectedFile.name.endsWith(".csv")) {
            setError("Please select a CSV file");
            return;
        }

        setFile(selectedFile);
        setError(null);

        try {
            const text = await selectedFile.text();
            const parsed = parseCSV<ImportedRow>(text);

            if (parsed.length === 0) {
                setError("No data found in CSV file");
                return;
            }

            setRawData(parsed);
            setColumns(Object.keys(parsed[0]));
            setStep("mapping");
        } catch (err) {
            setError("Failed to parse CSV file");
        }
    };

    // Preview transactions based on mapping
    const previewTransactions = useMemo<PreviewTransaction[]>(() => {
        if (!mapping.date || !mapping.description || !mapping.amount) {
            return [];
        }

        return rawData.slice(0, 10).map(row => {
            const amount = parseFloat(row[mapping.amount]?.replace(/[^-0-9.]/g, "") || "0");
            let type: "income" | "expense" = amount >= 0 ? "income" : "expense";

            // If type column is mapped, use it
            if (mapping.type && row[mapping.type]) {
                const typeValue = row[mapping.type].toLowerCase();
                if (typeValue.includes("credit") || typeValue.includes("income") || typeValue.includes("deposit")) {
                    type = "income";
                } else if (typeValue.includes("debit") || typeValue.includes("expense") || typeValue.includes("withdrawal")) {
                    type = "expense";
                }
            }

            return {
                date: row[mapping.date] || "",
                description: row[mapping.description] || "",
                amount: Math.abs(amount),
                type,
                _original: row,
            };
        });
    }, [rawData, mapping]);

    const handleProceedToPreview = () => {
        if (!mapping.date || !mapping.description || !mapping.amount) {
            setError("Please map all required columns");
            return;
        }
        setStep("preview");
    };

    const handleImport = async () => {
        setStep("importing");
        try {
            const allTransactions = rawData.map(row => {
                const amount = parseFloat(row[mapping.amount]?.replace(/[^-0-9.]/g, "") || "0");
                let type: "income" | "expense" = amount >= 0 ? "income" : "expense";

                if (mapping.type && row[mapping.type]) {
                    const typeValue = row[mapping.type].toLowerCase();
                    if (typeValue.includes("credit") || typeValue.includes("income") || typeValue.includes("deposit")) {
                        type = "income";
                    } else if (typeValue.includes("debit") || typeValue.includes("expense") || typeValue.includes("withdrawal")) {
                        type = "expense";
                    }
                }

                return {
                    date: row[mapping.date] || "",
                    description: row[mapping.description] || "",
                    amount: Math.abs(amount),
                    type,
                    _original: row,
                };
            });

            await onImport(allTransactions);
            setIsOpen(false);
            reset();
        } catch (err) {
            setError("Failed to import transactions");
            setStep("preview");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl gap-2">
                    <Upload className="h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        Import Bank Statement
                    </DialogTitle>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {step === "upload" && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="py-8"
                        >
                            <label
                                className={cn(
                                    "flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed cursor-pointer",
                                    "hover:bg-muted/50 ios-transition",
                                    error ? "border-destructive" : "border-border"
                                )}
                            >
                                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium">Drop your CSV file here</p>
                                <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            {error && (
                                <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </p>
                            )}
                        </motion.div>
                    )}

                    {step === "mapping" && (
                        <motion.div
                            key="mapping"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4 py-4"
                        >
                            <p className="text-sm text-muted-foreground">
                                Map your CSV columns to transaction fields
                            </p>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Date Column *</Label>
                                    <Select value={mapping.date} onValueChange={(v) => setMapping({ ...mapping, date: v })}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map(col => (
                                                <SelectItem key={col} value={col}>{col}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description Column *</Label>
                                    <Select value={mapping.description} onValueChange={(v) => setMapping({ ...mapping, description: v })}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map(col => (
                                                <SelectItem key={col} value={col}>{col}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Amount Column *</Label>
                                    <Select value={mapping.amount} onValueChange={(v) => setMapping({ ...mapping, amount: v })}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {columns.map(col => (
                                                <SelectItem key={col} value={col}>{col}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Type Column (Optional)</Label>
                                    <Select value={mapping.type || ""} onValueChange={(v) => setMapping({ ...mapping, type: v || undefined })}>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Auto-detect from amount" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Auto-detect</SelectItem>
                                            {columns.map(col => (
                                                <SelectItem key={col} value={col}>{col}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </p>
                            )}

                            <DialogFooter>
                                <Button variant="ghost" onClick={reset} className="rounded-xl">
                                    Back
                                </Button>
                                <Button onClick={handleProceedToPreview} className="rounded-xl gap-2">
                                    Preview
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}

                    {step === "preview" && (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4 py-4"
                        >
                            <p className="text-sm text-muted-foreground">
                                Preview of first 10 transactions (Total: {rawData.length})
                            </p>

                            <div className="rounded-xl border border-border overflow-hidden max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="text-left p-2">Date</th>
                                            <th className="text-left p-2">Description</th>
                                            <th className="text-right p-2">Amount</th>
                                            <th className="text-center p-2">Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewTransactions.map((tx, i) => (
                                            <tr key={i} className="border-t border-border/50">
                                                <td className="p-2 text-muted-foreground">{tx.date}</td>
                                                <td className="p-2 truncate max-w-[200px]">{tx.description}</td>
                                                <td className={cn(
                                                    "p-2 text-right font-medium",
                                                    tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                                                )}>
                                                    {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-full text-xs",
                                                        tx.type === "income" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                                    )}>
                                                        {tx.type}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setStep("mapping")} className="rounded-xl">
                                    Back
                                </Button>
                                <Button onClick={handleImport} className="rounded-xl gap-2">
                                    <Check className="h-4 w-4" />
                                    Import {rawData.length} Transactions
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}

                    {step === "importing" && (
                        <motion.div
                            key="importing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                            <p className="font-medium">Importing transactions...</p>
                            <p className="text-sm text-muted-foreground">This may take a moment</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
