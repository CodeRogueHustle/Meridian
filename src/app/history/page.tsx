"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Background from "@/components/Background";

import UserMenu from "@/components/UserMenu";
import {
    predictionHistory,
    transactionHistory,
    accuracyOverTime,
    savingsPerMonth,
    platformUsage,
    historyStats,
} from "@/lib/history-data";
import { PLATFORM_LOGOS, CURRENCY_TO_COUNTRY } from "@/lib/currency-data";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { Download, CheckCircle, XCircle, TrendingUp, DollarSign, Target, Award } from "lucide-react";

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981'];

export default function HistoryPage() {
    const { isLoaded, userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !userId) {
            router.push("/sign-in");
        }
    }, [isLoaded, userId, router]);

    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'predictions' | 'transactions'>('predictions');
    const [accuracyFilter, setAccuracyFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

    useEffect(() => {
        // Clerk middleware already protects this route.
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen text-white relative isolate flex items-center justify-center">
                <Background />
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }



    const filteredPredictions = predictionHistory.filter(p => {
        if (accuracyFilter === 'all') return true;
        if (accuracyFilter === 'correct') return p.isCorrect;
        return !p.isCorrect;
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
                        <Link href="/history" className="text-white">History</Link>
                        <Link href="/alerts" className="hover:text-white transition-colors">Alerts</Link>
                        <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
                    </nav>
                    <UserMenu />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Accuracy</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{historyStats.overallAccuracy}%</p>
                        <p className="text-xs text-gray-400 mt-1">This month</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/20">
                                <Award className="w-5 h-5 text-blue-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Best Pair</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{historyStats.bestPerformingPair}</p>
                        <p className="text-xs text-green-400 mt-1">{historyStats.bestPairAccuracy}% accuracy</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/20">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Total Saved</span>
                        </div>
                        <p className="text-3xl font-bold text-green-400">₹{historyStats.totalSaved.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1">From ${historyStats.totalTransferred.toLocaleString()} transferred</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-indigo-500/20">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                            </div>
                            <span className="text-gray-400 text-sm">Predictions</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{historyStats.totalPredictions}</p>
                        <p className="text-xs text-gray-400 mt-1">Total made</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Accuracy Over Time */}
                    <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-4">Accuracy Over Time</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={accuracyOverTime}>
                                    <defs>
                                        <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={[50, 80]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e5e7eb' }}
                                    />
                                    <Area type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracy)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Platform Usage */}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-4">Platform Usage</h3>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={platformUsage}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="percentage"
                                    >
                                        {platformUsage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e5e7eb' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {platformUsage.map((p, i) => (
                                <div key={p.platform} className="flex items-center gap-1 text-xs">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-gray-400">{p.platform}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Savings Chart */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold mb-4">Monthly Savings (₹)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={savingsPerMonth}>
                                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e5e7eb' }}
                                    formatter={(value: number | undefined) => [`₹${value?.toLocaleString() ?? '0'}`, 'Savings']}
                                />
                                <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('predictions')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'predictions' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Prediction History
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'transactions' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Transaction History
                    </button>
                    <div className="flex-1" />
                    {activeTab === 'predictions' && (
                        <div className="flex gap-2">
                            {(['all', 'correct', 'incorrect'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setAccuracyFilter(filter)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${accuracyFilter === filter ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                    {activeTab === 'transactions' && (
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    )}
                </div>

                {/* Tables */}
                {activeTab === 'predictions' ? (
                    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date/Time</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Pair</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Prediction</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actual</th>
                                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-400">Result</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPredictions.map((p) => (
                                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-white text-sm">{p.date}</p>
                                            <p className="text-gray-400 text-xs">{p.time}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center -space-x-1 shrink-0">
                                                    <img src={`https://flagcdn.com/w40/${CURRENCY_TO_COUNTRY[p.pairDisplay.split(' ')[0]]}.png`} alt="" className="w-5 h-5 rounded-full object-cover border border-gray-800 z-10" />
                                                    <img src={`https://flagcdn.com/w40/${CURRENCY_TO_COUNTRY[p.pairDisplay.split(' ')[2]]}.png`} alt="" className="w-5 h-5 rounded-full object-cover border border-gray-800" />
                                                </div>
                                                <span className="text-white text-sm">{p.pairDisplay}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm ${p.predictedDirection === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                                {p.predictedDirection === 'up' ? '▲' : '▼'} {p.predictedChange}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm ${p.actualDirection === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                                {p.actualDirection === 'up' ? '▲' : '▼'} {p.actualChange}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.isCorrect ? (
                                                <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-300">{p.confidence}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Conversion</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Platform</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Our Advice</th>
                                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Savings</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactionHistory.map((t) => (
                                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-white">{t.date}</td>
                                        <td className="px-6 py-4 text-white">${t.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex items-center -space-x-1 shrink-0">
                                                    <img src={`https://flagcdn.com/w40/${CURRENCY_TO_COUNTRY[t.fromCurrency]}.png`} alt="" className="w-5 h-5 rounded-full object-cover border border-gray-800 z-10" />
                                                    <img src={`https://flagcdn.com/w40/${CURRENCY_TO_COUNTRY[t.toCurrency]}.png`} alt="" className="w-5 h-5 rounded-full object-cover border border-gray-800" />
                                                </div>
                                                <span className="text-white text-sm">{t.fromCurrency} → {t.toCurrency}</span>
                                            </div>
                                            <span className="text-gray-400 text-xs block">@ {t.rateUsed}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-sm">
                                                    {PLATFORM_LOGOS[t.platform] ? (
                                                        <img src={PLATFORM_LOGOS[t.platform]} alt={t.platform} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400">{t.platform.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <span className="text-purple-400 text-sm font-medium">{t.platform}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{t.ourPrediction}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={t.savings >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                {t.savings >= 0 ? '+' : ''}₹{t.savings.toLocaleString()}
                                            </span>
                                            <span className={`text-xs block ${t.savings >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                                {t.savingsPercent >= 0 ? '+' : ''}{t.savingsPercent}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
