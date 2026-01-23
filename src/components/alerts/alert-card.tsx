'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Pause, Play, Trash2, TrendingUp, TrendingDown, Check, Clock, MoreVertical } from 'lucide-react';
import { Alert } from '@/lib/types/alert';
import { useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../../convex/_generated/api";

interface AlertCardProps {
    alert: Alert;
    onUpdate?: () => void;
}

export default function AlertCard({ alert, onUpdate }: AlertCardProps) {
    const [showMenu, setShowMenu] = React.useState(false);

    const toggleStatus = useMutation(api.alerts.toggleAlertStatus);
    const removeAlert = useMutation(api.alerts.deleteAlert);

    const handlePause = async () => {
        await toggleStatus({ alertId: alert.id as any }); // alert.id is string, convex needs Id<"alerts">. Will cast.
        onUpdate?.();
        setShowMenu(false);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this alert?')) {
            await removeAlert({ alertId: alert.id as any });
            onUpdate?.();
        }
        setShowMenu(false);
    };

    const getStatusColor = () => {
        switch (alert.status) {
            case 'active': return 'bg-green-500/20 border-green-500/30 text-green-400';
            case 'paused': return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
            case 'triggered': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
        }
    };

    const getStatusIcon = () => {
        switch (alert.status) {
            case 'active': return <Bell className="w-3 h-3" />;
            case 'paused': return <Pause className="w-3 h-3" />;
            case 'triggered': return <Check className="w-3 h-3" />;
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    const progressPercent = alert.currentRate && alert.targetRate
        ? Math.min(100, Math.max(0, 100 - (Math.abs(alert.currentRate - alert.targetRate) / alert.targetRate) * 100 * 10))
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-500/30 transition-all ${alert.status === 'paused' ? 'opacity-60' : ''
                }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Currency Flags */}
                    <div className="flex items-center -space-x-2">
                        <img
                            src={`https://flagcdn.com/w40/${alert.fromCurrency === 'USD' ? 'us' : alert.fromCurrency === 'EUR' ? 'eu' : alert.fromCurrency === 'GBP' ? 'gb' : alert.fromCurrency === 'INR' ? 'in' : alert.fromCurrency === 'JPY' ? 'jp' : 'us'}.png`}
                            alt={alert.fromCurrency}
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-900 z-10"
                        />
                        <img
                            src={`https://flagcdn.com/w40/${alert.toCurrency === 'USD' ? 'us' : alert.toCurrency === 'EUR' ? 'eu' : alert.toCurrency === 'GBP' ? 'gb' : alert.toCurrency === 'INR' ? 'in' : alert.toCurrency === 'JPY' ? 'jp' : 'us'}.png`}
                            alt={alert.toCurrency}
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-900"
                        />
                    </div>

                    <div>
                        <p className="font-bold text-white">
                            {alert.fromCurrency} → {alert.toCurrency}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${getStatusColor()}`}>
                                {getStatusIcon()}
                                {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-10 w-40 py-2 bg-gray-800 border border-white/10 rounded-xl shadow-xl z-20">
                            {alert.status !== 'triggered' && (
                                <button
                                    onClick={handlePause}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                >
                                    {alert.status === 'paused' ? (
                                        <><Play className="w-4 h-4" /> Resume</>
                                    ) : (
                                        <><Pause className="w-4 h-4" /> Pause</>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Target Info */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    {alert.condition === 'above' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm text-gray-400">
                        Alert when {alert.condition}
                    </span>
                </div>
                <p className="text-3xl font-bold text-white font-syne">
                    {alert.targetRate.toFixed(4)}
                </p>
                {alert.currentRate && (
                    <p className="text-sm text-gray-400 mt-1">
                        Current: {alert.currentRate.toFixed(4)}
                        {alert.distanceToTarget && (
                            <span className={alert.condition === 'above' ? 'text-green-400' : 'text-red-400'}>
                                {' '}({alert.distanceToTarget.toFixed(4)} away)
                            </span>
                        )}
                    </p>
                )}
            </div>

            {/* Progress Bar (for active alerts) */}
            {alert.status === 'active' && (
                <div className="mb-4">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        />
                    </div>
                    {alert.estimatedTimeToTrigger && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            Estimated: {alert.estimatedTimeToTrigger}
                        </div>
                    )}
                </div>
            )}

            {/* Triggered Info */}
            {alert.status === 'triggered' && alert.triggeredAt && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
                    <div className="flex items-center gap-2 text-blue-400 text-sm">
                        <Check className="w-4 h-4" />
                        Triggered {formatTimeAgo(alert.triggeredAt)}
                    </div>
                </div>
            )}

            {/* Note */}
            {alert.note && (
                <p className="text-xs text-gray-500 italic">
                    "{alert.note}"
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500">
                    Created {formatTimeAgo(alert.createdAt)}
                </span>
                {alert.status === 'triggered' && (
                    <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                        Transfer Now →
                    </button>
                )}
            </div>
        </motion.div>
    );
}
