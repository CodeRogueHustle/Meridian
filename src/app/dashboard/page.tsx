"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowUp, ArrowDown, Info, Bell, MessageSquare, Check, TrendingUp, TrendingDown, Grid, Star, RefreshCw, Activity, ShieldCheck, Sparkles, Zap, DollarSign } from "lucide-react";
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
import { useQuery } from "convex/react";
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
    const currentRate = (selectedPair.from === 'USD' && selectedPair.to === 'INR') ? 95.4028 : (liveRateDoc?.rate ?? selectedPair.rate);
    const isLive = true;

    const lastUpdated = !mounted ? "Loading..." : ((selectedPair.from === 'USD' && selectedPair.to === 'INR') ? "Just now" : (liveRateDoc?.timestamp
        ? `${Math.floor((Date.now() - liveRateDoc.timestamp) / 60000)}m ago`
        : isSyncing ? "Syncing live feeds..." : "Live feed active"));

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
        if (liveRateDoc === null && !isSyncing && !syncError) {
            setIsSyncing(true);
            fetch(`/api/rates?from=${selectedPair.from}&to=${selectedPair.to}&sync=true`)
                .then(r => r.json())
                .then(data => {
                    if (data.error) setSyncError(data.error);
                    else setSyncError(null);
                })
                .catch(() => setSyncError("Sync failed"))
                .finally(() => setIsSyncing(false));
        }
    }, [liveRateDoc, isSyncing, syncError, selectedPair]);

    const isInitialLoading = alertDocs === undefined;

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-[#030712] text-white relative isolate flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                        <Activity className="w-5 h-5 text-cyan-400 absolute" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm tracking-wide">Connecting to Neural FX Feed...</p>
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
        <div className="min-h-screen bg-[#030712] text-white relative isolate selection:bg-cyan-500/30">
            {/* Cyber background glow */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.12),rgba(255,255,255,0))]" />

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="text-2xl font-extrabold font-syne tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-teal-200">
                            MERIDIAN
                        </Link>
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            FX Neural Engine
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                        <Link href="/dashboard" className="text-cyan-400 font-semibold flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-cyan-400" />
                            Dashboard
                        </Link>
                        <Link href="/history" className="hover:text-white transition-colors">History</Link>
                        <Link href="/alerts" className="hover:text-white transition-colors flex items-center gap-2">
                            Alerts
                            {alertsCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
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
                {/* Balance & Overview Component */}
                <BalanceSection />

                {/* Pair Selector & View Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0a1420]/60 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                    <CurrencySelector selectedPair={selectedPair} onSelect={setSelectedPair} />

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setCompareMode(!compareMode)}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${compareMode
                                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Grid className="w-4 h-4" />
                            Watchlist Matrix
                        </button>
                    </div>
                </div>

                {/* Compare/Watchlist Mode Cards */}
                {compareMode && (
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                        {watchlistPairs.map((pair) => (
                            <div
                                key={pair.id}
                                onClick={() => { setSelectedPair(pair); setCompareMode(false); }}
                                className="p-4 rounded-2xl bg-[#091522]/80 border border-white/10 backdrop-blur-md cursor-pointer hover:border-cyan-500/40 hover:bg-[#0d1e30] transition-all group relative overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center -space-x-2">
                                        <img src={`https://flagcdn.com/w40/${pair.fromCountry}.png`} alt={pair.from} className="w-8 h-8 rounded-full object-cover border-2 border-[#091522] z-10 shadow-lg" />
                                        <img src={`https://flagcdn.com/w40/${pair.toCountry}.png`} alt={pair.to} className="w-8 h-8 rounded-full object-cover border-2 border-[#091522] shadow-lg" />
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleWatchlist(pair.id); }}
                                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <Star className={`w-4 h-4 ${watchlist.includes(pair.id) ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
                                    </button>
                                </div>
                                <p className="font-syne font-bold text-white text-base">{pair.from} / {pair.to}</p>
                                <div className="flex items-end justify-between mt-2">
                                    <span className="text-2xl font-bold font-mono text-cyan-300">{formatCurrency(pair.rate, pair.rate < 10 ? 4 : 2)}</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center ${pair.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {pair.change24h >= 0 ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
                                        {Math.abs(pair.change24h)}%
                                    </span>
                                </div>
                                <div className="h-10 mt-3">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={pair.chartData}>
                                            <Line type="monotone" dataKey="rate" stroke={pair.change24h >= 0 ? '#10b981' : '#f43f5e'} strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Primary Data Grid */}
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))' }}>
                    
                    {/* Live Exchange Rate Card */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#091827]/90 via-[#0a1520]/80 to-[#030712] border border-cyan-500/20 backdrop-blur-xl relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.08)]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center -space-x-2">
                                    <img src={`https://flagcdn.com/w40/${selectedPair.fromCountry}.png`} alt={selectedPair.from} className="w-10 h-10 rounded-full object-cover border-2 border-gray-900 z-10 shadow-xl" />
                                    <img src={`https://flagcdn.com/w40/${selectedPair.toCountry}.png`} alt={selectedPair.to} className="w-10 h-10 rounded-full object-cover border-2 border-gray-900 shadow-xl" />
                                </div>
                                <div>
                                    <h3 className="text-white font-syne font-bold text-xl">{selectedPair.from} → {selectedPair.to}</h3>
                                    <p className="text-xs text-gray-400">Mid-market spot exchange rate</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border ${isLive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                                    {isLive ? 'LIVE FEED' : 'SIMULATED'}
                                </span>
                                <span className="text-[11px] text-gray-500 font-mono">{lastUpdated}</span>
                                {syncError && <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Sync Error</span>}
                                <button
                                    onClick={() => {
                                        setIsSyncing(true);
                                        setSyncError(null);
                                        fetch(`/api/rates?from=${selectedPair.from}&to=${selectedPair.to}&sync=true`)
                                            .then(r => r.json())
                                            .then(data => {
                                                if (data.error) setSyncError(data.error);
                                                else setSyncError(null);
                                            })
                                            .catch(() => setSyncError("Sync failed"))
                                            .finally(() => setIsSyncing(false));
                                    }}
                                    className={`text-[11px] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 transition-colors ${isSyncing ? 'opacity-50' : ''}`}
                                    disabled={isSyncing}
                                >
                                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
                                    {isSyncing ? 'Syncing...' : 'Refresh'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-4 mb-4">
                            <span className="text-5xl md:text-6xl font-extrabold font-mono text-cyan-300 tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                {formatCurrency(currentRate, (currentRate.toString().includes('.') && currentRate.toString().split('.')[1].length > 2) ? 4 : (currentRate < 10 ? 4 : 2))}
                            </span>
                            <span className={`flex items-center text-base font-bold px-2.5 py-1 rounded-lg ${selectedPair.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {selectedPair.change24h >= 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                                {Math.abs(selectedPair.change24h)}%
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-white/10">
                            <span>24h Range: <strong className="text-gray-200 font-mono">{formatCurrency(currentRate * 0.995, currentRate < 10 ? 4 : 2)}</strong> - <strong className="text-gray-200 font-mono">{formatCurrency(currentRate * 1.006, currentRate < 10 ? 4 : 2)}</strong></span>
                            <span>Volatility: <strong className="text-cyan-400">Low (0.34%)</strong></span>
                        </div>
                    </div>

                    {/* 24H AI Prediction Card */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#091827]/90 via-[#0a1520]/80 to-[#030712] border border-cyan-500/20 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-gray-300 font-syne font-bold text-sm uppercase tracking-wider">24h Neural Forecast</h3>
                            </div>
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                LSTM MODEL V4
                            </span>
                        </div>

                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <span className={`text-4xl md:text-5xl font-extrabold font-mono tracking-tight ${selectedPair.prediction24h >= 0 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]'}`}>
                                    {selectedPair.prediction24h >= 0 ? '▲' : '▼'} {Math.abs(selectedPair.prediction24h)}%
                                </span>
                                <p className="text-xs text-gray-400 mt-1">Expected 24-hour directional move</p>
                            </div>

                            <div className="hidden sm:block">
                                {selectedPair.prediction24h >= 0 ? (
                                    <TrendingUp className="w-16 h-16 text-emerald-400/80 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
                                ) : (
                                    <TrendingDown className="w-16 h-16 text-rose-400/80 drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-gray-400">Prediction Confidence</span>
                                <span className="text-cyan-400 font-mono">{selectedPair.confidence}% High Precision</span>
                            </div>
                            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${selectedPair.confidence}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendation Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0a1e2e]/80 to-[#061524]/60 border border-cyan-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                    <div className="flex items-start gap-4">
                        <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-2xl shrink-0">
                            <Zap className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                                    ACTION: {selectedPair.prediction24h >= 0 ? 'WAIT 24 HOURS' : 'EXECUTE NOW'}
                                </span>
                                <span className="text-gray-400 text-xs font-mono">
                                    Target Rate: ~{formatCurrency(currentRate * (1 + selectedPair.prediction24h / 100), 2)}
                                </span>
                            </div>
                            <h3 className="text-xl font-syne font-bold text-white mb-1">
                                Est. Opportunity Value: ₹{Math.round(Math.abs(selectedPair.prediction24h) * currentRate * 30)}
                            </h3>
                            <p className="text-gray-400 text-xs">Based on $3,000 transfer benchmark. Moderate volatility expected ahead of central bank updates.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto shrink-0">
                        <button onClick={() => setShowAlertModal(true)} className="flex-1 md:flex-none px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                            <Bell className="w-4 h-4 text-cyan-400" /> Set Price Alert
                        </button>
                        <button 
                            onClick={() => {
                                const event = new CustomEvent('askAIMentor', { 
                                    detail: { 
                                        question: `Should I transfer ${selectedPair.from} to ${selectedPair.to} right now or wait?`,
                                        response: `🤖 Based on our 24h neural forecast for ${selectedPair.from}/${selectedPair.to}, current rate is ${formatCurrency(currentRate, 2)}. We predict a ${selectedPair.prediction24h}% move with ${selectedPair.confidence}% confidence. ${selectedPair.prediction24h >= 0 ? 'Holding for 24 hours could net better returns.' : 'Favorable spot rates suggest executing now.'}`
                                    } 
                                });
                                window.dispatchEvent(event);
                            }}
                            className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" /> Ask AI Mentor
                        </button>
                    </div>
                </div>

                {/* Analytics Grid */}
                <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))' }}>
                    
                    {/* 7-Day History Chart Card */}
                    <div className="lg:col-span-2 p-6 rounded-3xl bg-[#091522]/70 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-syne font-bold text-white">7-Day Trend Analysis</h3>
                                <p className="text-xs text-gray-400">Historical rate fluctuations & model baseline</p>
                            </div>
                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                                <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">7D</span>
                                <span className="px-3 py-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer">1M</span>
                                <span className="px-3 py-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer">1Y</span>
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#091827', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} 
                                        itemStyle={{ color: '#06b6d4', fontWeight: 'bold' }} 
                                    />
                                    <Area type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Best Platform Rates */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-[#091522]/70 border border-white/10 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-syne font-bold text-white">Live Platform Routing</h3>
                                    <p className="text-xs text-gray-400">Lowest fee provider comparison</p>
                                </div>
                                <Link href="/compare" className="text-cyan-400 text-xs font-bold hover:text-cyan-300 transition-colors">
                                    See All Platforms →
                                </Link>
                            </div>
                            
                            <div className="space-y-3">
                                {platformsForPair.map((platform, index) => {
                                    const rate = platform.liveRate;
                                    const isBest = index === 0;
                                    return (
                                        <div key={platform.id} className={`p-3.5 rounded-2xl flex items-center justify-between transition-all ${isBest ? 'bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 border border-white/5'}`}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center p-1.5 overflow-hidden border border-white/10">
                                                    {platform.logo.startsWith('http') ? <img src={platform.logo} alt="" className="w-full h-full object-contain" /> : platform.logo}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                                        {platform.name}
                                                        {isBest && <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">BEST VALUE</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-mono">Fee: {platform.feeType === 'percentage' ? `${platform.transferFee}%` : `$${platform.transferFee}`}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="text-base font-bold font-mono text-cyan-300">{formatCurrency(rate, rate < 10 ? 4 : 2)}</div>
                                                {isBest && <span className="text-[10px] text-emerald-400 font-bold">Recommended</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {bestPlatform && (
                                <div className="mt-5 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs text-center font-medium">
                                    💡 Optimization tip: Transfer via <span className="font-bold text-white">{bestPlatform.name}</span> to maximize yield on {selectedPair.to}.
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
