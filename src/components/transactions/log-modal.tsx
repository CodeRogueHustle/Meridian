'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';
import { Platform, PLATFORMS, Transaction } from '@/lib/types/transaction';
import { addTransaction } from '@/lib/transactions-store';

interface LogTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export default function LogTransferModal({ isOpen, onClose, onSave }: LogTransferModalProps) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        fromCurrency: 'USD',
        toCurrency: 'INR',
        rate: '',
        platform: 'Wise',
        fee: '',
        notes: ''
    });

    const [comparison, setComparison] = useState<{
        prediction: number;
        diff: number;
        impact: number;
        isGood: boolean;
    } | null>(null);

    // Simulate real-time comparison as user types rate
    useEffect(() => {
        if (!formData.rate || !formData.amount) {
            setComparison(null);
            return;
        }

        const currentRate = parseFloat(formData.rate);
        const amount = parseFloat(formData.amount);

        // Mock prediction based on input (usually slightly higher/lower around 83)
        const prediction = 83.40; // Static mock for now
        const diff = currentRate - prediction;
        // Savings vs "Bad Rate" (e.g. Bank Rate ~81.5)
        // Let's compare vs Prediction directly for simplicity of visual feedback
        // Or clearer: Benchmark Rate (e.g. Google Rate)

        const impact = (currentRate - (prediction * 0.98)) * amount; // Mock Savings calc

        setComparison({
            prediction,
            diff,
            impact,
            isGood: impact > 0
        });

    }, [formData.rate, formData.amount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newTx: Transaction = {
            id: Date.now().toString(),
            date: new Date(formData.date),
            amount: parseFloat(formData.amount),
            fromCurrency: formData.fromCurrency,
            toCurrency: formData.toCurrency,
            rate: parseFloat(formData.rate),
            platform: formData.platform as Platform,
            fee: parseFloat(formData.fee) || 0,
            notes: formData.notes,
            meridianPrediction: 83.40,
            savings: comparison?.impact || 0,
            isGoodDecision: (comparison?.impact || 0) > 0
        };

        addTransaction(newTx);
        onSave();
        onClose();

        // Reset
        setFormData({
            date: new Date().toISOString().split('T')[0],
            amount: '',
            fromCurrency: 'USD',
            toCurrency: 'INR',
            rate: '',
            platform: 'Wise',
            fee: '',
            notes: ''
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
                    />
                    <motion.div
                        initial={{ y: 50, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[81] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-xl font-bold font-syne text-white">Log Transfer</h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-4">
                                {/* Date */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 outline-none"
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 outline-none text-lg font-bold"
                                        placeholder="1000"
                                    />
                                </div>

                                {/* Pair */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">From</label>
                                        <select
                                            value={formData.fromCurrency}
                                            onChange={e => setFormData({ ...formData, fromCurrency: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                        >
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">To</label>
                                        <select
                                            value={formData.toCurrency}
                                            onChange={e => setFormData({ ...formData, toCurrency: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"
                                        >
                                            <option value="INR">INR</option>
                                            <option value="PHP">PHP</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Rate */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Rate Received</label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={formData.rate}
                                        onChange={e => setFormData({ ...formData, rate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 outline-none text-lg font-bold"
                                        placeholder="83.5000"
                                    />
                                </div>

                                {/* Comparison Feedback */}
                                {comparison && (
                                    <div className={`p-4 rounded-xl border ${comparison.isGood ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            {comparison.isGood ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                                            <span className={`font-bold ${comparison.isGood ? 'text-green-400' : 'text-red-400'}`}>
                                                {comparison.isGood ? 'Great Rate!' : 'Below Average'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            Meridian benchmark: {comparison.prediction.toFixed(2)}.
                                            You {comparison.isGood ? 'saved' : 'lost'} <span className="text-white font-bold">₹{Math.abs(comparison.impact).toLocaleString()}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Platform */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Platform Used</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {PLATFORMS.map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setFormData({ ...formData, platform: p })}
                                                className={`px-2 py-2 rounded-lg text-sm border transition-colors ${formData.platform === p ? 'bg-white/10 border-white text-white' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-white shadow-lg shadow-green-500/20 mt-4 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Transfer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
