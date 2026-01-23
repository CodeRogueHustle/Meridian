'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { getTransactions } from '@/lib/transactions-store';
import { Transaction } from '@/lib/types/transaction';

import LogTransferModal from '@/components/transactions/log-modal';
import TransactionTable from '@/components/transactions/transaction-table';
import SavingsAnalytics from '@/components/transactions/savings-analytics';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    // Load data
    const refreshData = () => {
        setTransactions(getTransactions());
    };

    useEffect(() => {
        refreshData();
    }, []);

    // Calculate total saved for header
    const totalSaved = transactions.reduce((sum, t) => sum + t.savings, 0);

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-syne font-bold">My Transfers</h1>
                            <p className="text-gray-400">Track your FX history and savings</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button
                            onClick={() => setIsLogModalOpen(true)}
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-white shadow-lg shadow-green-500/20 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Log Transfer
                        </button>
                    </div>
                </header>

                {/* Hero Card */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <p className="text-sm font-bold uppercase tracking-widest text-green-400 mb-2">Total Life-time Savings</p>
                        <h2 className="text-5xl md:text-6xl font-syne font-bold text-white mb-2">
                            ₹{Math.round(totalSaved).toLocaleString()}
                        </h2>
                        <p className="text-gray-400">
                            Across <span className="font-bold text-white">{transactions.length}</span> transfers logged since Oct 2025
                        </p>
                    </div>
                </div>

                {/* Analytics Section */}
                <section>
                    <h2 className="text-xl font-bold font-syne mb-6">Performance Analytics</h2>
                    <SavingsAnalytics transactions={transactions} />
                </section>

                {/* Transactions List */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold font-syne">Transfer History</h2>
                        <div className="text-sm text-gray-500">{transactions.length} records</div>
                    </div>
                    <TransactionTable transactions={transactions} />
                </section>
            </div>

            {/* Modal */}
            <LogTransferModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                onSave={refreshData}
            />
        </div>
    );
}
