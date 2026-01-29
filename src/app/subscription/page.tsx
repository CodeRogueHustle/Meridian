'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, Star, Shield, Zap, X, Mail, Landmark } from 'lucide-react';
import { WaitlistCard } from '@/components/ui/waitlist-card';
import { AnimatedPriceBackground } from '@/components/ui/AnimatedPriceBackground';

export default function SubscriptionPage() {
    const [waitlistModal, setWaitlistModal] = useState({ open: false, plan: '' });
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleJoinWaitlist = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd call a Convex mutation here
        setIsSuccess(true);
    };

    return (
        <div className="min-h-screen bg-transparent text-white selection:bg-purple-500/30">
            <AnimatedPriceBackground />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <h1 className="text-2xl font-syne font-bold tracking-tight">Transparent Pricing</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-6"
                    >
                        <Star className="w-3 h-3" />
                        Beta Access
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-syne font-bold mb-6 tracking-tight"
                    >
                        Transparent Pricing <br /><span className="text-gray-500">for scaling freelancers.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Get started for free during our beta or secure early-bird pricing for our upcoming premium plans.
                    </motion.p>
                </div>

                <div className="grid gap-8 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>

                    {/* Free */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-4 right-4 bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-green-500/20">
                            Beta Access
                        </div>
                        <h3 className="text-xl font-medium text-gray-300 mb-2 font-syne uppercase tracking-tight">Free Forever</h3>
                        <p className="text-xs text-gray-500 mb-6 uppercase font-bold tracking-widest">(During Beta)</p>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-gray-400">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-400" /> Everything unlocked
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-400" /> 3 currency pairs
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-400" /> Unlimited predictions
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-400" /> Email alerts
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-400" /> Platform comparison
                            </li>
                        </ul>
                        <button disabled className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold cursor-not-allowed">
                            Current Plan
                        </button>
                    </motion.div>

                    {/* Saver */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="p-8 rounded-3xl bg-white/5 border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)] backdrop-blur-sm relative transform lg:-translate-y-4 overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-purple-500/30">
                            Early Bird
                        </div>
                        <h3 className="text-xl font-medium text-purple-400 mb-2 font-syne uppercase tracking-tight">Saver</h3>
                        <p className="text-xs text-purple-500/70 mb-6 uppercase font-bold tracking-widest">Coming FEB 22</p>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-4xl font-bold">$12</span>
                            <span className="text-gray-400">/mo</span>
                        </div>
                        <p className="text-xs text-green-400 font-bold mb-6 uppercase tracking-wider">
                            ✨ $9/mo if you sign up now
                        </p>
                        <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-purple-400" /> All Free features
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-purple-400" /> Priority support
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-purple-400" /> SMS/Push notifications
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-purple-400" /> Multi-device sync
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-purple-400" /> Data export (CSV)
                            </li>
                        </ul>
                        <button
                            onClick={() => setWaitlistModal({ open: true, plan: 'Saver' })}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95"
                        >
                            Join Waitlist
                        </button>
                    </motion.div>

                    {/* Business */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden"
                    >
                        <div className="absolute top-4 right-4 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-blue-500/20">
                            Enterprise
                        </div>
                        <h3 className="text-xl font-medium text-gray-300 mb-2 font-syne uppercase tracking-tight">Business</h3>
                        <p className="text-xs text-gray-500 mb-6 uppercase font-bold tracking-widest">Coming Q2 2026</p>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold">$49</span>
                            <span className="text-gray-400">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> All Saver features
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> API Access
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> Teams (up to 5 users)
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> Custom branding
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> Tax compliance tools
                            </li>
                        </ul>
                        <button
                            onClick={() => setWaitlistModal({ open: true, plan: 'Business' })}
                            className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold"
                        >
                            Get Notified
                        </button>
                    </motion.div>

                </div>

                <div className="mt-24 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                    <Shield className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Secure & Risk-Free</h3>
                    <p className="text-gray-400 text-sm max-w-xl mx-auto">
                        All plans are currently in Beta. Join our growing community of 1,200+ freelancers
                        saving on every transfer with AI intelligence.
                    </p>
                </div>
            </main>

            {/* Waitlist Modal */}
            <AnimatePresence>
                {waitlistModal.open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setWaitlistModal({ open: false, plan: '' }); setIsSuccess(false); }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                        >
                            <div className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative">
                                <button
                                    onClick={() => { setWaitlistModal({ open: false, plan: '' }); setIsSuccess(false); }}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {isSuccess ? (
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Check className="w-8 h-8 text-green-400" />
                                        </div>
                                        <h3 className="text-2xl font-syne font-bold mb-2">You're on the list!</h3>
                                        <p className="text-gray-400 text-sm mb-6">We'll notify you as soon as the {waitlistModal.plan} plan is available.</p>
                                        <button
                                            onClick={() => { setWaitlistModal({ open: false, plan: '' }); setIsSuccess(false); }}
                                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all"
                                        >
                                            Done
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-8">
                                        <h3 className="text-2xl font-syne font-bold mb-2">Join {waitlistModal.plan} Waitlist</h3>
                                        <p className="text-gray-400 text-sm mb-6">Enter your email and be the first to know when we launch.</p>

                                        <form onSubmit={handleJoinWaitlist} className="space-y-4">
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={waitlistEmail}
                                                    onChange={(e) => setWaitlistEmail(e.target.value)}
                                                    placeholder="Enter your email"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold transition-all"
                                            >
                                                Subscribe
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
