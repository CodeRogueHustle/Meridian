'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Plus, Check, AlertCircle, Zap,
    Clock, Mail, X, ArrowLeft
} from 'lucide-react';
import { Alert } from '@/lib/types/alert';
import AlertCard from '@/components/alerts/alert-card';
import CreateAlertModal from '@/components/alerts/create-alert-modal';
import ProWaitlistDemo from '@/components/alerts/pro-waitlist';

import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";
import { currencyPairs, calculateSavings } from '@/lib/currency-data';
import { Loader2 } from 'lucide-react';

export default function AlertsPage() {
    // Convex Query
    const alertDocs = useQuery(api.alerts.getUserAlerts, {});

    // Client state for UI
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'triggered'>('all');
    const [isChecking, setIsChecking] = useState(false);

    // Convex Mutations
    const updateAlertStatus = useMutation(api.alerts.updateAlertStatus);

    // Live rates for alerts checking
    const activePairs = Array.from(new Set((alertDocs || []).filter((a: any) => a.status === 'active').map((a: any) => a.pair.toUpperCase())));
    // @ts-ignore
    const liveRates = useQuery(api.rates.getLatestRates, { pairs: activePairs });

    const handleCheckAlerts = async () => {
        setIsChecking(true);
        try {
            let triggeredCount = 0;
            const currentAlerts = alerts;

            for (const alert of currentAlerts) {
                if (alert.status !== 'active') continue;

                const pairFormat = `${alert.fromCurrency}/${alert.toCurrency}`.toUpperCase();
                const liveDoc = (liveRates as any[])?.find(r => r && r.pair.toUpperCase() === pairFormat);
                const currentRate = liveDoc?.rate ?? currencyPairs.find(p => p.id === alert.pairId.toLowerCase())?.rate ?? 80;

                const isTriggered = alert.condition === 'above'
                    ? currentRate >= alert.targetRate
                    : currentRate <= alert.targetRate;

                if (isTriggered) {
                    const response = await fetch('/api/send-alert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: alert.email,
                            pair: alert.pairId.toUpperCase(),
                            targetRate: alert.targetRate,
                            currentRate: currentRate,
                            savings: calculateSavings(alert, currentRate)
                        })
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Failed to send email:', errorData);
                    }

                    await updateAlertStatus({
                        alertId: alert.id as any,
                        status: 'triggered',
                        triggeredAt: Date.now(),
                        emailSent: true
                    });

                    triggeredCount++;
                }
            }

            if (triggeredCount > 0) {
                alert(`🎯 Success! ${triggeredCount} alert(s) triggered and notification emails were sent. If you don't see them, check your Spam or Resend dashboard verified domains.`);
            } else {
                alert("ℹ️ No alerts triggered. The current market rates haven't hit your target levels yet.");
            }
        } catch (error) {
            console.error('Error checking alerts:', error);
            alert("❌ Error checking alerts. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };



    // Map Convex docs to application Alert type
    const alerts: Alert[] = (alertDocs || []).map((doc: any) => {
        const [fromCurrency, toCurrency] = (doc.pair || 'USD/INR').split('/');
        return {
            id: doc._id,
            fromCurrency: fromCurrency || 'USD',
            toCurrency: toCurrency || 'INR',
            pairId: doc.pair,
            targetRate: doc.targetRate,
            condition: doc.type, // 'type' in schema mapped to 'condition'
            status: doc.status,
            createdAt: new Date(doc.createdAt),
            triggeredAt: doc.triggeredAt ? new Date(doc.triggeredAt) : undefined,
            notificationMethods: doc.notificationMethods,
            email: doc.email,
            note: doc.note,
            currentRate: doc.currentRate,
            // Calculate pseudo distance if not in DB
            distanceToTarget: Math.abs((doc.currentRate || 0) - doc.targetRate)
        };
    });

    const activeCount = alerts.filter(a => a.status === 'active').length;

    const filteredAlerts = alerts.filter(a => {
        if (filter === 'all') return true;
        return a.status === filter;
    });

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-syne font-bold">Alerts</h1>
                            <p className="text-sm text-gray-400">{activeCount} active alerts</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCheckAlerts}
                            disabled={isChecking || activeCount === 0}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${isChecking
                                ? 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'
                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10 active:scale-95 disabled:opacity-50'
                                }`}
                        >
                            {isChecking ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4 text-yellow-400" />
                            )}
                            Check Now
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Create Alert
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                            <Bell className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Active</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {alerts.filter(a => a.status === 'active').length}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Paused</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {alerts.filter(a => a.status === 'paused').length}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Triggered</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {alerts.filter(a => a.status === 'triggered').length}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        {/* Placeholder for emails sent */}
                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                            <Mail className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Emails Sent</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {alerts.filter(a => (a as any).emailSent).length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {(['all', 'active', 'paused', 'triggered'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${filter === f
                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            {f !== 'all' && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/10 text-xs">
                                    {alerts.filter(a => a.status === f).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Alerts Grid */}
                {!alertDocs ? (
                    <div className="text-center py-16 text-gray-500">Loading alerts...</div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No alerts found</h3>
                        <p className="text-gray-500 mb-6">Create your first alert to get notified when rates hit your target.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-bold"
                        >
                            <Plus className="w-5 h-5" />
                            Create Alert
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
                        {filteredAlerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                )}

                {/* Pro Waitlist Demo */}
                <div className="mt-16 mb-20">
                    <ProWaitlistDemo />
                </div>
            </main>

            {/* Create Alert Modal */}
            <CreateAlertModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            // Trigger refetch implicitly handled by Convex subscription
            />
        </div>
    );
}
