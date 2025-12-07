"use client"
import { Sidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider defaultTheme="system" storageKey="cashcompass-theme">
            <div className="min-h-screen bg-background">
                <SignedOut>
                    <RedirectToSignIn />
                </SignedOut>
                <Sidebar />
                {/* Main content area - offset for sidebar */}
                <main className="lg:pl-64 transition-all duration-300">
                    <div className="container mx-auto px-4 py-6 pt-20 lg:pt-6">
                        {children}
                    </div>
                </main>
            </div>
        </ThemeProvider>
    );
}
