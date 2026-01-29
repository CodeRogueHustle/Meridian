"use client";

import { useState } from "react";
import { Eye, EyeOff, Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/currency-data";

export default function BalanceSection() {
    const [showBalance, setShowBalance] = useState(true);

    const accounts = [
        { currency: 'USD', amount: 5430.50, flag: '🇺🇸', countryCode: 'us', name: 'US Dollar', symbol: '$' },
        { currency: 'EUR', amount: 2100.00, flag: '🇪🇺', countryCode: 'eu', name: 'Euro', symbol: '€' },
        { currency: 'INR', amount: 45000.00, flag: '🇮🇳', countryCode: 'in', name: 'Indian Rupee', symbol: '₹' },
    ];

    // Mock total estimated value in USD
    const totalValueUSD = 8245.80;

    return (
        <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' }}>
            {/* Total Balance Card */}
            <div className="lg:col-span-2 relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-900/50 via-gray-900 to-black border border-white/10 backdrop-blur-md group">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors duration-500"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-500"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-gray-400 font-medium flex items-center gap-2">
                                <Wallet className="w-5 h-5" /> Total Balance
                            </h3>
                            <button
                                onClick={() => setShowBalance(!showBalance)}
                                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                            >
                                {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex items-baseline gap-2 mb-6">
                            <h2 className="text-5xl font-bold text-white tracking-tight">
                                {showBalance ? '$' + formatCurrency(totalValueUSD) : '••••••••'}
                            </h2>
                            <span className="text-green-400 font-medium flex items-center bg-green-400/10 px-2 py-1 rounded-lg text-sm">
                                +2.4% <span className="text-gray-500 ml-1">this month</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button className="flex-1 min-w-[120px] bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors">
                            <Plus className="w-5 h-5" /> Add Money
                        </button>
                        <button className="flex-1 min-w-[120px] bg-white/10 text-white hover:bg-white/20 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors">
                            <ArrowUpRight className="w-5 h-5" /> Send
                        </button>
                        <button className="flex-1 min-w-[120px] bg-white/10 text-white hover:bg-white/20 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors">
                            <ArrowDownLeft className="w-5 h-5" /> Request
                        </button>
                    </div>
                </div>
            </div>

            {/* Account List */}
            <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-lg">My Accounts</h3>
                    <button className="text-sm text-purple-400 hover:text-purple-300">View All</button>
                </div>

                <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[240px] lg:max-h-none">
                    {accounts.map((acc) => (
                        <div key={acc.currency} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shadow-inner overflow-hidden border border-white/10 p-1.5">
                                    <img src={`https://flagcdn.com/w40/${acc.countryCode}.png`} alt={acc.currency} className="w-full h-full object-cover rounded-full" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{acc.currency}</p>
                                    <p className="text-xs text-gray-400">{acc.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-white">
                                    {showBalance ? `${acc.symbol}${formatCurrency(acc.amount)}` : '••••'}
                                </p>
                                <p className="text-xs text-gray-500 group-hover:text-purple-400 transition-colors">Active</p>
                            </div>
                        </div>
                    ))}

                    <button className="w-full py-3 mt-2 border-dashed border-2 border-white/10 rounded-2xl text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                        <Plus className="w-4 h-4" /> Open New Currency Account
                    </button>
                </div>
            </div>
        </div>
    );
}
