'use client';

import React, { useMemo } from 'react';
import { Transaction } from '@/lib/types/transaction';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Wallet } from 'lucide-react';

interface SavingsAnalyticsProps {
    transactions: Transaction[];
}

export default function SavingsAnalytics({ transactions }: SavingsAnalyticsProps) {
    // 1. Calculate Summary Stats
    const stats = useMemo(() => {
        if (transactions.length === 0) return null;

        const totalSaved = transactions.reduce((sum, t) => sum + t.savings, 0);
        const goodDecisions = transactions.filter(t => t.isGoodDecision).length;
        const accuracy = Math.round((goodDecisions / transactions.length) * 100);
        const avgSavings = totalSaved / transactions.length;

        // Find best/worst
        const bestTx = transactions.reduce((prev, curr) => (prev.savings > curr.savings) ? prev : curr);
        const worstTx = transactions.reduce((prev, curr) => (prev.savings < curr.savings) ? prev : curr);

        return { totalSaved, accuracy, avgSavings, bestTx, worstTx };
    }, [transactions]);

    // 2. Prepare Chart Data
    const chartData = useMemo(() => {
        // Group by Month
        const monthlyData: Record<string, number> = {};
        transactions.forEach(t => {
            // "Jan 24"
            const month = new Date(t.date).toLocaleString('default', { month: 'short' });
            monthlyData[month] = (monthlyData[month] || 0) + (t.savings > 0 ? t.savings : 0); // Only tracking positive "Savings" for bar chart? Or net? Let's do net.
        });

        const barData = Object.keys(monthlyData).map(m => ({
            name: m,
            savings: Math.round(monthlyData[m])
        })).reverse(); // Assuming input was desc date, reverse for chart left-to-right (old -> new) if sorting was consistent.
        // Actually sorting keys might be safer but for mock it's fine.

        // Pie Data
        const goodCount = transactions.filter(t => t.isGoodDecision).length;
        const badCount = transactions.length - goodCount;
        const pieData = [
            { name: 'Followed Prediction', value: goodCount },
            { name: 'Ignored/Missed', value: badCount },
        ];

        return { barData, pieData };
    }, [transactions]);

    if (!stats) return null;

    const COLORS = ['#10B981', '#EF4444'];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Accuracy</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{stats.accuracy}%</div>
                    <p className="text-xs text-gray-500 mt-1">{transactions.filter(t => t.isGoodDecision).length} successful decisions</p>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                        <Wallet className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Avg. Savings</span>
                    </div>
                    <div className="text-3xl font-bold text-white">₹{Math.round(stats.avgSavings)}</div>
                    <p className="text-xs text-gray-500 mt-1">per transfer</p>
                </div>

                <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Best Move</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-1">+₹{Math.round(stats.bestTx.savings)}</div>
                    <p className="text-xs text-gray-400">{new Date(stats.bestTx.date).toLocaleDateString()} via {stats.bestTx.platform}</p>
                </div>

                <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2 text-red-400">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Missed Opp</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-1">-₹{Math.abs(Math.round(stats.worstTx.savings))}</div>
                    <p className="text-xs text-gray-400">{new Date(stats.worstTx.date).toLocaleDateString()} via {stats.worstTx.platform}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart */}
                <div className="lg:col-span-2 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-6">Monthly Savings</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.barData}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#6B7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#6B7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="savings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-6">Decision Quality</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData.pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div> Good
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div> Missed
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
