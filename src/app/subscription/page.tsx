'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, Star, Shield, Zap, X, Mail, Landmark, Bot, Sparkles, BrainCircuit, Network, Activity } from 'lucide-react';
import { WaitlistCard } from '@/components/ui/waitlist-card';
import { AnimatedPriceBackground } from '@/components/ui/AnimatedPriceBackground';
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";

export default function SubscriptionPage() {
    const [waitlistModal, setWaitlistModal] = useState({ open: false, plan: '' });
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const joinWaitlist = useMutation(api.waitlist.joinWaitlist);

    const handleJoinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!waitlistEmail || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await joinWaitlist({
                email: waitlistEmail,
                plan: waitlistModal.plan,
                useCase: 'subscription_page',
            });
            setIsSuccess(true);
        } catch (err) {
            console.error('Failed to join waitlist:', err);
            alert('Failed to join waitlist. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30">
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
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6"
                    >
                        <Bot className="w-3 h-3" />
                        Meridian Intelligence Models
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-syne font-bold mb-6 tracking-tight"
                    >
                        Scale Your Intelligence <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">Not Your Costs.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Deploy predictive FX models to automate your savings. Choose the processing power that matches your transfer volume.
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
                        <div className="absolute top-4 right-4 bg-gray-500/10 text-gray-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-gray-500/20">
                            V1 Model
                        </div>
                        <h3 className="text-xl font-medium text-gray-300 mb-2 font-syne uppercase tracking-tight">Base Intelligence</h3>
                        <p className="text-xs text-gray-500 mb-6 uppercase font-bold tracking-widest">Core processing</p>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-gray-400">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                            <li className="flex items-center gap-3">
                                <BrainCircuit className="w-4 h-4 text-gray-400" /> 24h trend predictions
                            </li>
                            <li className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-gray-400" /> 3 currency pairs monitored
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-gray-400" /> Standard email alerts
                            </li>
                            <li className="flex items-center gap-3">
                                <Network className="w-4 h-4 text-gray-400" /> Basic platform routing
                            </li>
                        </ul>
                        <button disabled className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-bold cursor-not-allowed">
                            Current Node
                        </button>
                    </motion.div>

                    {/* Pro */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="p-8 rounded-3xl bg-gray-900/50 border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] backdrop-blur-md relative transform lg:-translate-y-4 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 opacity-50"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none"></div>
                        
                        <div className="absolute top-4 right-4 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-cyan-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Next-Gen Model
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2 font-syne uppercase tracking-tight flex items-center gap-2">
                            Pro Intelligence
                        </h3>
                        <p className="text-xs text-cyan-400/80 mb-6 uppercase font-bold tracking-widest">Enhanced Neural Processing</p>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">$12</span>
                            <span className="text-gray-400">/mo</span>
                        </div>
                        <p className="text-xs text-green-400 font-bold mb-6 uppercase tracking-wider">
                            ✨ $9/mo early access pricing
                        </p>
                        <ul className="space-y-4 mb-8 text-gray-300 text-sm relative z-10">
                            <li className="flex items-center gap-3">
                                <BrainCircuit className="w-4 h-4 text-cyan-400" /> 7-day deep-learning forecasts
                            </li>
                            <li className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-cyan-400" /> Unlimited currency pairs
                            </li>
                            <li className="flex items-center gap-3">
                                <Zap className="w-4 h-4 text-cyan-400" /> Instant SMS & Push triggers
                            </li>
                            <li className="flex items-center gap-3">
                                <Bot className="w-4 h-4 text-cyan-400" /> Priority AI mentor processing
                            </li>
                            <li className="flex items-center gap-3">
                                <Network className="w-4 h-4 text-cyan-400" /> Smart routing to lowest-fee platform
                            </li>
                        </ul>
                        <button
                            onClick={() => setWaitlistModal({ open: true, plan: 'Pro' })}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 font-bold hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all active:scale-95 text-white relative z-10"
                        >
                            Request Access
                        </button>
                    </motion.div>

                    {/* Business */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-4 right-4 bg-teal-500/10 text-teal-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-teal-500/20">
                            Dedicated Node
                        </div>
                        <h3 className="text-xl font-medium text-gray-300 mb-2 font-syne uppercase tracking-tight">Enterprise</h3>
                        <p className="text-xs text-gray-500 mb-6 uppercase font-bold tracking-widest">Coming Q2 2026</p>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold">$49</span>
                            <span className="text-gray-400">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                            <li className="flex items-center gap-3">
                                <BrainCircuit className="w-4 h-4 text-teal-400" /> All Pro Intelligence features
                            </li>
                            <li className="flex items-center gap-3">
                                <Network className="w-4 h-4 text-teal-400" /> Direct REST API pipeline
                            </li>
                            <li className="flex items-center gap-3">
                                <Activity className="w-4 h-4 text-teal-400" /> Multi-agent team access
                            </li>
                            <li className="flex items-center gap-3">
                                <Bot className="w-4 h-4 text-teal-400" /> Custom AI training on your data
                            </li>
                            <li className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-teal-400" /> Enterprise compliance & security
                            </li>
                        </ul>
                        <button
                            onClick={() => setWaitlistModal({ open: true, plan: 'Enterprise' })}
                            className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold group-hover:bg-teal-500/20 group-hover:text-teal-300"
                        >
                            Reserve Instance
                        </button>
                    </motion.div>

                </div>

                <div className="mt-24 p-8 rounded-3xl bg-gradient-to-b from-cyan-900/20 to-[#050a0e] border border-cyan-500/20 backdrop-blur-sm text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                    <Bot className="w-10 h-10 text-cyan-400 mx-auto mb-4 relative z-10" />
                    <h3 className="text-xl font-bold mb-2 relative z-10 text-white">State-of-the-art Prediction Engine</h3>
                    <p className="text-gray-400 text-sm max-w-xl mx-auto relative z-10">
                        Our neural networks process millions of data points across global FX markets daily. 
                        Join 1,200+ users leveraging algorithmic intelligence to outsmart exchange rates.
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
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold transition-all"
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
