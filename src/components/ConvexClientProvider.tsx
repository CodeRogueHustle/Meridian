"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

    // Use useMemo to ensure stable client across re-renders
    const convex = useMemo(() => {
        if (!convexUrl) return null;
        try {
            return new ConvexReactClient(convexUrl);
        } catch (e) {
            console.error("Failed to initialize Convex client:", e);
            return null;
        }
    }, [convexUrl]);

    // If configuration is missing, show a clean error rather than crashing
    if (!convexUrl || !publishableKey || !convex) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <div className="max-w-md w-full p-8 rounded-3xl bg-white/5 border border-red-500/20 text-center">
                    <h2 className="text-xl font-bold text-white mb-4">Configuration Required</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        The application is missing critical environment variables (Convex or Clerk).
                        Please check your production settings.
                    </p>
                    <code className="text-[10px] text-red-400 block bg-black p-3 rounded-lg text-left overflow-x-auto">
                        NEXT_PUBLIC_CONVEX_URL: {convexUrl ? 'SET' : 'MISSING'}<br />
                        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {publishableKey ? 'SET' : 'MISSING'}
                    </code>
                </div>
            </div>
        );
    }

    return (
        <ClerkProvider
            publishableKey={publishableKey}
            signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
            signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
            afterSignInUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
            afterSignUpUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
