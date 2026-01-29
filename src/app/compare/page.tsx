"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUpDown, Filter, Search } from "lucide-react";
import Link from "next/link";
import Background from "@/components/Background";

import UserMenu from "@/components/UserMenu";
import { platforms, currencyPairs, Platform } from "@/lib/currency-data";
import SavingsCalculator from "@/components/SavingsCalculator";
import PlatformCard from "@/components/PlatformCard";

import { useQuery } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";
import { getAdjustedPlatformRate } from "@/lib/currency-data";

type SortKey = 'rate' | 'fee' | 'speed' | 'rating';

export default function ComparePage() {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push("/sign-in");
        }
    }, [isLoaded, userId, router]);

    const [isLoading, setIsLoading] = useState(true);

    // State lifted for SavingsCalculator and List
    const [selectedPairId, setSelectedPairId] = useState('usd-inr');
    const [amount, setAmount] = useState(1000);

    const selectedPair = currencyPairs.find(p => p.id === selectedPairId) || currencyPairs[0];

    // Convex Integration
    // @ts-ignore
    const liveRateDoc = useQuery(api.rates.getLatestRate, {
        pair: `${selectedPair.from}/${selectedPair.to}`
    });

    const currentRate = liveRateDoc?.rate ?? selectedPair.rate;

    // Filters for the list
    const [sortBy, setSortBy] = useState<SortKey>('rate');
    const [speedFilter, setSpeedFilter] = useState<'all' | 'instant' | '1day' | '2-3days'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'international' | 'india' | 'bank'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Clerk middleware already protects this route.
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen text-white relative isolate flex items-center justify-center">
                <Background />
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }



    // Filter & Sort Logic
    let filteredPlatforms = platforms
        .filter(p => p.rates[selectedPairId] !== undefined)
        .map(p => ({
            ...p,
            liveRate: getAdjustedPlatformRate(p, selectedPairId, currentRate)
        }));

    if (typeFilter !== 'all') {
        filteredPlatforms = filteredPlatforms.filter(p => p.type === typeFilter);
    }

    if (speedFilter !== 'all') {
        filteredPlatforms = filteredPlatforms.filter(p => {
            // Mock speed parsing or using speedHours
            if (speedFilter === 'instant') return p.speedHours <= 1;
            if (speedFilter === '1day') return p.speedHours <= 24;
            return p.speedHours > 24;
        });
    }

    if (searchQuery) {
        filteredPlatforms = filteredPlatforms.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.pros.some(pro => pro.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    // Sort
    filteredPlatforms.sort((a, b) => {
        // Recalculate sort values dynamically
        const rateA = (a as any).liveRate;
        const rateB = (b as any).liveRate;
        // Calculate effective amount received for sorting by rate/cost if needed
        // But simplistic sorting:
        switch (sortBy) {
            case 'rate': return rateB - rateA; // Higher rate first
            case 'fee': return a.transferFee - b.transferFee; // Lower fee first (naive)
            case 'speed': return a.speedHours - b.speedHours; // Faster first
            case 'rating': return b.rating - a.rating; // Higher rating first
            default: return 0;
        }
    });


    return (
        <div className="min-h-screen text-white relative isolate">
            <Background />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-extrabold font-syne tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200">
                        MERIDIAN
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                        <Link href="/history" className="hover:text-white transition-colors">History</Link>
                        <Link href="/alerts" className="hover:text-white transition-colors">Alerts</Link>
                        <Link href="/compare" className="text-white">Compare</Link>
                    </nav>
                    <UserMenu />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                {/* 1. SAVINGS CALCULATOR */}
                <section>
                    <SavingsCalculator
                        amount={amount}
                        setAmount={setAmount}
                        selectedPairId={selectedPairId}
                        setSelectedPairId={setSelectedPairId}
                        currentRate={currentRate}
                    />
                </section>

                {/* 2. PLATFORM DETAILS GRID */}
                <section>
                    <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Detailed Comparison</h2>
                            <p className="text-gray-400">Comparing {filteredPlatforms.length} platforms for {selectedPair.from} to {selectedPair.to}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors w-32 md:w-auto"
                                />
                            </div>

                            {/* Filters */}
                            <select
                                value={speedFilter}
                                onChange={(e) => setSpeedFilter(e.target.value as any)}
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value="all" className="bg-gray-900">Any Speed</option>
                                <option value="instant" className="bg-gray-900">Instant</option>
                                <option value="1day" className="bg-gray-900">Same Day</option>
                                <option value="2-3days" className="bg-gray-900">Standard</option>
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as any)}
                                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                            >
                                <option value="all" className="bg-gray-900">All Types</option>
                                <option value="international" className="bg-gray-900">Platform</option>
                                <option value="bank" className="bg-gray-900">Bank</option>
                                <option value="india" className="bg-gray-900">India</option>
                            </select>

                            {/* Sort */}
                            <div className="border-l border-white/10 pl-3 flex gap-1">
                                <button onClick={() => setSortBy('rate')} className={`p-2 rounded-lg transition-colors ${sortBy === 'rate' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/5 text-gray-400'}`} title="Best Rate">
                                    <ArrowUpDown className="w-4 h-4" />
                                </button>
                                <button onClick={() => setSortBy('rating')} className={`p-2 rounded-lg transition-colors ${sortBy === 'rating' ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/5 text-gray-400'}`} title="Best Rating">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))' }}>
                        {filteredPlatforms.map(platform => (
                            <PlatformCard
                                key={platform.id}
                                platform={platform}
                                selectedPair={selectedPair}
                                amount={amount}
                            />
                        ))}
                    </div>

                    {filteredPlatforms.length === 0 && (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                            <p className="text-gray-400">No platforms found matching your filters.</p>
                            <button
                                onClick={() => { setSpeedFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
                                className="mt-4 text-purple-400 hover:text-purple-300 underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
