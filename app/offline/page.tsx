"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
    useEffect(() => {
        // Check connection status
        const handleOnline = () => {
            window.location.reload();
        };

        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="text-center max-w-md">
                {/* Offline Icon */}
                <div className="h-24 w-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                    <WifiOff className="h-12 w-12 text-white" />
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
                <p className="text-muted-foreground mb-8">
                    It looks like you've lost your internet connection.
                    Some features may not be available until you're back online.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="default"
                        className="rounded-xl gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        className="rounded-xl gap-2"
                    >
                        <Link href="/dashboard">
                            <Home className="h-4 w-4" />
                            Go to Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Status indicator */}
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Waiting for connection...
                </div>
            </div>
        </div>
    );
}
