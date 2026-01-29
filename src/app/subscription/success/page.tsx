'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight, PartyPopper } from 'lucide-react';
import { AnimatedPriceBackground } from '@/components/ui/AnimatedPriceBackground';

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4">
            <AnimatedPriceBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-md w-full p-8 rounded-3xl bg-gray-900/50 border border-white/10 backdrop-blur-2xl text-center"
            >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <PartyPopper className="w-10 h-10 text-green-400" />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"
                    />
                </div>

                <h1 className="text-3xl font-syne font-bold mb-4">Welcome to Pro!</h1>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Your subscription has been confirmed. You now have unlimited alerts, advanced AI insights, and exclusive timing tools at your fingertips.
                </p>

                <div className="space-y-4 mb-8">
                    {[
                        'Unlimited Active Alerts',
                        'Priority Prediction Data',
                        'Multi-Device Sync Enabled'
                    ].map((feature, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            key={feature}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-sm text-left"
                        >
                            <div className="p-1 rounded-full bg-green-500/20 text-green-400">
                                <Check className="w-3 h-3" />
                            </div>
                            {feature}
                        </motion.div>
                    ))}
                </div>

                <Link
                    href="/dashboard"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 group"
                >
                    Back to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
        </div>
    );
}
