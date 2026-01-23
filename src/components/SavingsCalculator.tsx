"use client";

import { useMemo } from "react";
import { platforms, currencyPairs, formatCurrency, CurrencyPair, getAdjustedPlatformRate } from "@/lib/currency-data";
import { TrendingUp } from "lucide-react";
import CurrencySelector from "./CurrencySelector";

interface SavingsCalculatorProps {
    amount: number;
    setAmount: (val: number) => void;
    selectedPairId: string;
    setSelectedPairId: (val: string) => void;
    currentRate?: number;
}

export default function SavingsCalculator({ amount, setAmount, selectedPairId, setSelectedPairId, currentRate }: SavingsCalculatorProps) {
    const selectedPair = currencyPairs.find(p => p.id === selectedPairId) || currencyPairs[0];

    // Calculate results for all platforms
    const results = useMemo(() => {
        const platRate = currentRate ?? selectedPair.rate;
        const platformResults = platforms
            .filter(p => p.rates[selectedPair.id] !== undefined)
            .map(p => {
                const adjustedRate = getAdjustedPlatformRate(p, selectedPair.id, platRate);
                const fee = p.feeType === 'percentage' ? amount * (p.transferFee / 100) : p.transferFee;
                let amountToConvert = amount;
                if (p.feeType === 'percentage') {
                    amountToConvert = amount - (amount * (p.transferFee / 100));
                } else {
                    amountToConvert = amount - p.transferFee;
                }
                const received = amountToConvert * adjustedRate;
                return { ...p, fee, received, liveRate: adjustedRate };
            })
            .sort((a, b) => b.received - a.received);

        return platformResults;
    }, [amount, selectedPair, platforms, currentRate]);

    const bestOption = results[0];
    const comparisonOption = results.find(r => r.type === 'bank') || results[results.length - 1];
    const savings = bestOption && comparisonOption ? bestOption.received - comparisonOption.received : 0;
    const yearlySavings = savings * 12;

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* Inputs Section */}
                <div className="w-full lg:w-1/3 space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-2 text-white">Savings Calculator</h3>
                        <p className="text-gray-400 text-sm">See how much you save vs banks</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-black/20 rounded-2xl border border-white/5">
                        <div className="space-y-2">
                            <label className="text-sm text-gray-400 block ml-1 font-medium">Currency Pair</label>
                            <CurrencySelector
                                selectedPair={selectedPair}
                                onSelect={(pair: CurrencyPair) => setSelectedPairId(pair.id)}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-1 block">Transfer Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="10000"
                                step="100"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full mt-4 accent-purple-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>$100</span>
                                <span>$10,000</span>
                            </div>
                        </div>
                    </div>

                    {/* Annual Savings Card */}
                    <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp className="w-24 h-24 text-purple-400" />
                        </div>
                        <div className="flex items-start gap-3 relative z-10">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-purple-200">Potential Annual Savings</p>
                                <p className="text-2xl font-bold text-white mt-1">
                                    {formatCurrency(yearlySavings)} <span className="text-sm font-normal text-purple-200">{selectedPair.to}</span>
                                </p>
                                <p className="text-xs text-purple-300/70 mt-1">
                                    Based on 12 transfers of ${amount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison List */}
                <div className="w-full lg:w-2/3 space-y-3">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-sm text-gray-400 font-medium tracking-wide text-xs uppercase">Provider</span>
                        <span className="text-sm text-gray-400 font-medium tracking-wide text-xs uppercase">Recipient Gets</span>
                    </div>

                    {results.slice(0, 5).map((result, index) => {
                        const isBest = index === 0;
                        const diff = bestOption.received - result.received;

                        return (
                            <div
                                key={result.id}
                                className={`relative p-4 rounded-2xl flex items-center justify-between transition-all duration-300 group ${isBest
                                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'
                                    : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shadow-inner group-hover:scale-110 transition-transform overflow-hidden">
                                        {result.logo.startsWith('http') ? (
                                            <img src={result.logo} alt={result.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-2xl">{result.logo}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-white">{result.name}</h4>
                                            {isBest && (
                                                <div className="px-2 py-0.5 bg-green-500 text-black text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                    Best Option
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-500">Fee:</span>
                                                <span className="text-gray-300">{result.feeType === 'percentage' ? `${result.transferFee}%` : `$${result.transferFee}`}</span>
                                            </div>
                                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-500">Rate:</span>
                                                <span className="text-gray-300">{(result as any).liveRate.toFixed(4)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 mb-1">
                                        <span className={`text-xl font-bold ${isBest ? 'text-[#28ff00]' : 'text-white'}`}>
                                            {formatCurrency(result.received)}
                                        </span>
                                        <img src={`https://flagcdn.com/w40/${selectedPair.toCountry}.png`} alt={selectedPair.to} className="w-5 h-5 rounded-full object-cover border border-white/10" />
                                    </div>
                                    {diff > 0 && (
                                        <div className="text-xs text-red-400 mt-1 font-medium bg-red-500/10 px-2 py-0.5 rounded-lg inline-block">
                                            -{formatCurrency(diff)} less
                                        </div>
                                    )}
                                    {isBest && (
                                        <div className="text-xs text-green-400 mt-1 font-medium">
                                            Max savings
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <button className="w-full py-3 text-center text-sm text-gray-400 hover:text-white transition-colors border-t border-white/5 mt-2">
                        View all {results.length} providers
                    </button>
                </div>
            </div>
        </div>
    );
}
