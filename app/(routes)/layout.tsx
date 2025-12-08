"use client"
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ExchangeRateProvider } from "@/lib/contexts/ExchangeRateContext";
import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import { QuickAddFAB } from "@/components/QuickAddFAB";
import { CommandPalette } from "@/components/CommandPalette";
import { PageTransition } from "@/components/ui/PageTransition";

export default function RoutesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="cashcompass-theme">
            <ExchangeRateProvider>
                <div className="min-h-screen bg-background">
                    <SignedOut>
                        <RedirectToSignIn />
                    </SignedOut>

                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main content area - offset for sidebar */}
                    <div className="lg:pl-64 transition-all duration-300">
                        {/* Global Top Bar - Sticky */}
                        <TopBar />

                        {/* Page Content with transitions */}
                        <main className="container mx-auto px-4 py-6 pt-20 lg:pt-6">
                            <PageTransition>
                                {children}
                            </PageTransition>
                        </main>
                    </div>

                    {/* Quick Add Floating Action Button */}
                    <QuickAddFAB />

                    {/* Command Palette (Cmd+K) */}
                    <CommandPalette />

                    {/* Toast Notifications */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'hsl(var(--card))',
                                color: 'hsl(var(--card-foreground))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: 'white',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: 'white',
                                },
                            },
                        }}
                    />
                </div>
            </ExchangeRateProvider>
        </ThemeProvider>
    );
}

