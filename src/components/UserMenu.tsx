"use client";

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function UserMenu() {
    return (
        <div className="flex items-center gap-4">
            <SignedOut>
                <SignInButton>
                    <button className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors">
                        Sign In
                    </button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox: "w-9 h-9 border-2 border-white/10"
                        }
                    }}
                />
            </SignedIn>
        </div>
    );
}
