'use client';

import { useEffect } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-syne font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed">
                {error.message || "We encountered an unexpected error while loading the application. Please try refreshing."}
            </p>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all text-sm"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Reload Page
                </button>
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold transition-all hover:shadow-lg hover:shadow-purple-500/20 text-sm"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
