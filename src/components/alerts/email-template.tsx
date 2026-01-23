'use client';

import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { Alert } from '@/lib/types/alert';

interface EmailTemplateProps {
    alert: Alert;
    triggeredRate: number;
    savings?: number;
}

export default function EmailTemplate({ alert, triggeredRate, savings = 2500 }: EmailTemplateProps) {
    const rateDiff = triggeredRate - alert.targetRate;

    return (
        <div className="max-w-lg mx-auto bg-gray-900 rounded-2xl overflow-hidden border border-white/10">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
                <h1 className="text-2xl font-syne font-bold text-white tracking-tight">MERIDIAN</h1>
                <p className="text-purple-200 text-sm mt-1">AI-Powered FX Intelligence</p>
            </div>

            {/* Success Icon */}
            <div className="flex justify-center -mt-8">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center border-4 border-gray-900 shadow-lg">
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Your Alert Triggered! 🎯</h2>
                <p className="text-gray-400 mb-6">
                    The rate you were waiting for has been reached.
                </p>

                {/* Details Card */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="flex items-center -space-x-2">
                            <img
                                src={`https://flagcdn.com/w40/${alert.fromCurrency === 'USD' ? 'us' : alert.fromCurrency === 'EUR' ? 'eu' : 'in'}.png`}
                                alt={alert.fromCurrency}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-800"
                            />
                            <img
                                src={`https://flagcdn.com/w40/${alert.toCurrency === 'USD' ? 'us' : alert.toCurrency === 'EUR' ? 'eu' : 'in'}.png`}
                                alt={alert.toCurrency}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-800"
                            />
                        </div>
                        <span className="text-xl font-bold text-white">
                            {alert.fromCurrency} → {alert.toCurrency}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Your Target</p>
                            <p className="text-lg font-bold text-white flex items-center gap-2">
                                {alert.targetRate.toFixed(4)}
                                <Check className="w-4 h-4 text-green-400" />
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Current Rate</p>
                            <p className="text-lg font-bold text-green-400">
                                {triggeredRate.toFixed(4)}
                                <span className="text-sm text-green-400 ml-1">
                                    (+{rateDiff.toFixed(4)})
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recommendation */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-left">
                    <p className="text-green-400 font-semibold mb-1">💡 Recommendation</p>
                    <p className="text-gray-300 text-sm">
                        Based on our analysis, this is a good time to transfer.
                        Estimated savings: <span className="text-green-400 font-bold">₹{savings.toLocaleString()}</span> on a $3,000 transfer.
                    </p>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                    <a
                        href="#"
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                    >
                        Transfer with Wise
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                        href="#"
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                    >
                        View in Dashboard
                    </a>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 p-4 text-center">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-2">
                    <a href="#" className="hover:text-gray-300 transition-colors">Manage Alerts</a>
                    <span>•</span>
                    <a href="#" className="hover:text-gray-300 transition-colors">Unsubscribe</a>
                </div>
                <p className="text-xs text-gray-600">
                    Meridian - AI-Powered FX Intelligence
                </p>
            </div>
        </div>
    );
}

// Email subject generator
export function generateEmailSubject(alert: Alert): string {
    return `🎯 Meridian Alert: ${alert.fromCurrency}→${alert.toCurrency} hit your target!`;
}
