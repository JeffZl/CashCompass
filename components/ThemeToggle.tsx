"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-10 w-10 rounded-xl",
                        "hover:bg-foreground/5 active:scale-95",
                        "ios-transition"
                    )}
                >
                    <Sun className="h-[18px] w-[18px] rotate-0 scale-100 ios-transition dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 ios-transition dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={cn(
                    "w-40 rounded-2xl p-2",
                    "glass ios-shadow",
                    "border-border/50"
                )}
            >
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer",
                        "ios-transition",
                        theme === "light" && "bg-foreground/5"
                    )}
                >
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            theme === "light"
                                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                                : "bg-muted"
                        )}
                    >
                        <Sun className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Light</span>
                    {theme === "light" && (
                        <span className="ml-auto text-blue-500 font-semibold">✓</span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer",
                        "ios-transition",
                        theme === "dark" && "bg-foreground/5"
                    )}
                >
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            theme === "dark"
                                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                                : "bg-muted"
                        )}
                    >
                        <Moon className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Dark</span>
                    {theme === "dark" && (
                        <span className="ml-auto text-blue-500 font-semibold">✓</span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer",
                        "ios-transition",
                        theme === "system" && "bg-foreground/5"
                    )}
                >
                    <div
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            theme === "system"
                                ? "bg-gradient-to-br from-gray-500 to-gray-700 text-white"
                                : "bg-muted"
                        )}
                    >
                        <Monitor className="h-4 w-4" />
                    </div>
                    <span className="font-medium">System</span>
                    {theme === "system" && (
                        <span className="ml-auto text-blue-500 font-semibold">✓</span>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
