"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { MailCheck, Sparkles } from "lucide-react";
import { WaitlistCard } from "@/components/ui/waitlist-card";
import { Button } from "@/components/ui/button";

export default function ProWaitlistDemo() {
    const [isVisible, setIsVisible] = React.useState(false);
    const [hasJoined, setHasJoined] = React.useState(false);

    const handleJoin = () => {
        setIsVisible(true);
        setHasJoined(true);
    };

    if (!hasJoined) {
        return (
            <div className="w-full p-8 rounded-3xl bg-gradient-to-r from-cyan-900/20 to-teal-900/20 border border-cyan-500/20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/25">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Join Meridian Pro</h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                    Get unlimited SMS alerts, advanced technical indicators, and real-time volatility tracking.
                    Join the waitlist for early access.
                </p>
                <Button
                    onClick={handleJoin}
                    className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 rounded-xl text-lg"
                >
                    Join Waitlist
                </Button>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-center justify-center p-4 min-h-[300px]">
            <AnimatePresence>
                {isVisible && (
                    <WaitlistCard
                        icon={<MailCheck className="h-8 w-8" />}
                        title="You're on the waitlist!"
                        description="Thanks for forcing your way into the future of FX. We've received your request and will prioritize your access to Meridian Pro."
                        footerContent={
                            <p className="text-sm text-gray-400">
                                You are <span className="text-cyan-400 font-bold">#4,821</span> in line.
                                <br />
                                <a
                                    href="#"
                                    className="mt-2 inline-block font-medium text-cyan-400 underline-offset-4 hover:underline"
                                >
                                    Refer a friend to skip the line
                                </a>
                            </p>
                        }
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
