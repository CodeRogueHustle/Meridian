'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { getTransactions } from '@/lib/transactions-store';

export default function SavingsWidget() {
    const [saved, setSaved] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const txs = getTransactions();
        const total = txs.reduce((sum, t) => sum + t.savings, 0);
        setSaved(total);
        setCount(txs.length);
    }, []);

    return (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-green-900/10 to-emerald-900/10 border border-green-500/20 backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <h3 className="font-bold text-white">Savings Tracker</h3>
                </div>

                <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Saved</p>
                    <p className="text-3xl font-syne font-bold text-white">₹{Math.round(saved).toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{count} transfers tracked</p>
                    <Link href="/transactions" className="flex items-center gap-1 text-sm font-bold text-green-400 hover:text-green-300 transition-colors">
                        View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
