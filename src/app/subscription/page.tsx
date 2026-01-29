'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Zap, Star, Shield, Rocket } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '0',
        description: 'Perfect for staying informed about market movements.',
        features: [
            'Real-time USD/INR tracking',
            '3 Active email alerts',
            'AI mentor basic insights',
            'Basic transfer tracking'
        ],
        buttonText: 'Current Plan',
        current: true,
        pro: false
    },
    {
        name: 'Pro',
        price: '12',
        description: 'Maximize your earnings with advanced timing tools.',
        features: [
            'Unlimited active alerts',
            'Smarter AI predictions (99.9% uptime)',
            'Unlimited transfer history',
            'Priority email support',
            'Advanced savings analytics'
        ],
        buttonText: 'Upgrade to Pro',
        current: false,
        pro: true,
        popular: true
    },
    {
        name: 'Trader',
        price: '49',
        description: 'For high-volume freelancers and small agencies.',
        features: [
            'API access for automated timing',
            'Direct WhatsApp notifications',
            'Multi-currency support (20+ pairs)',
            'Tax & LRS compliance tools',
            'Dedicated account manager'
        ],
        buttonText: 'Contact Sales',
        current: false,
        pro: false
    }
];

export default function SubscriptionPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <h1 className="text-2xl font-syne font-bold tracking-tight">Subscription</h1>
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
                        Premium Plans
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-syne font-bold mb-6 tracking-tight"
                    >
                        Choose the right plan <br /><span className="text-gray-500">for your financial growth.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto"
                    >
                        Unlock exclusive AI features and advanced timing tools to save more on every conversion.
                    </motion.p>
                </div>

                <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))' }}>
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 3) }}
                            className={`p-8 rounded-3xl border transition-all duration-300 relative group ${plan.popular
                                    ? 'bg-purple-900/10 border-purple-500/30 ring-1 ring-purple-500/20'
                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-purple-500/30">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold mb-2 font-syne">{plan.name}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
                            </div>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-bold font-syne">${plan.price}</span>
                                <span className="text-gray-500 text-sm">/month</span>
                            </div>

                            <button
                                className={`w-full py-4 rounded-2xl font-bold transition-all mb-8 flex items-center justify-center gap-2 ${plan.current
                                        ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                                        : plan.pro
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]'
                                            : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
                                    }`}
                                disabled={plan.current}
                            >
                                {plan.pro && <Zap className="w-4 h-4 fill-current" />}
                                {plan.buttonText}
                            </button>

                            <ul className="space-y-4">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 p-0.5 rounded-full bg-green-500/20 text-green-400">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-24 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                    <Shield className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Secure & Risk-Free</h3>
                    <p className="text-gray-400 text-sm max-w-xl mx-auto">
                        All payments are processed securely via Stripe. Cancel anytime with zero fees.
                        Join 1,200+ freelancers today.
                    </p>
                </div>
            </main>
        </div>
    );
}
