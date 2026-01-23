"use client";

import { useState, useEffect } from "react";
import { X, ArrowLeftRight, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import { currencyPairs, platforms, getBestPlatformForPair, formatCurrency, getAdjustedPlatformRate } from "@/lib/currency-data";

interface ConverterWidgetProps {
    defaultFromCurrency?: string;
    defaultToCurrency?: string;
}

export default function ConverterWidget({ defaultFromCurrency = "USD", defaultToCurrency = "INR" }: ConverterWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [fromCurrency, setFromCurrency] = useState(defaultFromCurrency);
    const [toCurrency, setToCurrency] = useState(defaultToCurrency);
    const [amount, setAmount] = useState("1000");
    const [result, setResult] = useState(0);
    const [bestPlatform, setBestPlatform] = useState<string | null>(null);

    const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "CNY"];

    // Convex integration
    // @ts-ignore
    const liveRateDoc = useQuery(api.rates.getLatestRate, {
        pair: `${fromCurrency}/${toCurrency}`
    });

    useEffect(() => {
        const pairId = `${fromCurrency.toLowerCase()}-${toCurrency.toLowerCase()}`;
        const pair = currencyPairs.find(p => p.id === pairId);

        const currentRate = liveRateDoc?.rate ?? pair?.rate;

        if (currentRate) {
            const numAmount = parseFloat(amount) || 0;
            const best = getBestPlatformForPair(pairId, currentRate);
            if (best) {
                const adjustedRate = getAdjustedPlatformRate(best, pairId, currentRate);
                setResult(numAmount * adjustedRate);
                setBestPlatform(best.name);
            } else {
                setResult(numAmount * currentRate);
                setBestPlatform(null);
            }
        } else {
            // Try reverse pair
            const reversePairId = `${toCurrency.toLowerCase()}-${fromCurrency.toLowerCase()}`;
            const reversePair = currencyPairs.find(p => p.id === reversePairId);
            if (reversePair) {
                const numAmount = parseFloat(amount) || 0;
                setResult(numAmount / reversePair.rate);
                setBestPlatform(null);
            } else {
                setResult(0);
                setBestPlatform(null);
            }
        }
    }, [fromCurrency, toCurrency, amount, liveRateDoc]);

    const handleSwap = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105"
            >
                <ArrowLeftRight className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 w-80 rounded-2xl bg-gray-900/95 border border-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-purple-400" />
                    Quick Convert
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* From */}
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">From</label>
                    <div className="flex gap-2">
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                        >
                            {currencies.map(c => (
                                <option key={c} value={c} className="bg-gray-900">{c}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-24 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-right focus:outline-none focus:border-purple-500/50"
                            placeholder="Amount"
                        />
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleSwap}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeftRight className="w-4 h-4 text-gray-400" />
                    </button>
                </div>

                {/* To */}
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">To</label>
                    <div className="flex gap-2">
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
                        >
                            {currencies.map(c => (
                                <option key={c} value={c} className="bg-gray-900">{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Result */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                    <p className="text-xs text-gray-400 mb-1">You&apos;ll receive approximately</p>
                    <p className="text-3xl font-bold text-white">
                        {formatCurrency(result, result < 100 ? 4 : 2)} <span className="text-xl text-gray-400">{toCurrency}</span>
                    </p>
                    {bestPlatform && (
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            <Sparkles className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Best rate via {bestPlatform}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
