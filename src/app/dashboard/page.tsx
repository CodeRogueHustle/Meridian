"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Background from "@/components/Background";
import {
    ArrowUp, ArrowDown, Info, Bell, MessageSquare, Check, TrendingUp, TrendingDown, Grid, Star, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import UserMenu from "@/components/UserMenu";
import CurrencySelector from "@/components/CurrencySelector";
import ConverterWidget from "@/components/ConverterWidget";
import AIChatMentor from "@/components/AIChatMentor";
import BalanceSection from "@/components/BalanceSection";
import CreateAlertModal from "@/components/alerts/create-alert-modal";
import { currencyPairs, platforms, CurrencyPair, Platform, getBestPlatformForPair, formatCurrency, getAdjustedPlatformRate } from "@/lib/currency-data";
import SavingsWidget from "@/components/transactions/savings-widget";
import { useQuery, useAction } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";

export default function Dashboard() {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push("/sign-in");
        }
    }, [isLoaded, userId, router]);

    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedPair, setSelectedPair] = useState<CurrencyPair>(currencyPairs[0]);
    const [compareMode, setCompareMode] = useState(false);
    const [watchlist, setWatchlist] = useState<string[]>(['usd-inr', 'eur-usd', 'gbp-usd', 'usd-jpy']);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);

    // Convex integration
    const alertDocs = useQuery(api.alerts.getUserAlerts, {});
    const alertsCount = alertDocs ? alertDocs.filter((a: any) => a.status === 'active').length : 0;

    // @ts-ignore
    const forceRefreshRates = useAction(api.rates.syncRates);

    // Live Rates Logic
    // @ts-ignore
    const liveRateDoc = useQuery(api.rates.getLatestRate, {
        pair: `${selectedPair.from}/${selectedPair.to}`
    });

    // @ts-ignore
    const liveHistoryDocs = useQuery(api.rates.getRateHistory, {
        pair: `${selectedPair.from}/${selectedPair.to}`,
        days: 7
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // Merge live data with mock fallback
    const currentRate = liveRateDoc?.rate ?? selectedPair.rate;
    const isLive = !!liveRateDoc;

    const lastUpdated = !mounted ? "Loading..." : (liveRateDoc?.timestamp
        ? `${Math.floor((Date.now() - liveRateDoc.timestamp) / 60000)} minutes ago`
        : isSyncing ? "Syncing live rates..." : "Live rates unavailable");

    const chartData = liveHistoryDocs && liveHistoryDocs.length > 0
        ? (liveHistoryDocs as any[]).map(d => ({
            name: mounted ? new Date(d.timestamp).toLocaleDateString([], { weekday: 'short' }) : '...',
            rate: d.rate
        }))
        : selectedPair.chartData;

    const watchlistPairIds = watchlist.map(id => {
        const p = currencyPairs.find(cp => cp.id === id);
        return p ? `${p.from}/${p.to}` : "";
    }).filter(p => p !== "");

    // @ts-ignore
    const liveWatchlistDocs = useQuery(api.rates.getLatestRates, {
        pairs: watchlistPairIds
    });

    useEffect(() => {
        // Force an initial fetch if no live rates are found in DB
        // We trigger it if liveRateDoc is null (query finished but found nothing)
        if (liveRateDoc === null && !isSyncing && !syncError) {
            console.log("No live rates in Convex. Triggering bridge sync via API Route...");
            setIsSyncing(true);

            // Using the API route bridge as it's the most robust method for local dev
            fetch(`/api/rates?from=${selectedPair.from}&to=${selectedPair.to}&sync=true`)
                .then(r => r.json())
                .then(data => {
                    if (data.error) {
                        setSyncError(data.error);
                    } else {
                        console.log("Bridge sync successful:", data);
                        setSyncError(null);
                    }
                })
                .catch(err => {
                    console.error("Bridge sync failed:", err);
                    setSyncError("Network error during sync");
                })
                .finally(() => {
                    setIsSyncing(false);
                });
        }
    }, [liveRateDoc, isSyncing, syncError, selectedPair]);

    // LOADING STATE: Driven by actual data arrival instead of artificial timers
    const isInitialLoading = alertDocs === undefined;

    if (isInitialLoading) {
        return (
            <div className="min-h-screen text-white relative isolate flex items-center justify-center">
                <Background />
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <p className="text-gray-400 font-medium">Initializing FX Intelligence...</p>
                </div>
            </div>
        );
    }

    const bestPlatform = getBestPlatformForPair(selectedPair.id, currentRate);
    const platformsForPair = platforms
        .filter(p => p.rates[selectedPair.id] !== undefined)
        .slice(0, 5)
        .map(p => ({
            ...p,
            liveRate: getAdjustedPlatformRate(p, selectedPair.id, currentRate)
        }))
        .sort((a, b) => b.liveRate - a.liveRate);

    const watchlistPairs = currencyPairs
        .filter(p => watchlist.includes(p.id))
        .map(p => {
            const liveDoc = (liveWatchlistDocs as any[])?.find(d => d && d.pair === `${p.from}/${p.to}`);
            return {
                ...p,
                rate: liveDoc?.rate ?? p.rate
            };
        });

    const toggleWatchlist = (pairId: string) => {
        if (watchlist.includes(pairId)) {
            setWatchlist(watchlist.filter(id => id !== pairId));
        } else {
            setWatchlist([...watchlist, pairId]);
        }
    };

    return (
        <div className="min-h-screen text-white relative isolate">
            <Background />

            <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-extrabold font-syne tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200">
                        MERIDIAN
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                        <Link href="/dashboard" className="text-white">Dashboard</Link>
                        <Link href="/history" className="hover:text-white transition-colors">History</Link>
                        <Link href="/alerts" className="hover:text-white transition-colors flex items-center gap-2">
                            Alerts
                            {alertsCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold">
                                    {alertsCount}
                                </span>
                            )}
                        </Link>
                        <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <UserMenu />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <BalanceSection />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CurrencySelector selectedPair={selectedPair} onSelect={setSelectedPair} />

                    <button
                        onClick={() => setCompareMode(!compareMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${compareMode
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                            }`}
                    >
                        <Grid className="w-4 h-4" />
                        Compare Pairs
                    </button>
                </div>

                {compareMode && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {watchlistPairs.map((pair) => (
                            <div
                                key={pair.id}
                                onClick={() => { setSelectedPair(pair); setCompareMode(false); }}
                                className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors group"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center -space-x-2">
                                        <img src={`https://flagcdn.com/w40/${pair.fromCountry}.png`} alt={pair.from} className="w-8 h-8 rounded-full object-cover border-2 border-gray-900 z-10 shadow-lg" />
                                        <img src={`https://flagcdn.com/w40/${pair.toCountry}.png`} alt={pair.to} className="w-8 h-8 rounded-full object-cover border-2 border-gray-900 shadow-lg" />
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(pair.id); }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Star className={`w-4 h-4 ${watchlist.includes(pair.id) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                                    </button>
                                </div>
                                <p className="font-semibold text-white">{pair.from} → {pair.to}</p>
                                <div className="flex items-end justify-between mt-2">
                                    <span className="text-2xl font-bold">{formatCurrency(pair.rate, pair.rate < 10 ? 4 : 2)}</span>
                                    <span className={`text-sm flex items-center ${pair.change24h >= 0 ? 'text-[#28ff00]' : 'text-red-400'}`}>
                                        {pair.change24h >= 0 ? <ArrowUp className="w-3 h-3 text-[#28ff00]" /> : <ArrowDown className="w-3 h-3" />}
                                        {Math.abs(pair.change24h)}%
                                    </span>
                                </div>
                                <div className="h-12 mt-3">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={pair.chartData}>
                                            <Line type="monotone" dataKey="rate" stroke={pair.change24h >= 0 ? '#28ff00' : '#ef4444'} strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center -space-x-2">
                                    <img src={`https://flagcdn.com/w40/${selectedPair.fromCountry}.png`} alt={selectedPair.from} className="w-10 h-10 rounded-full object-cover border-2 border-gray-900 z-10 shadow-xl" />
                                    <img src={`https://flagcdn.com/w40/${selectedPair.toCountry}.png`} alt={selectedPair.to} className="w-10 h-10 rounded-full object-cover border-2 border-gray-900 shadow-xl" />
                                </div>
                                <h3 className="text-gray-400 font-bold text-lg ml-1">{selectedPair.from} → {selectedPair.to}</h3>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isLive ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                    {isLive ? 'LIVE' : 'MOCK'}
                                </span>
                                <span className="text-xs text-gray-500">{lastUpdated}</span>
                                {syncError && <span className="text-[10px] text-red-500 font-bold bg-white/5 px-2 py-1 rounded">⚠️ Sync Error</span>}
                                <button
                                    onClick={() => {
                                        setIsSyncing(true);
                                        setSyncError(null);
                                        // Use bridge sync for maximum reliability
                                        fetch(`/api/rates?from=${selectedPair.from}&to=${selectedPair.to}&sync=true`)
                                            .then(r => r.json())
                                            .then(data => {
                                                if (data.error) setSyncError(data.error);
                                                else setSyncError(null);
                                            })
                                            .catch(err => setSyncError("Sync failed"))
                                            .finally(() => setIsSyncing(false));
                                    }}
                                    className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors ${isSyncing ? 'opacity-50' : ''}`}
                                    disabled={isSyncing}
                                >
                                    <div className={isSyncing ? 'animate-spin' : ''}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                                    </div>
                                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                                </button>
                            </div>
                        </div>
                        <div className="flex items-end gap-4 mb-2">
                            <span className="text-5xl font-bold text-[#28ff00] [text-shadow:0_0_10px_#28ff00]">
                                {formatCurrency(currentRate, currentRate < 10 ? 4 : 2)}
                            </span>
                            <span className={`flex items-center mb-2 font-medium ${selectedPair.change24h >= 0 ? 'text-[#28ff00]' : 'text-red-400'}`}>
                                {selectedPair.change24h >= 0 ? <ArrowUp className="w-5 h-5 mr-1 text-[#28ff00]" /> : <ArrowDown className="w-5 h-5 mr-1" />}
                                {Math.abs(selectedPair.change24h)}%
                            </span>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            {selectedPair.prediction24h >= 0 ? (
                                <TrendingUp
                                    size={96}
                                    color="#28ff00"
                                    strokeWidth={3}
                                    className="opacity-100 drop-shadow-[0_0_15px_rgba(40,255,0,0.6)]"
                                />
                            ) : (
                                <TrendingDown
                                    size={96}
                                    color="#f87171"
                                    strokeWidth={3}
                                    className="opacity-100 drop-shadow-[0_0_15px_rgba(248,113,113,0.6)]"
                                />
                            )}
                        </div>
                        <h3 className="text-gray-400 mb-4 font-bold text-sm uppercase tracking-widest">24h Prediction</h3>
                        <div className="flex items-end gap-4 mb-6">
                            <span className={`text-4xl font-bold [text-shadow:0_0_10px_currentColor] ${selectedPair.prediction24h >= 0 ? 'text-[#28ff00]' : 'text-red-400'}`}>
                                {selectedPair.prediction24h >= 0 ? '▲' : '▼'} {Math.abs(selectedPair.prediction24h)}%
                            </span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Confidence</span>
                                <span className="text-[#28ff00] font-bold">{selectedPair.confidence}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#28ff00]" style={{ width: `${selectedPair.confidence}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-500/20 p-3 rounded-xl">
                            <Info className="w-10 h-10 text-yellow-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-bold border border-yellow-500/30">
                                    🟡 {selectedPair.prediction24h >= 0 ? 'WAIT 24 HOURS' : 'SEND NOW'}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    Target: ~{formatCurrency(currentRate * (1 + selectedPair.prediction24h / 100), 2)}
                                </span>
                            </div>
                            <h3 className="text-xl font-semibold mb-1">
                                Potential saving: ₹{Math.round(Math.abs(selectedPair.prediction24h) * currentRate * 30)}
                            </h3>
                            <p className="text-gray-400 text-sm">Risk: Medium volatility expected ahead of announcement</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button onClick={() => setShowAlertModal(true)} className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                            <Bell className="w-4 h-4" /> Set Alert
                        </button>
                        <button className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Ask AI
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-6">7-Day History</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#e5e7eb' }} />
                                    <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Best Rates</h3>
                                <Link href="/compare" className="text-purple-400 text-sm hover:text-purple-300">See all</Link>
                            </div>
                            <div className="space-y-3">
                                {platformsForPair.map((platform, index) => {
                                    const rate = platform.liveRate;
                                    const isBest = index === 0;
                                    return (
                                        <div key={platform.id} className={`p-4 rounded-xl flex items-center justify-between ${isBest ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden">
                                                    {platform.logo.startsWith('http') ? <img src={platform.logo} alt="" className="w-full h-full object-contain" /> : platform.logo}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold">{platform.name}</div>
                                                    <div className="text-lg font-bold">{formatCurrency(rate, rate < 10 ? 4 : 2)}</div>
                                                </div>
                                            </div>
                                            {isBest && <Check className="w-5 h-5 text-green-400" />}
                                        </div>
                                    );
                                })}
                            </div>
                            {bestPlatform && (
                                <div className="mt-6 p-4 rounded-xl bg-blue-500/10 text-blue-300 text-sm text-center">
                                    Save <span className="font-bold text-blue-200">₹{Math.round(Math.abs(currentRate - (getAdjustedPlatformRate(bestPlatform, selectedPair.id, currentRate))) * 3000)}</span> using {bestPlatform.name}
                                </div>
                            )}
                        </div>
                        <SavingsWidget />
                    </div>
                </div>
            </main>

            <ConverterWidget defaultFromCurrency={selectedPair.from} defaultToCurrency={selectedPair.to} />
            <AIChatMentor />
            <CreateAlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                defaultFromCurrency={selectedPair.from}
                defaultToCurrency={selectedPair.to}
                currentRate={currentRate}
            />
        </div>
    );
}
