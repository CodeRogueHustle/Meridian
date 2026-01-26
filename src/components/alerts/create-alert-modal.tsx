'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, TrendingUp, TrendingDown, Mail, Lock, Sparkles } from 'lucide-react';
import { AlertFormData, AlertCondition } from '@/lib/types/alert';
import { currencyPairs } from '@/lib/currency-data';
import { WaitlistCard } from '@/components/ui/waitlist-card';
import { useMutation, useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";

interface CreateAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAlertCreated?: (alert: any) => void;
    defaultFromCurrency?: string;
    defaultToCurrency?: string;
    currentRate?: number;
}

export default function CreateAlertModal({
    isOpen,
    onClose,
    onAlertCreated,
    defaultFromCurrency = 'USD',
    defaultToCurrency = 'INR',
    currentRate,
}: CreateAlertModalProps) {
    const createAlertMutation = useMutation(api.alerts.createAlert);

    const [formData, setFormData] = useState<AlertFormData>({
        fromCurrency: defaultFromCurrency,
        toCurrency: defaultToCurrency,
        targetRate: currentRate || 83.50,
        condition: 'above',
        notificationMethods: ['email'],
        email: '',
        note: '',
    });
    const [showProModal, setShowProModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Fetch live rate for the currently selected pair in the form
    // @ts-ignore
    const liveRateDoc = useQuery(api.rates.getLatestRate, {
        pair: `${formData.fromCurrency}/${formData.toCurrency}`
    });

    const selectedPair = currencyPairs.find(
        p => p.from === formData.fromCurrency && p.to === formData.toCurrency
    );

    // Use live rate if available, fall back to static, then to 1
    const displayRate = liveRateDoc?.rate ?? selectedPair?.rate ?? 1;

    const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createAlertMutation({
                pair: `${formData.fromCurrency}/${formData.toCurrency}`,
                type: formData.condition,
                targetRate: formData.targetRate,
                currentRate: displayRate, // Use the live display rate
                email: formData.email || '',
                note: formData.note,
                notificationMethods: formData.notificationMethods as any,
            });

            onAlertCreated?.(null as any);
            setIsSuccess(true);
        } catch (err) {
            console.error("Failed to create alert:", err);
            alert("Could not create alert. Please ensure you have entered a valid email address.");
        }
    };

    const handleClose = () => {
        setIsSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_24px_100px_rgba(0,0,0,0.5)] max-h-[85vh] w-full max-w-[480px] overflow-y-auto pointer-events-auto">
                            {/* Header */}
                            {!isSuccess && (
                                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                                            <Bell className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-white font-syne font-bold text-lg">Create Alert</h2>
                                            <p className="text-xs text-gray-400">Get notified when rate hits your target</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {/* Content */}
                            {isSuccess ? (
                                <div className="p-8 flex items-center justify-center">
                                    <WaitlistCard
                                        className="bg-transparent border-none shadow-none"
                                        icon={<motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                        >
                                            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                                <Bell className="w-10 h-10 text-white" />
                                            </div>
                                        </motion.div>}
                                        title="Alert Set Successfully!"
                                        description={`We'll notify you when ${formData.fromCurrency} → ${formData.toCurrency} hits ${formData.targetRate}.`}
                                        footerContent={
                                            <div className="flex flex-col gap-3 w-full">
                                                <button
                                                    onClick={handleClose}
                                                    className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                                                >
                                                    Done
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    Want smarter alerts? <a href="#" className="text-purple-400 hover:underline">Upgrade to Pro</a>
                                                </p>
                                            </div>
                                        }
                                    />
                                </div>
                            ) : (
                                /* Form */
                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    {/* Currency Pair */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Currency Pair</label>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={formData.fromCurrency}
                                                onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value })}
                                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                                            >
                                                {currencies.map(c => (
                                                    <option key={c} value={c} className="bg-gray-900">{c}</option>
                                                ))}
                                            </select>
                                            <span className="text-gray-500">→</span>
                                            <select
                                                value={formData.toCurrency}
                                                onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value })}
                                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                                            >
                                                {currencies.map(c => (
                                                    <option key={c} value={c} className="bg-gray-900">{c}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedPair && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <p className="text-xs text-gray-500">
                                                    Current rate: <span className="text-white font-mono">{displayRate.toFixed(4)}</span>
                                                </p>
                                                {liveRateDoc && (
                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold uppercase">Live</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alert When</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, condition: 'above' })}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${formData.condition === 'above'
                                                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                                Goes Above
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, condition: 'below' })}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${formData.condition === 'below'
                                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <TrendingDown className="w-4 h-4" />
                                                Goes Below
                                            </button>
                                        </div>
                                    </div>

                                    {/* Target Rate */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Target Rate</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={formData.targetRate}
                                            onChange={(e) => setFormData({ ...formData, targetRate: parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-bold focus:outline-none focus:border-purple-500/50"
                                            required
                                        />
                                    </div>

                                    {/* Notification Methods */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notify Via</label>
                                        <div className="space-y-2">
                                            {/* Email */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const methods = formData.notificationMethods.includes('email')
                                                        ? formData.notificationMethods.filter(m => m !== 'email')
                                                        : [...formData.notificationMethods, 'email'];
                                                    setFormData({ ...formData, notificationMethods: methods as any });
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${formData.notificationMethods.includes('email')
                                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <Mail className="w-4 h-4" />
                                                <span className="flex-1 text-left">Email</span>
                                                {formData.notificationMethods.includes('email') && (
                                                    <span className="text-green-400 text-xs">✓</span>
                                                )}
                                            </button>

                                            {/* SMS - Pro Feature */}
                                            <button
                                                type="button"
                                                onClick={() => setShowProModal(true)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
                                            >
                                                <Lock className="w-4 h-4" />
                                                <span className="flex-1 text-left">SMS</span>
                                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] font-bold">PRO</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email Input */}
                                    {formData.notificationMethods.includes('email') && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="your@email.com"
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 placeholder:text-gray-600"
                                                required // Make required to prevent submission failure
                                            />
                                        </div>
                                    )}

                                    {/* Note */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Note (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            placeholder="e.g., Transfer to family"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 placeholder:text-gray-600"
                                        />
                                    </div>

                                    {/* Pro Features Preview */}
                                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                                        <div className="flex items-start gap-3">
                                            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-white font-medium">Pro Features</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    SMS alerts, percentage-based triggers, and scheduled alerts available with Pro.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Bell className="w-5 h-5" />
                                        Create Alert
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>

                    {/* Pro Upgrade Modal */}
                    <AnimatePresence>
                        {showProModal && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed inset-0 flex items-center justify-center z-[90] p-4"
                            >
                                <div className="absolute inset-0 bg-black/50" onClick={() => setShowProModal(false)} />
                                <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        SMS alerts require a Pro subscription. Get unlimited SMS alerts and more advanced features.
                                    </p>
                                    <p className="text-3xl font-bold text-white mb-6">
                                        $12<span className="text-lg text-gray-400">/month</span>
                                    </p>
                                    <button
                                        onClick={() => setShowProModal(false)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold mb-3"
                                    >
                                        Upgrade Now
                                    </button>
                                    <button
                                        onClick={() => setShowProModal(false)}
                                        className="text-gray-400 text-sm hover:text-white transition-colors"
                                    >
                                        Maybe later
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}
