"use client";

import { Platform, CurrencyPair, formatCurrency, getPlatformRate } from "@/lib/currency-data";
import { Star, Clock, AlertCircle, ArrowUpRight, Check, X, Shield, Zap, DollarSign } from "lucide-react";
import Link from "next/link";

interface PlatformCardProps {
    platform: Platform;
    selectedPair: CurrencyPair;
    amount: number;
}

export default function PlatformCard({ platform, selectedPair, amount }: PlatformCardProps) {
    const rate = (platform as any).liveRate || getPlatformRate(platform.id, selectedPair.id) || 0;
    const fee = platform.feeType === 'percentage'
        ? amount * (platform.transferFee / 100)
        : platform.transferFee;

    // Amount conversion logic (simplified: subtract fee then convert, or convert then fee? 
    // Consistent with calculator: assume simple subtract from source amount for display)
    // Actually, normally: Received = (Amount - Fee) * Rate
    const amountAfterFee = amount - fee;
    const received = amountAfterFee * rate;

    return (
        <div className="group relative bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] isolate">
            {/* Glow background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10" />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center p-2 border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                        <div className="absolute inset-0 bg-white opacity-90" />
                        {platform.logo.startsWith('http') ? (
                            <img src={platform.logo} alt={platform.name} className="relative w-full h-full object-contain" />
                        ) : (
                            <span className="relative text-3xl">{platform.logo}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-syne font-bold text-xl text-white tracking-tight">{platform.name}</h3>
                        <div className="flex items-center gap-1.5 text-yellow-400 text-sm">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-bold tracking-tight">{platform.rating}</span>
                            <span className="text-gray-500 text-xs">({platform.reviews.toLocaleString()} reviews)</span>
                        </div>
                    </div>
                </div>
                {platform.id === 'wise' && (
                    <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-[10px] font-extrabold uppercase rounded-full tracking-widest border border-green-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        Best Choice
                    </div>
                )}
            </div>

            {/* Core numbers */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Exchange Rate</p>
                    <p className="text-white font-bold font-syne text-lg tracking-tight">{rate.toFixed(4)}</p>
                </div>
                <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Transfer Fee</p>
                    <p className="text-white font-bold font-syne text-lg tracking-tight">
                        {platform.feeType === 'percentage' ? `${platform.transferFee}%` : `$${platform.transferFee}`}
                        <span className="text-gray-500 text-[10px] font-medium ml-1.5 tracking-normal">
                            (~{fee.toFixed(2)})
                        </span>
                    </p>
                </div>
                <div className="col-span-2 pt-3 border-t border-white/5 mt-1">
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Recipient Gets</p>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-extrabold text-white font-syne tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 [text-shadow:0_4px_12px_rgba(255,255,255,0.1)]">
                                {formatCurrency(received)}
                            </span>
                            <img src={`https://flagcdn.com/w40/${selectedPair.toCountry}.png`} alt={selectedPair.to} className="w-5 h-5 rounded-full object-cover border border-white/20 shadow-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature List */}
            <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/10">
                        <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Speed</p>
                        <p className="text-sm text-gray-300 font-medium">{platform.speed}</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/10">
                        <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Limits</p>
                        <p className="text-sm text-gray-300 font-medium">
                            Up to ${platform.maxAmount.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Pros Snippet */}
            <div className="mb-8">
                <ul className="space-y-2">
                    {platform.pros?.slice(0, 2).map((pro, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                            <div className="w-1 h-1 rounded-full bg-purple-500/50" />
                            <span className="line-clamp-1">{pro}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Action */}
            <Link
                href={platform.visitUrl}
                target="_blank"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-white/10 to-white/5 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 border border-white/10 hover:border-transparent hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] group/btn"
            >
                Visit {platform.name}
                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Link>
        </div>
    );
}
