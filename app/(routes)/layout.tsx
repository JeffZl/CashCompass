"use client"
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ExchangeRateProvider } from "@/lib/contexts/ExchangeRateContext";
import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";

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

                        {/* Page Content */}
                        <main className="container mx-auto px-4 py-6 pt-20 lg:pt-6">
                            {children}
                        </main>
                    </div>
                </div>
            </ExchangeRateProvider>
        </ThemeProvider>
    );
}
