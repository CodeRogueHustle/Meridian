"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AetherBackground from "@/components/AetherBackground";
import { Brain, MessageSquareText, ArrowRightLeft, Check, Sparkles, ArrowRight, Menu, X } from "lucide-react";
import AetherHero from "@/components/ui/aether-hero";
import { motion, AnimatePresence } from "framer-motion";
import StatsBar from "@/components/landing/stats-bar";
import TrustBadges from "@/components/landing/trust-badges";
import Testimonials from "@/components/landing/testimonials";
import UserMenu from "@/components/UserMenu";
import WaitlistModal from "@/components/modals/WaitlistModal";

export default function Home() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [waitlistModal, setWaitlistModal] = useState<{ open: boolean, plan: string }>({ open: false, plan: 'Saver' });

    return (
        <main className="min-h-screen text-white relative isolate font-sans overflow-x-hidden">
            <AetherBackground />

            {/* Waitlist Modal */}
            <WaitlistModal
                isOpen={waitlistModal.open}
                onClose={() => setWaitlistModal({ ...waitlistModal, open: false })}
                initialPlan={waitlistModal.plan}
            />

            {/* Sticky Header */}
            <header className="sticky top-0 z-[60] border-b border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-2">
                        <span className="text-2xl font-extrabold font-syne tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200">
                            MERIDIAN
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-gray-400">
                        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/dashboard" className="hover:text-white transition-colors">Demo</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <UserMenu />

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-20 left-0 right-0 bg-black/90 backdrop-blur-3xl border-b border-white/10 p-6 flex flex-col gap-6 md:hidden items-center text-center isolate shadow-2xl"
                        >
                            <Link onClick={() => setIsMenuOpen(false)} href="#features" className="text-xl font-syne font-bold text-white">Features</Link>
                            <Link onClick={() => setIsMenuOpen(false)} href="#pricing" className="text-xl font-syne font-bold text-white">Pricing</Link>
                            <Link onClick={() => setIsMenuOpen(false)} href="/dashboard" className="text-xl font-syne font-bold text-white text-purple-400">View Demo</Link>
                            <UserMenu />
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Aether Hero Section */}
            <AetherHero
                title="MERIDIAN"
                subtitle="Master global currency markets with AI-powered forecasting and platform comparison. Optimize every transfer with real-time intelligence."
                ctaLabel="Start Your Journey"
                ctaHref="/sign-up"
                secondaryCtaLabel="View Dashboard"
                secondaryCtaHref="/dashboard"
                height="90vh"
                hideCanvas={true}
                overlayGradient="transparent"
            />



            {/* Features Section */}
            <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
                <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
                    {/* Card 1 */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                            <Brain className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3">Smart Predictions</h3>
                        <p className="text-gray-400 leading-relaxed">
                            LSTM ML model predicts FX movements with 70% accuracy using historical data analysis.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-blue-500/30 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                            <MessageSquareText className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3">AI Mentor</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Multi-agent AI explains predictions and teaches forex concepts in real-time chat.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-indigo-500/30 transition-colors group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
                            <ArrowRightLeft className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3">Multi-Platform</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Compare Wise, Skydo, and PayPal exchange rates instantly to find the best deal.
                        </p>
                    </div>
                </div>
            </section>

            <StatsBar />
            <TrustBadges />

            <Testimonials />

            {/* Pricing Section */}
            <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 font-syne tracking-tight">Transparent Pricing</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Get started for free during our beta or secure early-bird pricing for our upcoming premium plans.</p>
                </div>

                <div className="grid gap-8 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>

                    {/* Free */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
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
                        <Link href="/sign-up" className="block w-full text-center py-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold">
                            Start Free
                        </Link>
                    </div>

                    {/* Saver */}
                    <div className="p-8 rounded-3xl bg-white/5 border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)] backdrop-blur-sm relative transform md:-translate-y-4 overflow-hidden">
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
                    </div>

                    {/* Business */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-blue-500/20">
                            Enterprise
                        </div>
                        <h3 className="text-xl font-medium text-gray-300 mb-2 font-syne uppercase tracking-tight">Business</h3>
                        <p className="text-xs text-gray-500 mb-6 uppercase font-bold tracking-widest">Coming FEB 22</p>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold">$49</span>
                            <span className="text-gray-400">/mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-gray-300 text-sm">
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> All Saver features
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> API access
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> Multi-user (5 seats)
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> Custom integrations
                            </li>
                            <li className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-blue-400" /> Service Level Agreement
                            </li>
                        </ul>
                        <button
                            onClick={() => setWaitlistModal({ open: true, plan: 'Business' })}
                            className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold active:scale-95"
                        >
                            Join Waitlist
                        </button>
                    </div>

                </div>
            </section>


        </main >
    );
}
