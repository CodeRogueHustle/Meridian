'use client';

import React, { useState } from 'react';
import { Transaction } from '@/lib/types/transaction';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface TransactionTableProps {
    transactions: Transaction[];
}

type SortField = 'date' | 'amount' | 'savings';
type SortOrder = 'asc' | 'desc';

export default function TransactionTable({ transactions }: TransactionTableProps) {
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc'); // Default to desc mainly for all
        }
    };

    const sortedData = [...transactions].sort((a, b) => {
        let valA: number, valB: number;

        switch (sortField) {
            case 'date':
                valA = new Date(a.date).getTime();
                valB = new Date(b.date).getTime();
                break;
            case 'amount':
                valA = a.amount;
                valB = b.amount;
                break;
            case 'savings':
                valA = a.savings;
                valB = b.savings;
                break;
            default:
                return 0;
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        return sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-400" /> : <ArrowDown className="w-3 h-3 text-purple-400" />;
    };

    return (
        <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 uppercase font-bold text-xs tracking-wider text-gray-500">
                        <tr>
                            <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('date')}>
                                <div className="flex items-center gap-2">Date <SortIcon field="date" /></div>
                            </th>
                            <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('amount')}>
                                <div className="flex items-center gap-2">Amount <SortIcon field="amount" /></div>
                            </th>
                            <th className="px-6 py-4">Pair</th>
                            <th className="px-6 py-4">Rate</th>
                            <th className="px-6 py-4">Platform</th>
                            <th className="px-6 py-4 text-center">Prediction</th>
                            <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors text-right" onClick={() => handleSort('savings')}>
                                <div className="flex items-center justify-end gap-2">Result <SortIcon field="savings" /></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedData.map((t) => (
                            <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 font-mono text-white">
                                    {new Date(t.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-bold text-white">
                                    ${t.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="opacity-50 text-xs">{t.fromCurrency}</span>
                                        <span className="text-gray-600">→</span>
                                        <span className="font-bold text-white">{t.toCurrency}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-300">
                                    {t.rate.toFixed(4)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${t.platform === 'Wise' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            t.platform === 'Skydo' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                        }`}>
                                        {t.platform}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-gray-500 font-mono text-xs">
                                    {t.meridianPrediction.toFixed(4)}
                                </td>
                                <td className="px-6 py-4 text-right font-bold">
                                    <span className={t.isGoodDecision ? 'text-green-400' : 'text-red-400'}>
                                        {t.isGoodDecision ? '+' : '-'}₹{Math.abs(t.savings).toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {transactions.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                    No transactions found. Log your first transfer!
                </div>
            )}
        </div>
    );
}
