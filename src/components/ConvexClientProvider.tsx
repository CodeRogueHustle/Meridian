"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    // If we haven't set up the env var yet, don't crash the app
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
        return <>{children}</>;
    }

    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
