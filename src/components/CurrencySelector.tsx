"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { currencyPairs, CurrencyPair } from "@/lib/currency-data";

interface CurrencySelectorProps {
    selectedPair: CurrencyPair;
    onSelect: (pair: CurrencyPair) => void;
}

export default function CurrencySelector({ selectedPair, onSelect }: CurrencySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as any)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1">
                        <img src={`https://flagcdn.com/w40/${selectedPair.fromCountry}.png`} alt={selectedPair.from} className="w-6 h-6 rounded-full object-cover border-2 border-gray-900 z-10" />
                        <img src={`https://flagcdn.com/w40/${selectedPair.toCountry}.png`} alt={selectedPair.to} className="w-6 h-6 rounded-full object-cover border-2 border-gray-900" />
                    </div>
                    <span className="text-white font-medium ml-1">{selectedPair.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-white font-medium">{selectedPair.to}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-gray-900/95 border border-white/10 backdrop-blur-md shadow-xl overflow-hidden z-50">
                    <div className="p-2 border-b border-white/10">
                        <p className="text-xs text-gray-400 px-2">Select Currency Pair</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {currencyPairs.map((pair) => (
                            <button
                                key={pair.id}
                                onClick={() => {
                                    onSelect(pair);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors ${selectedPair.id === pair.id ? 'bg-purple-500/10' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center -space-x-1">
                                        <img src={`https://flagcdn.com/w40/${pair.fromCountry}.png`} alt={pair.from} className="w-5 h-5 rounded-full object-cover border border-gray-800 z-10" />
                                        <img src={`https://flagcdn.com/w40/${pair.toCountry}.png`} alt={pair.to} className="w-5 h-5 rounded-full object-cover border border-gray-800" />
                                    </div>
                                    <div className="text-left ml-1">
                                        <p className="text-white font-medium">{pair.from} → {pair.to}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-medium">{pair.rate.toFixed(pair.rate < 10 ? 4 : 2)}</p>
                                    <p className={`text-xs ${pair.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {pair.change24h >= 0 ? '▲' : '▼'} {Math.abs(pair.change24h)}%
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
